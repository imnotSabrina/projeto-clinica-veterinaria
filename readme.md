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
