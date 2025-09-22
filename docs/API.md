# API Documentation - Controle de Gastos Pessoal

Esta documentação descreve todos os endpoints disponíveis na API do sistema de controle de gastos pessoais.

## Base URL
```
http://localhost:3001/api
```

## Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Inclua o token no header `Authorization`:

```
Authorization: Bearer <token>
```

## Endpoints

### 🔐 Autenticação

#### POST /auth/register
Registra um novo usuário.

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": "clxxx",
    "name": "João Silva",
    "email": "joao@email.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/login
Faz login do usuário.

**Body:**
```json
{
  "email": "joao@email.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "id": "clxxx",
    "name": "João Silva",
    "email": "joao@email.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET /auth/profile
Retorna o perfil do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": "clxxx",
    "name": "João Silva",
    "email": "joao@email.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 🏷️ Categorias

#### GET /categories
Lista todas as categorias do usuário.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `type` (opcional): `income` ou `expense`

**Response:**
```json
{
  "categories": [
    {
      "id": "clxxx",
      "name": "Alimentação",
      "description": "Gastos com comida",
      "color": "#FF5722",
      "type": "expense",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "_count": {
        "transactions": 5
      }
    }
  ],
  "total": 1
}
```

#### GET /categories/:id
Retorna uma categoria específica.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "category": {
    "id": "clxxx",
    "name": "Alimentação",
    "description": "Gastos com comida",
    "color": "#FF5722",
    "type": "expense",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "_count": {
      "transactions": 5
    }
  }
}
```

#### POST /categories
Cria uma nova categoria.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Nova Categoria",
  "description": "Descrição opcional",
  "color": "#2196F3",
  "type": "expense"
}
```

**Response:**
```json
{
  "message": "Categoria criada com sucesso",
  "category": {
    "id": "clxxx",
    "name": "Nova Categoria",
    "description": "Descrição opcional",
    "color": "#2196F3",
    "type": "expense",
    "userId": "clyyy",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /categories/:id
Atualiza uma categoria.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Categoria Atualizada",
  "color": "#4CAF50"
}
```

#### DELETE /categories/:id
Exclui uma categoria (apenas se não tiver transações).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Categoria excluída com sucesso"
}
```

#### GET /categories/stats
Retorna estatísticas das categorias.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "categoriesCount": {
    "income": 3,
    "expense": 8
  },
  "transactionsCount": {
    "income": 15,
    "expense": 45
  },
  "totalCategories": 11,
  "totalTransactions": 60
}
```

### 💸 Transações

#### GET /transactions
Lista todas as transações do usuário.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (opcional): Número da página (default: 1)
- `limit` (opcional): Itens por página (default: 20)
- `type` (opcional): `income` ou `expense`
- `categoryId` (opcional): ID da categoria
- `startDate` (opcional): Data inicial (YYYY-MM-DD)
- `endDate` (opcional): Data final (YYYY-MM-DD)
- `search` (opcional): Busca na descrição

**Response:**
```json
{
  "transactions": [
    {
      "id": "clxxx",
      "description": "Compra no supermercado",
      "amount": 150.50,
      "type": "expense",
      "date": "2024-01-01T00:00:00.000Z",
      "categoryId": "clyyy",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "category": {
        "id": "clyyy",
        "name": "Alimentação",
        "color": "#FF5722",
        "type": "expense"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 50,
    "itemsPerPage": 20,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### GET /transactions/:id
Retorna uma transação específica.

**Headers:** `Authorization: Bearer <token>`

#### POST /transactions
Cria uma nova transação.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "description": "Salário do mês",
  "amount": 3000.00,
  "type": "income",
  "date": "2024-01-01T00:00:00.000Z",
  "categoryId": "clyyy"
}
```

#### PUT /transactions/:id
Atualiza uma transação.

**Headers:** `Authorization: Bearer <token>`

#### DELETE /transactions/:id
Exclui uma transação.

**Headers:** `Authorization: Bearer <token>`

#### GET /transactions/stats
Retorna estatísticas das transações.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `month` (opcional): Mês (1-12)
- `year` (opcional): Ano (YYYY)

**Response:**
```json
{
  "period": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "month": "01",
    "year": "2024"
  },
  "summary": {
    "totalIncome": 3000.00,
    "totalExpense": 1500.00,
    "balance": 1500.00,
    "transactionCount": 25
  },
  "expensesByCategory": [
    {
      "categoryId": "clyyy",
      "_sum": { "amount": 500.00 },
      "_count": { "id": 10 },
      "category": {
        "id": "clyyy",
        "name": "Alimentação",
        "color": "#FF5722"
      }
    }
  ],
  "incomesByCategory": [...],
  "recentTransactions": [...]
}
```

#### GET /transactions/trend
Retorna tendência mensal das transações.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `months` (opcional): Número de meses (default: 12)

**Response:**
```json
{
  "trend": [
    {
      "month": "Jan/24",
      "income": 3000.00,
      "expense": 1500.00,
      "balance": 1500.00
    }
  ]
}
```

### 📊 Dashboard

#### GET /dashboard
Retorna dados consolidados para o dashboard.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period` (opcional): `current`, `last`, `year` (default: `current`)

**Response:**
```json
{
  "period": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "label": "Mês Atual"
  },
  "totalStats": {
    "totalIncome": 3000.00,
    "totalExpense": 1500.00,
    "balance": 1500.00,
    "transactionCount": 25,
    "savingsRate": 50.0
  },
  "categoryStats": {
    "expenses": [...],
    "incomes": [...]
  },
  "monthlyTrend": [...],
  "recentTransactions": [...],
  "topCategories": [...]
}
```

### 📄 Relatórios

#### GET /reports/excel
Gera relatório em Excel.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `month`: Mês (1-12)
- `year`: Ano (YYYY)

**Response:**
```json
{
  "message": "Relatório Excel gerado com sucesso",
  "fileName": "relatorio-01-2024.xlsx",
  "downloadUrl": "/reports/relatorio-01-2024.xlsx",
  "summary": {
    "totalTransactions": 25,
    "totalIncome": 3000.00,
    "totalExpense": 1500.00,
    "balance": 1500.00
  }
}
```

#### GET /reports/pdf
Gera relatório em PDF.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `month`: Mês (1-12)
- `year`: Ano (YYYY)

#### GET /reports/list
Lista todos os relatórios gerados.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "reports": [
    {
      "fileName": "relatorio-01-2024.xlsx",
      "downloadUrl": "/reports/relatorio-01-2024.xlsx",
      "size": 15360,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "type": "XLSX"
    }
  ]
}
```

#### DELETE /reports/:fileName
Exclui um relatório.

**Headers:** `Authorization: Bearer <token>`

## Códigos de Status HTTP

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Tratamento de Erros

Todos os erros retornam no formato:

```json
{
  "error": "Mensagem de erro",
  "details": "Detalhes específicos (quando aplicável)"
}
```

## Rate Limiting

Atualmente não há rate limiting implementado, mas é recomendado implementar em produção.

## Versionamento

A API atualmente não possui versionamento. Futuras versões devem incluir versionamento na URL (ex: `/api/v1/`).

---

Para mais informações, consulte o código fonte ou entre em contato com a equipe de desenvolvimento.