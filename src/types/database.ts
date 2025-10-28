export type UserRole = 'gerente' | 'vendedor';

export interface Profile {
  id: number;
  nome: string;
  email: string;
  tipo: UserRole;
  created_at: string;
  auth_id: string | null;
}

export interface Cliente {
  id: number;
  nome: string;
  endereco: string;
  data_nascimento: string;
  telefone: string;
  created_at: string;
}

export interface Obra {
  id: number;
  nome: string;
  numero_identificacao: string;
  colecao: string | null;
  certificado: string | null;
  imagem_path: string | null;
  status: 'cliente' | 'exposicao';
  cliente_id: number | null;
  created_at: string;
}

export interface Produto {
  id: number;
  nome: string;
  tipo_produto: string | null;
  imagem_path: string | null;
  obra_id: number | null;
  quantidade_estoque: number;
  valor: number;
  created_at: string;
}

export interface Venda {
  id: number;
  cliente_id: number;
  vendedor_auth_id: string | null;
  tipo_item: 'obra' | 'produto';
  item_id: number;
  data_venda: string;
  valor_total: number;
  created_at: string;
}
