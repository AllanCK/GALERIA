-- ====================================
-- GALERIA DE ARTE - DATABASE SETUP
-- ====================================

-- 1. Criar tipo enum para roles de usuário
CREATE TYPE user_role AS ENUM ('gerente', 'vendedor');

-- 2. Criar tabela de usuários (perfis)
CREATE TABLE public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  tipo user_role NOT NULL DEFAULT 'vendedor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de clientes
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  endereco TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  telefone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de obras de arte
CREATE TABLE public.obras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  certificado TEXT NOT NULL,
  imagem TEXT NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela de produtos
CREATE TABLE public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  imagem TEXT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Criar tipo enum para tipo de item vendido
CREATE TYPE tipo_item_venda AS ENUM ('obra', 'produto');

-- 7. Criar tabela de vendas
CREATE TABLE public.vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  vendedor_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
  tipo_item tipo_item_venda NOT NULL,
  item_id UUID NOT NULL,
  data_venda TIMESTAMP WITH TIME ZONE NOT NULL,
  valor_total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;

-- Políticas para USUARIOS
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.usuarios FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.usuarios FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para CLIENTES (todos os usuários autenticados podem acessar)
CREATE POLICY "Usuários autenticados podem ver clientes"
  ON public.clientes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar clientes"
  ON public.clientes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar clientes"
  ON public.clientes FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar clientes"
  ON public.clientes FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para OBRAS (todos os usuários autenticados podem acessar)
CREATE POLICY "Usuários autenticados podem ver obras"
  ON public.obras FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar obras"
  ON public.obras FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar obras"
  ON public.obras FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar obras"
  ON public.obras FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para PRODUTOS (todos os usuários autenticados podem acessar)
CREATE POLICY "Usuários autenticados podem ver produtos"
  ON public.produtos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar produtos"
  ON public.produtos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar produtos"
  ON public.produtos FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar produtos"
  ON public.produtos FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para VENDAS (todos os usuários autenticados podem acessar)
CREATE POLICY "Usuários autenticados podem ver vendas"
  ON public.vendas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar vendas"
  ON public.vendas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar vendas"
  ON public.vendas FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar vendas"
  ON public.vendas FOR DELETE
  TO authenticated
  USING (true);

-- ====================================
-- TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE
-- ====================================

-- Função para criar perfil quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, email, tipo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'tipo')::user_role, 'vendedor')
  );
  RETURN NEW;
END;
$$;

-- Trigger para executar a função quando um novo usuário é criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ====================================
-- STORAGE BUCKETS
-- ====================================

-- Criar bucket para imagens de obras
INSERT INTO storage.buckets (id, name, public)
VALUES ('obras', 'obras', true)
ON CONFLICT (id) DO NOTHING;

-- Criar bucket para imagens de produtos
INSERT INTO storage.buckets (id, name, public)
VALUES ('produtos', 'produtos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para OBRAS
CREATE POLICY "Usuários autenticados podem fazer upload de imagens de obras"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'obras');

CREATE POLICY "Imagens de obras são públicas"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'obras');

CREATE POLICY "Usuários autenticados podem deletar imagens de obras"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'obras');

-- Políticas de storage para PRODUTOS
CREATE POLICY "Usuários autenticados podem fazer upload de imagens de produtos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'produtos');

CREATE POLICY "Imagens de produtos são públicas"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'produtos');

CREATE POLICY "Usuários autenticados podem deletar imagens de produtos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'produtos');

-- ====================================
-- ÍNDICES PARA PERFORMANCE
-- ====================================

CREATE INDEX idx_clientes_nome ON public.clientes(nome);
CREATE INDEX idx_clientes_data_nascimento ON public.clientes(data_nascimento);
CREATE INDEX idx_obras_cliente_id ON public.obras(cliente_id);
CREATE INDEX idx_vendas_cliente_id ON public.vendas(cliente_id);
CREATE INDEX idx_vendas_vendedor_id ON public.vendas(vendedor_id);
CREATE INDEX idx_vendas_data_venda ON public.vendas(data_venda);
