-- Create B2B Helper Views and Functions
-- This migration adds useful views and functions for the B2B marketplace

-- Create comprehensive view of offers with seller details
CREATE OR REPLACE VIEW b2b_offers_with_details AS
SELECT
    o.*,
    u.full_name AS seller_name,
    u.seller_category AS seller_category,
    u.email AS seller_email,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'pending') AS pending_responses_count,
    COUNT(DISTINCT r.id) AS total_responses_count,
    MAX(r.amount) FILTER (WHERE r.response_type = 'bid') AS highest_bid_amount,
    CASE
        WHEN o.offer_type = 'auction' AND o.ends_at <= NOW() THEN 'expired'
        WHEN o.offer_type = 'auction' AND o.ends_at <= NOW() + INTERVAL '24 hours' THEN 'ending_soon'
        ELSE o.status::TEXT
    END AS display_status,
    CASE
        WHEN o.offer_type = 'auction' THEN
            EXTRACT(EPOCH FROM (o.ends_at - NOW()))
        ELSE NULL
    END AS seconds_remaining
FROM b2b_offers o
LEFT JOIN user_profiles u ON o.seller_id = u.id
LEFT JOIN b2b_offer_responses r ON o.id = r.offer_id
GROUP BY o.id, u.full_name, u.seller_category, u.email;

-- Create view for seller statistics
CREATE OR REPLACE VIEW b2b_seller_statistics AS
SELECT
    u.id AS seller_id,
    u.full_name AS seller_name,
    u.seller_category,
    COUNT(DISTINCT o.id) AS total_offers,
    COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'active') AS active_offers,
    COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'sold') AS sold_offers,
    COALESCE(SUM(o.base_price * o.available_quantity) FILTER (WHERE o.status = 'active'), 0) AS total_active_value,
    COALESCE(AVG(r.amount), 0) AS avg_response_amount,
    COUNT(DISTINCT r.id) AS total_responses,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'pending') AS pending_responses,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'accepted') AS accepted_responses,
    CASE
        WHEN COUNT(DISTINCT r.id) > 0
        THEN ROUND((COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'accepted')::NUMERIC / COUNT(DISTINCT r.id)::NUMERIC) * 100, 2)
        ELSE 0
    END AS acceptance_rate
FROM user_profiles u
LEFT JOIN b2b_offers o ON u.id = o.seller_id
LEFT JOIN b2b_offer_responses r ON o.id = r.offer_id
WHERE u.role = 'seller' AND u.seller_category IN ('importateur', 'grossiste')
GROUP BY u.id, u.full_name, u.seller_category;

-- Create view for buyer activity
CREATE OR REPLACE VIEW b2b_buyer_activity AS
SELECT
    u.id AS buyer_id,
    u.full_name AS buyer_name,
    u.seller_category AS buyer_category,
    COUNT(DISTINCT r.id) AS total_responses,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'pending') AS pending_responses,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'accepted') AS won_responses,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'outbid') AS outbid_count,
    COALESCE(SUM(r.amount * r.quantity) FILTER (WHERE r.status = 'accepted'), 0) AS total_won_value,
    COALESCE(AVG(r.amount), 0) AS avg_bid_amount
FROM user_profiles u
LEFT JOIN b2b_offer_responses r ON u.id = r.buyer_id
WHERE u.role = 'seller'
GROUP BY u.id, u.full_name, u.seller_category;

-- Function to get available offers for a specific buyer
CREATE OR REPLACE FUNCTION get_available_offers_for_buyer(buyer_user_id UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    base_price NUMERIC,
    current_bid NUMERIC,
    available_quantity INTEGER,
    offer_type b2b_offer_type,
    status b2b_offer_status,
    ends_at TIMESTAMPTZ,
    seller_name TEXT,
    seller_category seller_category,
    seconds_remaining NUMERIC,
    display_status TEXT,
    has_user_responded BOOLEAN
) AS $$
DECLARE
    buyer_category seller_category;
BEGIN
    -- Get buyer's category
    SELECT up.seller_category INTO buyer_category
    FROM user_profiles up
    WHERE up.id = buyer_user_id;

    -- Return offers available for this buyer
    RETURN QUERY
    SELECT
        o.id,
        o.title,
        o.description,
        o.base_price,
        o.current_bid,
        o.available_quantity,
        o.offer_type,
        o.status,
        o.ends_at,
        o.seller_name,
        o.seller_category,
        o.seconds_remaining,
        o.display_status,
        EXISTS (
            SELECT 1 FROM b2b_offer_responses r
            WHERE r.offer_id = o.id
            AND r.buyer_id = buyer_user_id
            AND r.status = 'pending'
        ) AS has_user_responded
    FROM b2b_offers_with_details o
    WHERE o.status = 'active'
      AND o.target_category = buyer_category
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to close auction and mark winner
CREATE OR REPLACE FUNCTION close_auction(auction_offer_id UUID)
RETURNS JSONB AS $$
DECLARE
    auction RECORD;
    winner RECORD;
    result JSONB;
BEGIN
    -- Get auction details
    SELECT * INTO auction
    FROM b2b_offers
    WHERE id = auction_offer_id
      AND offer_type = 'auction'
      AND status = 'active';

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'Auction not found or not active'
        );
    END IF;

    -- Check if auction has ended
    IF auction.ends_at > NOW() THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'Auction has not ended yet'
        );
    END IF;

    -- Get highest bidder
    SELECT r.*, u.full_name AS winner_name
    INTO winner
    FROM b2b_offer_responses r
    JOIN user_profiles u ON r.buyer_id = u.id
    WHERE r.offer_id = auction_offer_id
      AND r.response_type = 'bid'
      AND r.status = 'pending'
    ORDER BY r.amount DESC
    LIMIT 1;

    IF FOUND THEN
        -- Mark winner's bid as accepted
        UPDATE b2b_offer_responses
        SET status = 'accepted'
        WHERE id = winner.id;

        -- Mark other bids as rejected
        UPDATE b2b_offer_responses
        SET status = 'rejected'
        WHERE offer_id = auction_offer_id
          AND id != winner.id
          AND response_type = 'bid'
          AND status = 'pending';

        -- Mark offer as sold
        UPDATE b2b_offers
        SET status = 'sold'
        WHERE id = auction_offer_id;

        result = jsonb_build_object(
            'success', TRUE,
            'winner_id', winner.buyer_id,
            'winner_name', winner.winner_name,
            'winning_bid', winner.amount,
            'quantity', winner.quantity
        );
    ELSE
        -- No bids, mark as expired
        UPDATE b2b_offers
        SET status = 'expired'
        WHERE id = auction_offer_id;

        result = jsonb_build_object(
            'success', TRUE,
            'winner_id', NULL,
            'message', 'Auction closed with no bids'
        );
    END IF;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-close expired auctions (to be called periodically)
CREATE OR REPLACE FUNCTION auto_close_expired_auctions()
RETURNS JSONB AS $$
DECLARE
    auction RECORD;
    closed_count INTEGER := 0;
    results JSONB := '[]'::JSONB;
    close_result JSONB;
BEGIN
    -- Find all expired active auctions
    FOR auction IN
        SELECT id, title, ends_at
        FROM b2b_offers
        WHERE offer_type = 'auction'
          AND status = 'active'
          AND ends_at <= NOW()
    LOOP
        -- Close each auction
        close_result = close_auction(auction.id);

        -- Add to results
        results = results || jsonb_build_object(
            'offer_id', auction.id,
            'title', auction.title,
            'result', close_result
        );

        closed_count := closed_count + 1;
    END LOOP;

    RETURN jsonb_build_object(
        'success', TRUE,
        'closed_count', closed_count,
        'results', results
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept a negotiation
CREATE OR REPLACE FUNCTION accept_negotiation(response_id UUID)
RETURNS JSONB AS $$
DECLARE
    response RECORD;
    offer RECORD;
BEGIN
    -- Get response details
    SELECT * INTO response
    FROM b2b_offer_responses
    WHERE id = response_id
      AND response_type = 'negotiation'
      AND status = 'pending';

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'Negotiation not found or not pending'
        );
    END IF;

    -- Get offer details
    SELECT * INTO offer
    FROM b2b_offers
    WHERE id = response.offer_id
      AND status = 'active';

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'Offer not found or not active'
        );
    END IF;

    -- Check if requested quantity is available
    IF response.quantity > offer.available_quantity THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'Requested quantity exceeds available quantity'
        );
    END IF;

    -- Accept this negotiation
    UPDATE b2b_offer_responses
    SET status = 'accepted'
    WHERE id = response_id;

    -- Reject all other pending negotiations for this offer
    UPDATE b2b_offer_responses
    SET status = 'rejected'
    WHERE offer_id = response.offer_id
      AND id != response_id
      AND response_type = 'negotiation'
      AND status = 'pending';

    -- Update offer: reduce available quantity or mark as sold
    IF response.quantity >= offer.available_quantity THEN
        -- All quantity sold
        UPDATE b2b_offers
        SET status = 'sold',
            available_quantity = 0
        WHERE id = response.offer_id;
    ELSE
        -- Partial quantity sold
        UPDATE b2b_offers
        SET available_quantity = available_quantity - response.quantity
        WHERE id = response.offer_id;
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'buyer_id', response.buyer_id,
        'quantity', response.quantity,
        'amount', response.amount
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get offer statistics
CREATE OR REPLACE FUNCTION get_offer_statistics(offer_id UUID)
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_responses', COUNT(*),
        'pending_responses', COUNT(*) FILTER (WHERE status = 'pending'),
        'accepted_responses', COUNT(*) FILTER (WHERE status = 'accepted'),
        'rejected_responses', COUNT(*) FILTER (WHERE status = 'rejected'),
        'highest_bid', MAX(amount) FILTER (WHERE response_type = 'bid'),
        'lowest_bid', MIN(amount) FILTER (WHERE response_type = 'bid'),
        'avg_bid', AVG(amount) FILTER (WHERE response_type = 'bid'),
        'unique_bidders', COUNT(DISTINCT buyer_id)
    ) INTO stats
    FROM b2b_offer_responses
    WHERE b2b_offer_responses.offer_id = get_offer_statistics.offer_id;

    RETURN COALESCE(stats, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON VIEW b2b_offers_with_details IS 'Comprehensive view of offers with seller details and response statistics';
COMMENT ON VIEW b2b_seller_statistics IS 'Statistics for sellers including offer counts, values, and response rates';
COMMENT ON VIEW b2b_buyer_activity IS 'Activity metrics for buyers including bids, wins, and spending';
COMMENT ON FUNCTION get_available_offers_for_buyer IS 'Gets all available offers for a specific buyer based on their category';
COMMENT ON FUNCTION close_auction IS 'Closes an auction, determines winner, and updates statuses';
COMMENT ON FUNCTION auto_close_expired_auctions IS 'Automatically closes all expired auctions (to be run periodically)';
COMMENT ON FUNCTION accept_negotiation IS 'Accepts a negotiation response and updates offer status';
COMMENT ON FUNCTION get_offer_statistics IS 'Returns statistics for a specific offer';
