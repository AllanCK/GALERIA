-- Add new columns to obras table for better art management
ALTER TABLE public.obras 
ADD COLUMN IF NOT EXISTS numero_identificacao TEXT,
ADD COLUMN IF NOT EXISTS colecao TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'exposicao' CHECK (status IN ('cliente', 'exposicao'));

-- Create index for better performance on numero_identificacao
CREATE INDEX IF NOT EXISTS idx_obras_numero_identificacao ON public.obras(numero_identificacao);

-- Update existing obras to have a unique identifier if they don't have one
UPDATE public.obras 
SET numero_identificacao = 'OBRA-' || LPAD(id::TEXT, 6, '0')
WHERE numero_identificacao IS NULL;