-- Drop the old function with CASCADE to remove dependent trigger
DROP FUNCTION IF EXISTS public.handle_auth_user_create() CASCADE;

-- Create the corrected function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into usuarios table with auth_id (UUID) not id (bigint)
  INSERT INTO public.usuarios (auth_id, nome, email, tipo, created_at)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)), 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'tipo', 'vendedor'),
    now()
  )
  ON CONFLICT (auth_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();