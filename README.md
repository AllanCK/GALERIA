# 🖼️ Galeria de Arte

**Galeria de Arte** é um sistema web desenvolvido para auxiliar no gerenciamento de uma galeria de arte, permitindo o controle de obras, produtos, clientes e vendas em um ambiente visual e intuitivo.  
O projeto foi construído com **React**, **TailwindCSS** e **Supabase**, unindo modernidade, praticidade e integração em nuvem.

---

## 🚀 Objetivo do Projeto

Criar um sistema completo de gerenciamento para galerias de arte, centralizando informações sobre clientes, obras e vendas, e oferecendo uma interface moderna e acessível para gerentes e vendedores.

---

## 💡 Diferenciais

- Sistema **focado em galerias de arte**, com cadastros específicos para obras e artistas.  
- **Carrossel de imagens** na tela inicial, destacando o acervo da galeria.  
- Design moderno e responsivo com **TailwindCSS**.  
- Estrutura de dados robusta e integrada ao **Supabase**.  
- Autenticação de usuários com diferenciação entre **Gerente** e **Vendedor**.  

---

## ⚙️ Funcionalidades

- 🔑 Login e autenticação via Supabase  
- 👥 Cadastro e gerenciamento de **Clientes**  
- 🖼️ Cadastro e gerenciamento de **Obras de Arte**  
- 🎁 Cadastro e gerenciamento de **Produtos**  
- 💰 Controle completo de **Vendas**  
- 🎂 Cadastro de **Aniversariantes**  
- 🧾 (Em desenvolvimento) **Relatórios** de vendas e desempenho  

---

## 🧩 Tecnologias Utilizadas

| Categoria | Tecnologia |
|------------|-------------|
| Frontend | React + Vite |
| Estilos | TailwindCSS |
| Banco de Dados e Autenticação | Supabase |
| Armazenamento de Imagens | Supabase Buckets (`galeria-assets`) |
| Controle de Versão | Git & GitHub |

---

## 🧠 Aprendizados

Durante o desenvolvimento, foram aprimorados conhecimentos em:
- Integração entre **frontend e banco de dados Supabase**.  
- Uso de **inteligência artificial** para otimizar o desenvolvimento de código.  
- Criação de **layouts modernos e responsivos** com TailwindCSS.  
- Melhoria no entendimento de **autenticação e permissões de acesso** em sistemas web.

---

## 📦 Estrutura do Projeto

```
galeria-arte/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── assets/
│   └── App.jsx
├── public/
├── .env
├── package.json
├── supabase/
│   └── schema.sql
└── README.md
```

---

## 🛠️ Como Executar o Projeto

1. **Clonar o repositório**
   ```bash
   git clone https://github.com/seu-usuario/galeria-arte.git
   ```

2. **Instalar as dependências**
   ```bash
   npm install
   ```

3. **Configurar o arquivo `.env`**
   ```
   VITE_SUPABASE_URL=<sua-url-do-supabase>
   VITE_SUPABASE_ANON_KEY=<sua-chave-anon>
   ```

4. **Executar o projeto**
   ```bash
   npm run dev
   ```

5. **Acessar no navegador**
   ```
   http://localhost:5173
   ```

---

## 📈 Evolução do Projeto

| Etapa | Status |
|-------|--------|
| Login e autenticação | ✅ Concluído |
| Cadastro de clientes | ✅ Concluído |
| Cadastro de obras e produtos | ✅ Concluído |
| Vendas e aniversariantes | ✅ Concluído |
| Relatórios | ⚙️ Em desenvolvimento |
| Níveis de acesso detalhados | ⚙️ Em planejamento |

---

## 📸 Tela Inicial

A tela inicial conta com um **carrossel de imagens** das obras cadastradas, proporcionando uma experiência visual envolvente e representando o acervo da galeria.

---

## 👨‍💻 Desenvolvido por

**Allan Cristian Krause**  
Projeto acadêmico — *Galeria de Arte*  
Tecnologias: React, TailwindCSS, Supabase  
Ano: **2025**

---

## 📝 Licença

Este projeto é distribuído sob a licença **MIT**.  
Sinta-se à vontade para usar, modificar e compartilhar!
