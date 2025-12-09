# 🐾 VetSystem - Gestão de Clínica Veterinária

Projeto Fullstack desenvolvido para o gerenciamento de clínicas veterinárias. O sistema permite o controle de prontuários, agendamento de vacinas, histórico clínico e gestão de equipe, com interface moderna e responsiva.

---

## 🛠 Tecnologias Utilizadas

### Backend (API REST)
- **Node.js**: Ambiente de execução JavaScript.
- **Express.js**: Framework para construção da API.
- **SQLite**: Banco de dados relacional (arquivo local).
- **Sequelize**: ORM para modelagem e interação com o banco.
- **Bcrypt**: Hash de senhas para segurança.
- **JWT (JsonWebToken)**: Autenticação via tokens.

### Frontend (Interface)
- **React (Vite)**: Biblioteca para construção da interface.
- **Tailwind CSS v3**: Estilização utilitária e responsiva.
- **Lucide React**: Ícones modernos e vetoriais.
- **React Toastify**: Notificações visuais (Toasts).
- **React Router**: Navegação entre páginas (SPA).

---

## 📂 Estrutura do Projeto

O projeto está dividido em duas pastas principais na raiz:

```text
/
├── backend-clinica/           # API, Banco de Dados e Regras de Negócio
│   ├── controllers/           # Lógica dos Pets e Usuários
│   ├── database/              # Arquivo data.sqlite (gerado auto)
│   ├── model/                 # Schemas do Sequelize (Pet.js, User.js)
│   ├── routes/                # Rotas Públicas e Privadas
│   ├── .env                   # Variáveis de ambiente (Senha, Porta)
│   └── index.js               # Entrada do servidor
│
└── frontend-clinica/          # Interface React
    ├── src/
    │   ├── Login.jsx          # Tela de Acesso/Configuração
    │   ├── Dashboard.jsx      # Painel Principal (Admin/Vet)
    │   └── ...
    ├── tailwind.config.js     # Configuração de estilos
    └── package.json           # Dependências do Front
```

---

## 🔐 Modelagem e Permissões

### Usuários (`User`)
- **Super Admin**: O sistema detecta automaticamente se o banco de dados está vazio. O primeiro usuário a se cadastrar ganha permissão total (Admin). Ele pode cadastrar, listar e excluir outros funcionários.
- **Veterinário/Funcionário**: Usuários cadastrados pelo Admin. Podem gerenciar prontuários, vacinas e agendamentos, mas não têm acesso à gestão de equipe.

### Prontuário (`Pet`)
- Dados cadastrais completos (Espécie, Raça, Sexo, Nascimento, etc.).
- Dados do Tutor (Nome, Telefone, Email).
- **Histórico Vacinal**: Registro de vacinas já aplicadas.
- **Agendamentos**: Lista de vacinas futuras (JSON) com data e nome.

---

## ⚙️ Guia de Instalação e Execução

Siga os passos abaixo para rodar o projeto localmente. Você precisará de **dois terminais** abertos simultaneamente (um para o servidor e outro para a interface).

### Passo 1: Configurando o Backend

1.  Abra o terminal e entre na pasta do backend:
    ```bash
    cd backend-clinica
    ```

2.  Instale as dependências necessárias:
    ```bash
    npm install
    ```

3.  **Configuração de Ambiente (.env)**:
    Crie um arquivo chamado `.env` na raiz da pasta `backend-clinica` e adicione o seguinte conteúdo:
    ```ini
    PORT=3000
    SECRET_JWT=sua_senha
    ```

4.  Inicie o servidor:
    ```bash
    node index.js
    ```
    > *O servidor rodará na porta 3000. O arquivo do banco de dados `database/data.sqlite` será criado automaticamente na primeira execução.*

### Passo 2: Configurando o Frontend

1.  Abra um **novo terminal** (mantenha o anterior rodando) e entre na pasta do frontend:
    ```bash
    cd frontend-clinica
    ```

2.  Instale as dependências do projeto e bibliotecas visuais:
    ```bash
    npm install
    ```

3.  Execute o projeto:
    ```bash
    npm run dev
    ```

4.  O terminal mostrará o link de acesso local (geralmente `http://localhost:5173`). Abra este link no seu navegador.

---

## 🚀 Como Utilizar (Fluxo Inicial)

O sistema possui uma trava de segurança inteligente para a configuração inicial:

1.  **Configuração do Admin**:
    Ao acessar o sistema pela primeira vez (enquanto o banco de dados estiver vazio), a tela de login exibirá o botão **"Configurar"**. Clique nele e crie sua conta. **Você será automaticamente o Super Admin.**
    
2.  **Bloqueio de Segurança**:
    Após o primeiro cadastro, o sistema bloqueia novos registros públicos. A partir de agora, apenas o Admin logado pode adicionar novos membros pela área interna.

3.  **Dashboard**:
    - **Área de Equipe (Roxo):** Visível apenas para o Admin. Use para cadastrar veterinários e funcionários.
    - **Área de Prontuários (Azul):** Onde são gerenciados os pets. Permite cadastro, edição e exclusão.
    - **Alertas de Vacina (Laranja):** Mostra vacinas agendadas ordenadas pela data mais próxima.

---

## 🧪 Rotas da API (Documentação Básica)

Se precisar testar o Backend isoladamente (via Insomnia/Postman):

* **Status do Sistema**
    * `GET /system-status`: Retorna `{ initialized: true/false }`.

* **Autenticação**
    * `POST /login`: Recebe email/senha e retorna o Token JWT.

* **Gestão de Usuários (Requer Token Admin)**
    * `GET /usuarios`: Lista a equipe.
    * `POST /usuarios`: Cadastra novo funcionário.
    * `PUT /usuarios/:id`: Atualiza dados do usuário.
    * `DELETE /usuarios/:id`: Remove funcionário.

* **Gestão de Pets (Requer Token)**
    * `GET /pets`: Lista todos os prontuários.
    * `POST /pets`: Cria novo prontuário.
    * `PUT /pets/:id`: Atualiza dados, vacinas e agendamentos.
    * `DELETE /pets/:id`: Remove prontuário (Apenas Admin).

---

## 📝 Autor

Projeto desenvolvido para fins acadêmicos na disciplina de Programação para Internet II.

