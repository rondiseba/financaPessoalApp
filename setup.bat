@echo off

REM Script de setup inicial para o projeto Controle de Gastos (Windows)

echo 🚀 Iniciando setup do Controle de Gastos Pessoal...

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js não está instalado. Por favor, instale Node.js primeiro.
    pause
    exit /b 1
)

echo [SUCCESS] Node.js encontrado

REM Verificar se npm está instalado
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm não está instalado. Por favor, instale npm primeiro.
    pause
    exit /b 1
)

echo [SUCCESS] npm encontrado

REM Instalar dependências do projeto principal
echo [INFO] Instalando dependências do projeto principal...
npm install

REM Instalar dependências do backend
echo [INFO] Instalando dependências do backend...
cd backend
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Falha ao instalar dependências do backend
    pause
    exit /b 1
)
echo [SUCCESS] Dependências do backend instaladas

REM Gerar cliente Prisma
echo [INFO] Gerando cliente Prisma...
npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Falha ao gerar cliente Prisma
    pause
    exit /b 1
)
echo [SUCCESS] Cliente Prisma gerado

REM Executar migrations
echo [INFO] Executando migrations do banco de dados...
npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo [WARNING] Migrations não puderam ser executadas. Você pode executar manualmente depois.
)

REM Voltar para o diretório raiz
cd ..

REM Instalar dependências do frontend
echo [INFO] Instalando dependências do frontend...
cd frontend
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Falha ao instalar dependências do frontend
    pause
    exit /b 1
)
echo [SUCCESS] Dependências do frontend instaladas

REM Voltar para o diretório raiz
cd ..

REM Criar arquivo .env para frontend se não existir
if not exist "frontend\.env" (
    echo [INFO] Criando arquivo .env para frontend...
    echo REACT_APP_API_URL=http://localhost:3001/api > frontend\.env
    echo [SUCCESS] Arquivo .env criado para frontend
)

echo.
echo [SUCCESS] 🎉 Setup concluído com sucesso!
echo.
echo 📖 Próximos passos:
echo    1. Para iniciar o ambiente de desenvolvimento:
echo       npm run dev
echo.
echo    2. Para iniciar apenas o backend:
echo       npm run dev-backend
echo.
echo    3. Para iniciar apenas o frontend:
echo       npm run dev-frontend
echo.
echo    4. Para abrir o Prisma Studio (interface do banco):
echo       npm run studio
echo.
echo 🌐 URLs:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:3001
echo    API Docs: http://localhost:3001/api/health
echo.
echo [SUCCESS] Pronto para usar! 🚀

pause