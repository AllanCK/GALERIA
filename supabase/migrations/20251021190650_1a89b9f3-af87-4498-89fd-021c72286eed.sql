-- Fix search_path for existing security definer functions

-- Update promote_to_gerente function
CREATE OR REPLACE FUNCTION public.promote_to_gerente(target_uuid uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.usuarios SET tipo = 'gerente' WHERE auth_id = target_uuid;
$$;

-- Drop and recreate current_user_profile function with correct return type
DROP FUNCTION IF EXISTS public.current_user_profile();

CREATE OR REPLACE FUNCTION public.current_user_profile()
RETURNS TABLE(id bigint, nome text, email text, tipo text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id, u.nome, u.email, u.tipo
  FROM public.usuarios u
  WHERE u.auth_id = auth.uid();
$$;

-- Update sync_user_to_usuarios function
CREATE OR REPLACE FUNCTION public.sync_user_to_usuarios(
  p_auth_id uuid, 
  p_email text, 
  p_nome text, 
  p_tipo text DEFAULT 'vendedor'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.usuarios WHERE auth_id = p_auth_id) THEN
    INSERT INTO public.usuarios (auth_id, email, nome, tipo) 
    VALUES (p_auth_id, p_email, p_nome, p_tipo);
  END IF;
END;
$$;