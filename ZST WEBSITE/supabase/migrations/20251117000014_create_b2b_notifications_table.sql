-- Create B2B Notifications Table
-- This table stores notifications for B2B marketplace events

-- Create notification type enum
CREATE TYPE b2b_notification_type AS ENUM (
    'new_offer',
    'new_bid',
    'outbid',
    'negotiation_submitted',
    'negotiation_accepted',
    'negotiation_rejected',
    'auction_won',
    'auction_lost',
    'auction_ending_soon',
    'offer_expired'
);

-- Create b2b_notifications table
CREATE TABLE b2b_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

    -- Notification details
    type b2b_notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,

    -- Related entities
    offer_id UUID REFERENCES b2b_offers(id) ON DELETE CASCADE,
    response_id UUID REFERENCES b2b_offer_responses(id) ON DELETE CASCADE,

    -- Additional data (JSON for flexibility)
    metadata JSONB DEFAULT '{}',

    -- Status
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Index for quick lookups
    CONSTRAINT check_read_at CHECK (
        (read = FALSE AND read_at IS NULL) OR
        (read = TRUE AND read_at IS NOT NULL)
    )
);

-- Create indexes for performance
CREATE INDEX idx_b2b_notifications_user_id ON b2b_notifications(user_id);
CREATE INDEX idx_b2b_notifications_read ON b2b_notifications(read) WHERE read = FALSE;
CREATE INDEX idx_b2b_notifications_type ON b2b_notifications(type);
CREATE INDEX idx_b2b_notifications_created_at ON b2b_notifications(created_at DESC);
CREATE INDEX idx_b2b_notifications_offer_id ON b2b_notifications(offer_id);

-- Create trigger to set read_at timestamp
CREATE OR REPLACE FUNCTION set_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.read = TRUE AND OLD.read = FALSE THEN
        NEW.read_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_notification_read_at
    BEFORE UPDATE ON b2b_notifications
    FOR EACH ROW
    EXECUTE FUNCTION set_notification_read_at();

-- Enable Row Level Security
ALTER TABLE b2b_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- 1. Users can view their own notifications
CREATE POLICY "Users can view own notifications"
    ON b2b_notifications
    FOR SELECT
    USING (auth.uid() = user_id);

-- 2. System can create notifications (handled by triggers)
CREATE POLICY "System can create notifications"
    ON b2b_notifications
    FOR INSERT
    WITH CHECK (TRUE);

-- 3. Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
    ON b2b_notifications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
    ON b2b_notifications
    FOR DELETE
    USING (auth.uid() = user_id);

-- 5. Admins can manage all notifications
CREATE POLICY "Admins can manage all notifications"
    ON b2b_notifications
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Create function to generate notifications
CREATE OR REPLACE FUNCTION create_b2b_notification(
    p_user_id UUID,
    p_type b2b_notification_type,
    p_title TEXT,
    p_message TEXT,
    p_offer_id UUID DEFAULT NULL,
    p_response_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO b2b_notifications (
        user_id,
        type,
        title,
        message,
        offer_id,
        response_id,
        metadata
    ) VALUES (
        p_user_id,
        p_type,
        p_title,
        p_message,
        p_offer_id,
        p_response_id,
        p_metadata
    ) RETURNING id INTO notification_id;

    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to notify seller when new response is created
CREATE OR REPLACE FUNCTION notify_seller_new_response()
RETURNS TRIGGER AS $$
DECLARE
    seller_id UUID;
    offer_title TEXT;
    buyer_name TEXT;
    notification_title TEXT;
    notification_message TEXT;
BEGIN
    -- Get seller_id and offer title
    SELECT b2b_offers.seller_id, b2b_offers.title
    INTO seller_id, offer_title
    FROM b2b_offers
    WHERE b2b_offers.id = NEW.offer_id;

    -- Get buyer name
    SELECT full_name INTO buyer_name
    FROM user_profiles
    WHERE id = NEW.buyer_id;

    -- Create appropriate notification based on response type
    IF NEW.response_type = 'bid' THEN
        notification_title = 'New Bid Received';
        notification_message = buyer_name || ' placed a bid of ' || NEW.amount || ' DZD on your offer: ' || offer_title;
    ELSE
        notification_title = 'New Negotiation';
        notification_message = buyer_name || ' submitted a negotiation for ' || NEW.quantity || ' units at ' || NEW.amount || ' DZD on: ' || offer_title;
    END IF;

    -- Create notification for seller
    PERFORM create_b2b_notification(
        seller_id,
        CASE WHEN NEW.response_type = 'bid' THEN 'new_bid' ELSE 'negotiation_submitted' END,
        notification_title,
        notification_message,
        NEW.offer_id,
        NEW.id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_seller_new_response
    AFTER INSERT ON b2b_offer_responses
    FOR EACH ROW
    EXECUTE FUNCTION notify_seller_new_response();

-- Create trigger to notify buyer when response status changes
CREATE OR REPLACE FUNCTION notify_buyer_response_status()
RETURNS TRIGGER AS $$
DECLARE
    offer_title TEXT;
    notification_title TEXT;
    notification_message TEXT;
    notification_type b2b_notification_type;
BEGIN
    -- Only notify on status changes
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Get offer title
    SELECT title INTO offer_title
    FROM b2b_offers
    WHERE id = NEW.offer_id;

    -- Determine notification based on new status
    CASE NEW.status
        WHEN 'accepted' THEN
            IF NEW.response_type = 'bid' THEN
                notification_type = 'auction_won';
                notification_title = 'Auction Won!';
                notification_message = 'Congratulations! You won the auction for: ' || offer_title;
            ELSE
                notification_type = 'negotiation_accepted';
                notification_title = 'Negotiation Accepted';
                notification_message = 'Your negotiation has been accepted for: ' || offer_title;
            END IF;

        WHEN 'rejected' THEN
            notification_type = 'negotiation_rejected';
            notification_title = 'Negotiation Rejected';
            notification_message = 'Your negotiation was rejected for: ' || offer_title;

        WHEN 'outbid' THEN
            notification_type = 'outbid';
            notification_title = 'You Have Been Outbid';
            notification_message = 'Another bidder has placed a higher bid on: ' || offer_title;

        ELSE
            RETURN NEW;
    END CASE;

    -- Create notification for buyer
    PERFORM create_b2b_notification(
        NEW.buyer_id,
        notification_type,
        notification_title,
        notification_message,
        NEW.offer_id,
        NEW.id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_buyer_response_status
    AFTER UPDATE ON b2b_offer_responses
    FOR EACH ROW
    EXECUTE FUNCTION notify_buyer_response_status();

-- Create function to notify about expiring auctions (to be called by a scheduled job)
CREATE OR REPLACE FUNCTION notify_expiring_auctions()
RETURNS INTEGER AS $$
DECLARE
    auction RECORD;
    bidder_ids UUID[];
    bidder_id UUID;
    notification_count INTEGER := 0;
BEGIN
    -- Find auctions ending in the next hour that haven't been notified
    FOR auction IN
        SELECT o.id, o.title, o.seller_id, o.ends_at
        FROM b2b_offers o
        WHERE o.offer_type = 'auction'
          AND o.status = 'active'
          AND o.ends_at BETWEEN NOW() AND NOW() + INTERVAL '1 hour'
          AND NOT EXISTS (
              SELECT 1 FROM b2b_notifications n
              WHERE n.offer_id = o.id
                AND n.type = 'auction_ending_soon'
                AND n.created_at > NOW() - INTERVAL '2 hours'
          )
    LOOP
        -- Get all bidders for this auction
        SELECT ARRAY_AGG(DISTINCT buyer_id)
        INTO bidder_ids
        FROM b2b_offer_responses
        WHERE offer_id = auction.id
          AND response_type = 'bid';

        -- Notify each bidder
        IF bidder_ids IS NOT NULL THEN
            FOREACH bidder_id IN ARRAY bidder_ids
            LOOP
                PERFORM create_b2b_notification(
                    bidder_id,
                    'auction_ending_soon',
                    'Auction Ending Soon',
                    'The auction for "' || auction.title || '" ends in less than 1 hour!',
                    auction.id,
                    NULL
                );
                notification_count := notification_count + 1;
            END LOOP;
        END IF;

        -- Notify seller
        PERFORM create_b2b_notification(
            auction.seller_id,
            'auction_ending_soon',
            'Your Auction Ending Soon',
            'Your auction "' || auction.title || '" ends in less than 1 hour!',
            auction.id,
            NULL
        );
        notification_count := notification_count + 1;
    END LOOP;

    RETURN notification_count;
END;
$$ LANGUAGE plpgsql;

-- Create view for unread notification count per user
CREATE OR REPLACE VIEW b2b_unread_notification_counts AS
SELECT
    user_id,
    COUNT(*) AS unread_count
FROM b2b_notifications
WHERE read = FALSE
GROUP BY user_id;

-- Add comments
COMMENT ON TABLE b2b_notifications IS 'Notifications for B2B marketplace events (bids, negotiations, acceptances, etc.)';
COMMENT ON FUNCTION create_b2b_notification IS 'Helper function to create B2B notifications';
COMMENT ON FUNCTION notify_expiring_auctions IS 'Scheduled function to notify users about auctions ending soon';
COMMENT ON VIEW b2b_unread_notification_counts IS 'View of unread notification counts per user';
