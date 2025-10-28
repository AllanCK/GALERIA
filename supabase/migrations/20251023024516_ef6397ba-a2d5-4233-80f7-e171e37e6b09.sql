-- Drop the problematic policies
DROP POLICY IF EXISTS "select_usuarios_if_gerente" ON public.usuarios;
DROP POLICY IF EXISTS "select_self_usuario" ON public.usuarios;

-- Create a security definer function to check if user is gerente
-- This avoids RLS recursion
CREATE OR REPLACE FUNCTION public.is_user_gerente(user_auth_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.usuarios
    WHERE auth_id = user_auth_id
    AND tipo = 'gerente'
  );
$$;

-- Allow users to see their own record
CREATE POLICY "Users can view their own profile"
ON public.usuarios
FOR SELECT
TO authenticated
USING (auth.uid() = auth_id);

-- Allow gerentes to view all users using the security definer function
CREATE POLICY "Gerentes can view all profiles"
ON public.usuarios
FOR SELECT
TO authenticated
USING (public.is_user_gerente(auth.uid()));