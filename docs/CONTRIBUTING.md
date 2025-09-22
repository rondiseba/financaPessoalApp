# Guia de Contribuição - Controle de Gastos Pessoal

Obrigado por considerar contribuir com o projeto! Este guia irá te ajudar a contribuir de forma efetiva.

## 🚀 Como Contribuir

### 1. Reportando Bugs

Antes de reportar um bug, verifique se ele já não foi reportado. Se não foi, crie uma issue com:

- **Título claro e descritivo**
- **Descrição detalhada do problema**
- **Passos para reproduzir**
- **Comportamento esperado vs atual**
- **Screenshots/logs se aplicável**
- **Informações do ambiente** (OS, Node.js version, etc.)

### 2. Sugerindo Melhorias

Para sugerir uma nova funcionalidade:

- **Abra uma issue** com label "enhancement"
- **Descreva a funcionalidade** e sua motivação
- **Explique como seria a implementação**
- **Considere alternativas**

### 3. Contribuindo com Código

#### Pré-requisitos
- Node.js 16+
- Conhecimento em JavaScript/TypeScript
- Conhecimento em React
- Conhecimento em Express.js

#### Processo

1. **Fork o repositório**
2. **Clone seu fork**
   ```bash
   git clone https://github.com/seu-usuario/controle-gastos-pessoal.git
   cd controle-gastos-pessoal
   ```

3. **Configure o ambiente**
   ```bash
   ./setup.sh  # ou setup.bat no Windows
   ```

4. **Crie uma branch**
   ```bash
   git checkout -b feature/sua-funcionalidade
   # ou
   git checkout -b fix/seu-bug-fix
   ```

5. **Faça suas mudanças**

6. **Teste suas mudanças**
   ```bash
   npm run dev
   ```

7. **Commit suas mudanças**
   ```bash
   git add .
   git commit -m "feat: adiciona nova funcionalidade X"
   ```

8. **Push para seu fork**
   ```bash
   git push origin feature/sua-funcionalidade
   ```

9. **Abra um Pull Request**

## 📝 Padrões de Código

### Commits
Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona nova funcionalidade
fix: corrige bug específico
docs: atualiza documentação
style: mudanças de formatação
refactor: refatoração de código
test: adiciona ou corrige testes
chore: mudanças em configurações/build
```

### JavaScript/React
- Use ESLint e Prettier
- Componentes em PascalCase
- Funções e variáveis em camelCase
- Use hooks apropriadamente
- Prefira functional components

### Estrutura de Arquivos
```
src/
├── components/     # Componentes reutilizáveis
├── pages/         # Páginas da aplicação
├── services/      # Serviços e APIs
├── utils/         # Utilitários
└── hooks/         # Custom hooks
```

## 🧪 Testes

Embora ainda não tenhamos testes implementados, planejamos adicionar:

- **Unit tests** com Jest
- **Integration tests** com Supertest
- **E2E tests** com Cypress

Contribuições para adicionar testes são muito bem-vindas!

## 📖 Documentação

Ao contribuir, certifique-se de:

- Atualizar o README.md se necessário
- Documentar novos endpoints na API.md
- Adicionar comentários em código complexo
- Atualizar changelogs

## 🔄 Processo de Review

### Para Maintainers

1. **Revisar o código** - funcionalidade, qualidade, testes
2. **Testar localmente** - verificar se funciona
3. **Verificar documentação** - se está atualizada
4. **Aprovar ou solicitar mudanças**

### Para Contribuidores

- Seja paciente durante o processo de review
- Responda aos feedbacks construtivamente
- Faça mudanças solicitadas em commits separados
- Mantenha a PR focada em uma única funcionalidade/fix

## 🐛 Debugging

### Backend
```bash
cd backend
npm run dev
# Logs aparecerão no terminal
```

### Frontend
```bash
cd frontend
npm start
# Abra DevTools no navegador
```

### Database
```bash
cd backend
npm run studio
# Abre interface visual do banco
```

## 🎯 Áreas que Precisam de Ajuda

### Alta Prioridade
- [ ] Testes unitários e de integração
- [ ] Validação de formulários mais robusta
- [ ] Tratamento de erros melhorado
- [ ] Performance optimization

### Média Prioridade
- [ ] PWA (Progressive Web App)
- [ ] Modo escuro
- [ ] Exportação de dados
- [ ] Importação de extratos

### Baixa Prioridade
- [ ] Internacionalização (i18n)
- [ ] Themes customizáveis
- [ ] Plugins/extensões
- [ ] Mobile app nativo

## 📋 Checklist de PR

Antes de abrir um PR, verifique:

- [ ] Código segue os padrões estabelecidos
- [ ] Funcionalidade foi testada localmente
- [ ] Documentação foi atualizada
- [ ] Commits seguem padrão conventional
- [ ] Não há console.logs desnecessários
- [ ] Variáveis e funções têm nomes descritivos
- [ ] Não quebra funcionalidades existentes

## 🤝 Código de Conduta

- Seja respeitoso e construtivo
- Aceite feedback de forma positiva
- Ajude outros contribuidores
- Mantenha discussões focadas no projeto
- Reporte comportamentos inadequados

## 💡 Dicas para Novos Contribuidores

1. **Comece pequeno** - fixes de bugs ou melhorias na documentação
2. **Leia o código** - entenda a arquitetura antes de contribuir
3. **Faça perguntas** - use issues para esclarecer dúvidas
4. **Siga as convenções** - mantenha consistência com o código existente
5. **Teste tudo** - sempre teste suas mudanças

## 🏗️ Arquitetura do Projeto

### Backend (Node.js + Express)
```
backend/src/
├── controllers/    # Lógica de negócio
├── routes/        # Definição das rotas
├── middleware/    # Middlewares customizados
├── services/      # Serviços externos
└── models/        # Modelos do Prisma
```

### Frontend (React)
```
frontend/src/
├── components/    # Componentes reutilizáveis
├── pages/        # Páginas da aplicação
├── services/     # Chamadas à API
├── utils/        # Funções utilitárias
└── hooks/        # Custom hooks
```

### Database (SQLite + Prisma)
- Migrations em `backend/prisma/migrations/`
- Schema em `backend/prisma/schema.prisma`

## 📞 Contato

- Abra uma issue para discussões
- Use discussions para perguntas gerais
- Email: [seu-email] para questões sensíveis

---

**Obrigado por contribuir! Cada contribuição, por menor que seja, faz diferença! 🚀**