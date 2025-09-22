# 💰 Controle de Gastos Pessoal

Uma aplicação web completa para gerenciamento de finanças pessoais, desenvolvida com React, Node.js e SQLite.

## ✨ Funcionalidades

- 🔐 **Autenticação**: Sistema completo de login e registro
- 📊 **Dashboard**: Visão geral das finanças com gráficos interativos
- 💸 **Transações**: Gerenciamento completo de receitas e despesas
- 🏷️ **Categorias**: Organização personalizada das transações
- 📈 **Relatórios**: Geração automática de relatórios em Excel e PDF
- 📱 **Responsivo**: Interface adaptada para desktop e mobile
- 💾 **Armazenamento Local**: Todos os dados ficam no seu computador

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Prisma ORM** - Modelagem de dados
- **SQLite** - Banco de dados local
- **JWT** - Autenticação
- **ExcelJS** - Geração de relatórios Excel
- **PDFKit** - Geração de relatórios PDF

### Frontend
- **React 18** - Interface de usuário
- **Material-UI (MUI)** - Componentes visuais
- **Chart.js** - Gráficos e visualizações
- **React Router** - Navegação
- **Axios** - Requisições HTTP

## 📋 Pré-requisitos

- Node.js 16+ instalado
- npm ou yarn
- Git (opcional)

## 🛠️ Instalação e Configuração

### Opção 1: Instalação Automática (Recomendada)

#### No macOS/Linux:
```bash
chmod +x setup.sh
./setup.sh
```

#### No Windows:
```cmd
setup.bat
```

### Opção 2: Instalação Manual

1. **Clone ou baixe o projeto**
   ```bash
   git clone <url-do-repositorio>
   cd controle-gastos-pessoal
   ```

2. **Instale as dependências**
   ```bash
   npm run install-all
   ```

3. **Configure o banco de dados**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev --name init
   cd ..
   ```

4. **Configure as variáveis de ambiente**
   - O arquivo `.env` do backend já está configurado
   - O arquivo `.env` do frontend será criado automaticamente

## 🏃‍♂️ Executando a Aplicação

### Desenvolvimento (Frontend + Backend)
```bash
npm run dev
```

### Apenas Backend
```bash
npm run dev-backend
```

### Apenas Frontend
```bash
npm run dev-frontend
```

### Produção
```bash
npm run build
npm start
```

## 🌐 URLs de Acesso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Saúde da API**: http://localhost:3001/api/health
- **Prisma Studio**: `npm run studio`

## 📖 Como Usar

### 1. Primeiro Acesso
1. Acesse http://localhost:3000
2. Clique em "Cadastre-se"
3. Preencha seus dados e crie uma conta
4. Faça login com suas credenciais

### 2. Gerenciando Transações
1. Vá para "Transações" no menu lateral
2. Clique em "Nova Transação"
3. Preencha os dados:
   - **Descrição**: Ex: "Compra no supermercado"
   - **Valor**: Valor da transação
   - **Tipo**: Receita ou Despesa
   - **Categoria**: Selecione uma categoria
   - **Data**: Data da transação

### 3. Visualizando Dashboard
- O dashboard mostra um resumo das suas finanças
- Gráficos de tendência dos últimos 6 meses
- Distribuição de gastos por categoria
- Transações recentes

### 4. Gerando Relatórios
1. Vá para "Relatórios" no menu
2. Selecione o mês e ano desejado
3. Clique em "Excel" ou "PDF"
4. O relatório será gerado e baixado automaticamente

### 5. Categorias Padrão
O sistema cria automaticamente as seguintes categorias:

**Receitas:**
- Salário
- Freelance
- Investimentos

**Despesas:**
- Alimentação
- Transporte
- Moradia
- Saúde
- Educação
- Lazer
- Compras
- Contas

## 📊 Estrutura do Banco de Dados

```sql
Users (Usuários)
├── id (string)
├── email (string, único)
├── name (string)
├── password (string, hash)
├── createdAt (datetime)
└── updatedAt (datetime)

Categories (Categorias)
├── id (string)
├── name (string)
├── description (string, opcional)
├── color (string)
├── type (income/expense)
├── userId (string, FK)
├── createdAt (datetime)
└── updatedAt (datetime)

Transactions (Transações)
├── id (string)
├── description (string)
├── amount (float)
├── type (income/expense)
├── date (datetime)
├── categoryId (string, FK)
├── userId (string, FK)
├── createdAt (datetime)
└── updatedAt (datetime)
```

## 🔧 Scripts Disponíveis

```bash
# Instalar todas as dependências
npm run install-all

# Ambiente de desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar produção
npm start

# Configurar banco de dados
npm run migrate

# Abrir interface do banco
npm run studio
```

## 📁 Estrutura do Projeto

```
controle-gastos-pessoal/
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── controllers/     # Lógica de negócio
│   │   ├── routes/          # Rotas da API
│   │   ├── middleware/      # Middlewares
│   │   ├── services/        # Serviços
│   │   └── server.js        # Servidor principal
│   ├── prisma/
│   │   └── schema.prisma    # Schema do banco
│   └── package.json
├── frontend/                # Interface React
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── services/        # Serviços HTTP
│   │   ├── utils/           # Utilitários
│   │   └── App.js           # Componente principal
│   └── package.json
├── database/                # Banco SQLite
├── reports/                 # Relatórios gerados
├── docs/                    # Documentação
├── setup.sh                 # Script de setup (macOS/Linux)
├── setup.bat                # Script de setup (Windows)
└── package.json             # Projeto principal
```

## 🔒 Segurança

- Senhas são criptografadas com bcrypt
- Autenticação via JWT tokens
- Validação de dados no frontend e backend
- Sanitização de inputs
- Proteção contra ataques comuns

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:
- 💻 Desktop (1024px+)
- 📱 Tablet (768px - 1023px)
- 📱 Mobile (320px - 767px)

## 🐛 Resolução de Problemas

### Erro "Port 3000 already in use"
```bash
# Mate o processo na porta 3000
kill -9 $(lsof -ti:3000)
```

### Erro de migração do banco
```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Dependências não instaladas
```bash
npm run install-all
```

### Frontend não conecta com Backend
- Verifique se o backend está rodando na porta 3001
- Confirme o arquivo `frontend/.env` com `REACT_APP_API_URL=http://localhost:3001/api`

## 🔮 Futuras Melhorias

- [ ] Metas de gastos por categoria
- [ ] Importação de extratos bancários
- [ ] Backup e sincronização na nuvem
- [ ] Notificações de gastos
- [ ] Comparativo entre períodos
- [ ] Análise de tendências com IA
- [ ] App mobile nativo

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 💬 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique a seção de resolução de problemas
2. Abra uma issue no GitHub
3. Consulte os logs do console para mais detalhes

---

**Desenvolvido com ❤️ para ajudar no controle das suas finanças pessoais!**