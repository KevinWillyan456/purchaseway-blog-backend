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

## Documentação dos Endpoints da API

A seguir estão os endpoints disponíveis na API, juntamente com suas descrições e métodos HTTP correspondentes.

### Usuários

#### Listar Todos os Usuários

- **URL**: `/users`
- **Método HTTP**: GET
- **Descrição**: Retorna todos os usuários cadastrados no sistema.

#### Obter Usuário por ID

- **URL**: `/users/:id`
- **Método HTTP**: GET
- **Descrição**: Retorna um usuário específico com base no ID fornecido.

#### Criar Novo Usuário

- **URL**: `/users`
- **Método HTTP**: POST
- **Descrição**: Cria um novo usuário no sistema.

#### Atualizar Usuário

- **URL**: `/users/:id`
- **Método HTTP**: PUT
- **Descrição**: Atualiza as informações de um usuário existente com base no ID fornecido.

#### Deletar Usuário por Email

- **URL**: `/users/:email`
- **Método HTTP**: DELETE
- **Descrição**: Remove um usuário com base no endereço de e-mail fornecido.

#### Autenticar Usuário

- **URL**: `/login`
- **Método HTTP**: POST
- **Descrição**: Realiza a autenticação do usuário.

#### Verificar Token

- **URL**: `/verify-token`
- **Método HTTP**: POST
- **Descrição**: Verifica se o token de autenticação é válido.

#### Obter Usuário por Token

- **URL**: `/get-user-by-token`
- **Método HTTP**: GET
- **Descrição**: Retorna as informações do usuário com base no token de autenticação.

#### Obter Informações do Usuário

- **URL**: `/get-user-info`
- **Método HTTP**: GET
- **Descrição**: Retorna informações detalhadas do usuário.

#### Obter Posts do Usuário

- **URL**: `/get-user-posts`
- **Método HTTP**: GET
- **Descrição**: Retorna todos os posts feitos por um usuário.

### Posts

#### Listar Todos os Posts

- **URL**: `/posts`
- **Método HTTP**: GET
- **Descrição**: Retorna todos os posts disponíveis no sistema.

#### Obter Post por ID

- **URL**: `/posts/:id`
- **Método HTTP**: GET
- **Descrição**: Retorna um post específico com base no ID fornecido.

#### Criar Novo Post

- **URL**: `/posts/:userId`
- **Método HTTP**: POST
- **Descrição**: Cria um novo post associado ao ID do usuário fornecido.

#### Atualizar Post

- **URL**: `/posts/:id/:userId`
- **Método HTTP**: PUT
- **Descrição**: Atualiza as informações de um post existente com base no ID fornecido, associado ao ID do usuário.

#### Deletar Post

- **URL**: `/posts/:id/:userId`
- **Método HTTP**: DELETE
- **Descrição**: Remove um post com base no ID fornecido, associado ao ID do usuário.

#### Deletar Todos os Posts de um Usuário

- **URL**: `/delete-all-posts/:userId`
- **Método HTTP**: DELETE
- **Descrição**: Remove todos os posts associados ao ID do usuário fornecido.

#### Alternar Curtidas em um Post

- **URL**: `/posts/likes/:id/:userId`
- **Método HTTP**: PUT
- **Descrição**: Alterna o estado de curtida de um post com base no ID fornecido, associado ao ID do usuário.

#### Adicionar Resposta a um Post

- **URL**: `/posts/response/:id/:userId`
- **Método HTTP**: POST
- **Descrição**: Adiciona uma resposta a um post com base no ID fornecido, associado ao ID do usuário.

#### Atualizar Resposta de um Post

- **URL**: `/posts/response/:id/:responseId/:userId`
- **Método HTTP**: PUT
- **Descrição**: Atualiza uma resposta de um post com base no ID fornecido, associado ao ID da resposta e ao ID do usuário.

#### Alternar Curtidas em uma Resposta de Post

- **URL**: `/posts/response/likes/:id/:responseId/:userId`
- **Método HTTP**: PUT
- **Descrição**: Alterna o estado de curtida de uma resposta de post com base no ID fornecido, associado ao ID da resposta e ao ID do usuário.

#### Deletar Resposta de um Post

- **URL**: `/posts/response/:id/:responseId/:userId`
- **Método HTTP**: DELETE
- **Descrição**: Remove uma resposta de um post com base no ID fornecido, associado ao ID da resposta e ao ID do usuário.

### Outros

#### Obter dados gerais

- **URL**: `/some-numbers`
- **Método HTTP**: GET
- **Descrição**: Retorna o número total de postagens e usuários cadastrados no sistema.
