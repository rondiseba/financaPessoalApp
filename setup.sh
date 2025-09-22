#!/bin/bash

# Script de setup inicial para o projeto Controle de Gastos

echo "🚀 Iniciando setup do Controle de Gastos Pessoal..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    print_error "Node.js não está instalado. Por favor, instale Node.js primeiro."
    exit 1
fi

print_success "Node.js $(node --version) encontrado"

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    print_error "npm não está instalado. Por favor, instale npm primeiro."
    exit 1
fi

print_success "npm $(npm --version) encontrado"

# Instalar dependências do projeto principal
print_status "Instalando dependências do projeto principal..."
npm install

# Instalar dependências do backend
print_status "Instalando dependências do backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    print_error "Falha ao instalar dependências do backend"
    exit 1
fi
print_success "Dependências do backend instaladas"

# Gerar cliente Prisma
print_status "Gerando cliente Prisma..."
npx prisma generate
if [ $? -ne 0 ]; then
    print_error "Falha ao gerar cliente Prisma"
    exit 1
fi
print_success "Cliente Prisma gerado"

# Executar migrations
print_status "Executando migrations do banco de dados..."
npx prisma migrate dev --name init
if [ $? -ne 0 ]; then
    print_warning "Migrations não puderam ser executadas. Você pode executar manualmente depois."
fi

# Voltar para o diretório raiz
cd ..

# Instalar dependências do frontend
print_status "Instalando dependências do frontend..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    print_error "Falha ao instalar dependências do frontend"
    exit 1
fi
print_success "Dependências do frontend instaladas"

# Voltar para o diretório raiz
cd ..

# Criar arquivo .env para frontend se não existir
if [ ! -f "frontend/.env" ]; then
    print_status "Criando arquivo .env para frontend..."
    echo "REACT_APP_API_URL=http://localhost:3001/api" > frontend/.env
    print_success "Arquivo .env criado para frontend"
fi

print_success "🎉 Setup concluído com sucesso!"
echo ""
echo "📖 Próximos passos:"
echo "   1. Para iniciar o ambiente de desenvolvimento:"
echo "      npm run dev"
echo ""
echo "   2. Para iniciar apenas o backend:"
echo "      npm run dev-backend"
echo ""
echo "   3. Para iniciar apenas o frontend:"
echo "      npm run dev-frontend"
echo ""
echo "   4. Para abrir o Prisma Studio (interface do banco):"
echo "      npm run studio"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   API Docs: http://localhost:3001/api/health"
echo ""
print_success "Pronto para usar! 🚀"