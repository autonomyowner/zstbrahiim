-- Fix: Add overloaded version of create_b2b_notification function
-- This allows calling the function with 6 parameters (without metadata)

CREATE OR REPLACE FUNCTION create_b2b_notification(
    p_user_id UUID,
    p_type b2b_notification_type,
    p_title TEXT,
    p_message TEXT,
    p_offer_id UUID,
    p_response_id UUID
)
RETURNS UUID AS $$
BEGIN
    -- Call the full version with empty metadata
    RETURN create_b2b_notification(
        p_user_id,
        p_type,
        p_title,
        p_message,
        p_offer_id,
        p_response_id,
        '{}'::jsonb
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_b2b_notification(UUID, b2b_notification_type, TEXT, TEXT, UUID, UUID) IS 'Overloaded helper function to create B2B notifications without metadata';
