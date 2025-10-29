-- Inserir mais obras de arte, algumas com status cliente
INSERT INTO obras (nome, numero_identificacao, colecao, certificado, imagem_path, status, cliente_id) VALUES
('Fluidez Dourada', 'OA-2024-009', 'Coleção Contemporânea', 'CERT-2024-009', '/obras/obra-abstrata-02.jpg', 'cliente', 1),
('Dama Elegante', 'OA-2024-010', 'Coleção Retratos', 'CERT-2024-010', '/obras/obra-retrato-02.jpg', 'cliente', 3),
('Costeira Serena', 'OA-2024-011', 'Coleção Impressionista', 'CERT-2024-011', '/obras/obra-paisagem-02.jpg', 'exposicao', NULL),
('Ícone Moderno', 'OA-2024-012', 'Coleção Pop Art', 'CERT-2024-012', '/obras/obra-pop-art-01.jpg', 'cliente', 5),
('Fragmentos', 'OA-2024-013', 'Coleção Cubista', 'CERT-2024-013', '/obras/obra-cubista-01.jpg', 'exposicao', NULL),
('Campos de Lavanda', 'OA-2024-014', 'Coleção Romântica', 'CERT-2024-014', '/obras/obra-romantica-01.jpg', 'cliente', 8);