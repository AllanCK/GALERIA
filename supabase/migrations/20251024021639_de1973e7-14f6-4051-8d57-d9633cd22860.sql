-- Permitir visualização pública das obras (para tela de login)
CREATE POLICY "public_can_view_obras"
ON public.obras
FOR SELECT
TO anon
USING (true);