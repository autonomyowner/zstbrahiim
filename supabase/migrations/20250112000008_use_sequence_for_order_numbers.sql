-- Use a sequence-based approach for order numbers to prevent race conditions
-- This is the most reliable way to generate unique sequential numbers

-- Create a sequence for each year (we'll handle year changes in the function)
CREATE SEQUENCE IF NOT EXISTS order_number_seq_2025 START 1;

-- Improved function that uses a sequence for guaranteed uniqueness
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  year_part TEXT;
  seq_name TEXT;
  counter INTEGER;
BEGIN
  year_part := to_char(CURRENT_DATE, 'YYYY');
  seq_name := 'order_number_seq_' || year_part;

  -- Create sequence for current year if it doesn't exist
  BEGIN
    EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %I START 1', seq_name);
  EXCEPTION WHEN OTHERS THEN
    -- Sequence already exists, continue
  END;

  -- Get next value from the sequence (atomic operation, no race condition)
  EXECUTE format('SELECT nextval(%L)', seq_name) INTO counter;

  -- Generate order number with the sequence value
  NEW.order_number := 'ORD-' || year_part || '-' || lpad(counter::TEXT, 3, '0');

  RETURN NEW;
END;
$function$;
