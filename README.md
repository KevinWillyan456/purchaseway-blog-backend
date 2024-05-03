# Purchaseway Blog Backend

Este é o backend em Node.js com TypeScript desenvolvido para suportar um aplicativo web de rede social feito com React. O backend oferece uma variedade de funcionalidades essenciais para o funcionamento do aplicativo, incluindo gerenciamento de usuários, autenticação, publicação de conteúdo e interação social. Ele foi desenvolvido utilizando as seguintes tecnologias: Node.js com TypeScript, Express, MongoDB, Mongoose, Bcryptjs, Cors, Jsonwebtoken e Uuid. O link de acesso para o repositório do frontend é: [purchaseway-blog](https://github.com/KevinWillyan456/purchaseway-blog)

## Como fazer a instalação local

Antes de começar, certifique-se de ter o Node.js e o MongoDB instalados em sua máquina. Além disso, você pode usar como alternativa o MongoDB Atlas.

1. Clone o repositório:

   ```bash
   git clone https://github.com/KevinWillyan456/purchaseway-blog-backend.git
   ```

2. Acesse o diretório do projeto:

   ```bash
   cd purchaseway-blog-backend
   ```

3. Instale as dependências:

   ```bash
   npm install
   ```

4. Atenção: Crie um arquivo `.env`.

   ```bash
   touch .env
   ```

5. Defina as variáveis de ambiente dentro do arquivo `.env`, defina suas variáveis de ambiente no formato `NOME_DA_VARIAVEL=VALOR`.

   ```plaintext
   # Database configuration
   DATABASE_URL=sua_conexao_com_mongodb

   # API configuration
   API_KEY=sua_chave_de_api

   # Port configuration
   PORT=sua_porta (opcional a porta padrão será 3000)

   # JWT configuration
   JWT_SECRET=sua_secret_key
   ```

6. Inicie o servidor:

   ```bash
   npm run dev
   ```

7. Acesse o aplicativo em seu navegador de acordo com a porta configurada, por exemplo: [http://localhost:3000](http://localhost:3000)
