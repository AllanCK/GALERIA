-- Add RLS policies for clientes table
CREATE POLICY "authenticated_users_can_view_clientes"
ON public.clientes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authenticated_users_can_insert_clientes"
ON public.clientes
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "authenticated_users_can_update_clientes"
ON public.clientes
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "authenticated_users_can_delete_clientes"
ON public.clientes
FOR DELETE
TO authenticated
USING (true);

-- Add RLS policies for obras table
CREATE POLICY "authenticated_users_can_view_obras"
ON public.obras
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authenticated_users_can_insert_obras"
ON public.obras
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "authenticated_users_can_update_obras"
ON public.obras
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "authenticated_users_can_delete_obras"
ON public.obras
FOR DELETE
TO authenticated
USING (true);

-- Add RLS policies for produtos table
CREATE POLICY "authenticated_users_can_view_produtos"
ON public.produtos
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authenticated_users_can_insert_produtos"
ON public.produtos
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "authenticated_users_can_update_produtos"
ON public.produtos
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "authenticated_users_can_delete_produtos"
ON public.produtos
FOR DELETE
TO authenticated
USING (true);