-- Create B2B Offers Table
-- This table stores business-to-business offers for the hierarchical marketplace
-- Importateurs create offers for Grossistes, Grossistes create offers for Fournisseurs

-- Create offer type enum
CREATE TYPE b2b_offer_type AS ENUM ('negotiable', 'auction');

-- Create offer status enum
CREATE TYPE b2b_offer_status AS ENUM ('active', 'expired', 'closed', 'sold');

-- Create main b2b_offers table
CREATE TABLE b2b_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

    -- Offer details
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',

    -- Pricing and quantity
    base_price NUMERIC(12, 2) NOT NULL CHECK (base_price > 0),
    min_quantity INTEGER NOT NULL CHECK (min_quantity > 0),
    available_quantity INTEGER NOT NULL CHECK (available_quantity >= 0),

    -- Offer type and status
    offer_type b2b_offer_type NOT NULL DEFAULT 'negotiable',
    status b2b_offer_status NOT NULL DEFAULT 'active',

    -- Auction-specific fields (NULL for negotiable offers)
    current_bid NUMERIC(12, 2) CHECK (current_bid IS NULL OR current_bid >= base_price),
    highest_bidder_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,

    -- Target buyer category (visibility control)
    target_category seller_category NOT NULL,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_auction_dates CHECK (
        offer_type = 'negotiable' OR
        (starts_at IS NOT NULL AND ends_at IS NOT NULL AND ends_at > starts_at)
    ),
    CONSTRAINT valid_auction_fields CHECK (
        offer_type = 'negotiable' OR
        (starts_at IS NOT NULL AND ends_at IS NOT NULL)
    )
);

-- Create indexes for performance
CREATE INDEX idx_b2b_offers_seller_id ON b2b_offers(seller_id);
CREATE INDEX idx_b2b_offers_status ON b2b_offers(status);
CREATE INDEX idx_b2b_offers_target_category ON b2b_offers(target_category);
CREATE INDEX idx_b2b_offers_offer_type ON b2b_offers(offer_type);
CREATE INDEX idx_b2b_offers_ends_at ON b2b_offers(ends_at) WHERE offer_type = 'auction';
CREATE INDEX idx_b2b_offers_created_at ON b2b_offers(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_b2b_offer_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_b2b_offer_updated_at
    BEFORE UPDATE ON b2b_offers
    FOR EACH ROW
    EXECUTE FUNCTION update_b2b_offer_updated_at();

-- Create trigger to auto-expire auction offers
CREATE OR REPLACE FUNCTION check_auction_expiration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.offer_type = 'auction' AND NEW.ends_at <= NOW() AND NEW.status = 'active' THEN
        NEW.status = 'expired';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_auction_expiration
    BEFORE UPDATE ON b2b_offers
    FOR EACH ROW
    EXECUTE FUNCTION check_auction_expiration();

-- Enable Row Level Security
ALTER TABLE b2b_offers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hierarchical visibility

-- 1. Sellers can view their own offers
CREATE POLICY "Sellers can view own offers"
    ON b2b_offers
    FOR SELECT
    USING (auth.uid() = seller_id);

-- 2. Sellers can insert offers (only importateur and grossiste)
CREATE POLICY "Importateurs and Grossistes can create offers"
    ON b2b_offers
    FOR INSERT
    WITH CHECK (
        auth.uid() = seller_id AND
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role = 'seller'
            AND seller_category IN ('importateur', 'grossiste')
        )
    );

-- 3. Sellers can update their own offers
CREATE POLICY "Sellers can update own offers"
    ON b2b_offers
    FOR UPDATE
    USING (auth.uid() = seller_id)
    WITH CHECK (auth.uid() = seller_id);

-- 4. Sellers can delete their own offers
CREATE POLICY "Sellers can delete own offers"
    ON b2b_offers
    FOR DELETE
    USING (auth.uid() = seller_id);

-- 5. Hierarchical visibility for buyers
-- Fournisseurs (retailers) can see offers from Grossistes
CREATE POLICY "Fournisseurs can view Grossiste offers"
    ON b2b_offers
    FOR SELECT
    USING (
        status = 'active' AND
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND seller_category = 'fournisseur'
        ) AND
        target_category = 'fournisseur'
    );

-- Grossistes can see offers from Importateurs
CREATE POLICY "Grossistes can view Importateur offers"
    ON b2b_offers
    FOR SELECT
    USING (
        status = 'active' AND
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND seller_category = 'grossiste'
        ) AND
        target_category = 'grossiste'
    );

-- 6. Admins can see all offers
CREATE POLICY "Admins can view all offers"
    ON b2b_offers
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Add comment to table
COMMENT ON TABLE b2b_offers IS 'B2B marketplace offers for hierarchical business trading between importateurs, grossistes, and fournisseurs';
