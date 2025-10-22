-- Add missing columns to produtos table
ALTER TABLE public.produtos
ADD COLUMN IF NOT EXISTS tipo_produto TEXT,
ADD COLUMN IF NOT EXISTS obra_id BIGINT REFERENCES public.obras(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS quantidade_estoque INTEGER DEFAULT 0 NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_produtos_obra_id ON public.produtos(obra_id);