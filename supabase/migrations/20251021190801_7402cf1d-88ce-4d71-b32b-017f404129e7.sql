-- Recreate the aniversariantes_do_dia view without SECURITY DEFINER
DROP VIEW IF EXISTS public.aniversariantes_do_dia;

CREATE VIEW public.aniversariantes_do_dia AS
SELECT 
  id,
  nome,
  telefone,
  endereco,
  data_nascimento
FROM public.clientes
WHERE EXTRACT(MONTH FROM data_nascimento) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND EXTRACT(DAY FROM data_nascimento) = EXTRACT(DAY FROM CURRENT_DATE);