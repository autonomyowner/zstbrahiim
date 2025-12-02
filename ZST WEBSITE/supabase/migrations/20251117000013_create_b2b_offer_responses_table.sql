-- Create B2B Offer Responses Table
-- This table stores buyer responses to offers (bids for auctions, negotiations for negotiable offers)

-- Create response type enum
CREATE TYPE b2b_response_type AS ENUM ('bid', 'negotiation');

-- Create response status enum
CREATE TYPE b2b_response_status AS ENUM ('pending', 'accepted', 'rejected', 'outbid', 'withdrawn');

-- Create b2b_offer_responses table
CREATE TABLE b2b_offer_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES b2b_offers(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

    -- Response details
    response_type b2b_response_type NOT NULL,
    status b2b_response_status NOT NULL DEFAULT 'pending',

    -- Bid/Negotiation amounts
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),

    -- Optional message for negotiations
    message TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate active bids/negotiations from same buyer
    CONSTRAINT unique_active_buyer_response UNIQUE (offer_id, buyer_id, status)
);

-- Create indexes for performance
CREATE INDEX idx_b2b_responses_offer_id ON b2b_offer_responses(offer_id);
CREATE INDEX idx_b2b_responses_buyer_id ON b2b_offer_responses(buyer_id);
CREATE INDEX idx_b2b_responses_status ON b2b_offer_responses(status);
CREATE INDEX idx_b2b_responses_created_at ON b2b_offer_responses(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_b2b_response_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_b2b_response_updated_at
    BEFORE UPDATE ON b2b_offer_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_b2b_response_updated_at();

-- Create trigger to update offer's current_bid when a higher bid is placed
CREATE OR REPLACE FUNCTION update_offer_current_bid()
RETURNS TRIGGER AS $$
DECLARE
    offer_current_bid NUMERIC;
    offer_type b2b_offer_type;
BEGIN
    -- Get current offer details
    SELECT current_bid, b2b_offers.offer_type
    INTO offer_current_bid, offer_type
    FROM b2b_offers
    WHERE id = NEW.offer_id;

    -- Only update if this is a bid for an auction and it's higher than current
    IF NEW.response_type = 'bid' AND offer_type = 'auction' THEN
        IF offer_current_bid IS NULL OR NEW.amount > offer_current_bid THEN
            -- Update the offer with new highest bid
            UPDATE b2b_offers
            SET current_bid = NEW.amount,
                highest_bidder_id = NEW.buyer_id
            WHERE id = NEW.offer_id;

            -- Mark previous highest bid as outbid
            UPDATE b2b_offer_responses
            SET status = 'outbid'
            WHERE offer_id = NEW.offer_id
              AND buyer_id != NEW.buyer_id
              AND response_type = 'bid'
              AND status = 'pending';
        ELSE
            -- Bid is not higher than current, reject it
            NEW.status = 'rejected';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_offer_current_bid
    AFTER INSERT ON b2b_offer_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_offer_current_bid();

-- Create trigger to validate buyer's seller_category matches offer's target_category
CREATE OR REPLACE FUNCTION validate_buyer_category()
RETURNS TRIGGER AS $$
DECLARE
    buyer_category seller_category;
    offer_target seller_category;
BEGIN
    -- Get buyer's seller_category
    SELECT seller_category INTO buyer_category
    FROM user_profiles
    WHERE id = NEW.buyer_id;

    -- Get offer's target_category
    SELECT target_category INTO offer_target
    FROM b2b_offers
    WHERE id = NEW.offer_id;

    -- Validate that buyer category matches offer target
    IF buyer_category != offer_target THEN
        RAISE EXCEPTION 'Buyer category (%) does not match offer target category (%)', buyer_category, offer_target;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_buyer_category
    BEFORE INSERT ON b2b_offer_responses
    FOR EACH ROW
    EXECUTE FUNCTION validate_buyer_category();

-- Enable Row Level Security
ALTER TABLE b2b_offer_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- 1. Buyers can view their own responses
CREATE POLICY "Buyers can view own responses"
    ON b2b_offer_responses
    FOR SELECT
    USING (auth.uid() = buyer_id);

-- 2. Offer sellers can view all responses to their offers
CREATE POLICY "Sellers can view responses to their offers"
    ON b2b_offer_responses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM b2b_offers
            WHERE b2b_offers.id = b2b_offer_responses.offer_id
            AND b2b_offers.seller_id = auth.uid()
        )
    );

-- 3. Authenticated buyers can create responses
CREATE POLICY "Buyers can create responses"
    ON b2b_offer_responses
    FOR INSERT
    WITH CHECK (
        auth.uid() = buyer_id AND
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role = 'seller'
        )
    );

-- 4. Buyers can update their own pending responses (withdraw)
CREATE POLICY "Buyers can update own pending responses"
    ON b2b_offer_responses
    FOR UPDATE
    USING (auth.uid() = buyer_id AND status = 'pending')
    WITH CHECK (auth.uid() = buyer_id);

-- 5. Offer sellers can update responses (accept/reject)
CREATE POLICY "Sellers can update responses to their offers"
    ON b2b_offer_responses
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM b2b_offers
            WHERE b2b_offers.id = b2b_offer_responses.offer_id
            AND b2b_offers.seller_id = auth.uid()
        )
    );

-- 6. Admins can view and manage all responses
CREATE POLICY "Admins can manage all responses"
    ON b2b_offer_responses
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Create view for active responses with offer and user details
CREATE OR REPLACE VIEW b2b_responses_with_details AS
SELECT
    r.*,
    o.title AS offer_title,
    o.seller_id AS seller_id,
    o.offer_type,
    o.status AS offer_status,
    buyer.full_name AS buyer_name,
    buyer.seller_category AS buyer_category,
    seller.full_name AS seller_name,
    seller.seller_category AS seller_category
FROM b2b_offer_responses r
JOIN b2b_offers o ON r.offer_id = o.id
JOIN user_profiles buyer ON r.buyer_id = buyer.id
JOIN user_profiles seller ON o.seller_id = seller.id;

-- Add comments
COMMENT ON TABLE b2b_offer_responses IS 'Buyer responses to B2B offers (bids for auctions, negotiations for negotiable offers)';
COMMENT ON VIEW b2b_responses_with_details IS 'View of responses with offer and user details for easy querying';
