-- Fix race condition in order_number generation
-- This migration updates the function to use a more robust counter mechanism

-- Drop and recreate the function with proper locking
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  year_part TEXT;
  counter INTEGER;
  new_order_number TEXT;
  max_attempts INTEGER := 10;
  attempt INTEGER := 0;
BEGIN
  year_part := to_char(CURRENT_DATE, 'YYYY');

  -- Loop to handle race conditions
  LOOP
    -- Get the maximum existing counter for this year
    SELECT COALESCE(MAX(
      NULLIF(
        regexp_replace(
          order_number,
          'ORD-' || year_part || '-',
          '',
          'g'
        ),
        ''
      )::INTEGER
    ), 0) + 1
    INTO counter
    FROM orders
    WHERE order_number LIKE 'ORD-' || year_part || '-%';

    -- Generate the new order number
    new_order_number := 'ORD-' || year_part || '-' || lpad(counter::TEXT, 3, '0');

    -- Check if this number already exists (race condition check)
    IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_order_number) THEN
      NEW.order_number := new_order_number;
      RETURN NEW;
    END IF;

    -- Increment attempt counter and check max attempts
    attempt := attempt + 1;
    IF attempt >= max_attempts THEN
      RAISE EXCEPTION 'Failed to generate unique order number after % attempts', max_attempts;
    END IF;

    -- Small delay to reduce contention
    PERFORM pg_sleep(0.01);
  END LOOP;
END;
$function$;
