#!/bin/bash

# Скрипт для запуска системы бронирования ресторана

echo "🍽️  Запуск системы бронирования ресторана..."

# Проверка зависимостей
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Установите Node.js >= 18"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm не установлен"
    exit 1
fi

# Создание .env файлов из примеров
echo "⚙️  Настройка конфигурации..."

# Backend .env
if [ ! -f "back-end/.env" ]; then
    if [ -f "back-end/.env.example" ]; then
        cp "back-end/.env.example" "back-end/.env"
        echo "✅ Создан back-end/.env из .env.example"
    else
        echo "🔧 Создан базовый back-end/.env"
        cat > "back-end/.env" << EOF
PORT=3001
DATABASE_URL="file:./dev.db"
EOF
    fi
fi

# Frontend .env.local
if [ ! -f "front-end/.env.local" ]; then
    if [ -f "front-end/.env.example" ]; then
        cp "front-end/.env.example" "front-end/.env.local"
        echo "✅ Создан front-end/.env.local из .env.example"
    else
        echo "🔧 Создан базовый front-end/.env.local"
        cat > "front-end/.env.local" << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
    fi
fi

# Функция для проверки установки зависимостей
check_dependencies() {
    local dir=$1
    if [ ! -d "$dir/node_modules" ]; then
        echo "📦 Установка зависимостей в $dir..."
        cd "$dir" && npm install
        cd - > /dev/null
    fi
}

# Проверяем и устанавливаем зависимости
check_dependencies "back-end"
check_dependencies "front-end"

# Настройка базы данных
echo "🗄️  Настройка базы данных..."
cd back-end
npx prisma generate > /dev/null 2>&1
npx prisma db push > /dev/null 2>&1
npx prisma db seed > /dev/null 2>&1
cd ..

echo "✅ Настройка завершена!"
echo ""
echo "🚀 Запуск серверов..."
echo "   Backend: http://localhost:3001"
echo "   Frontend: http://localhost:3000"
echo ""
echo "💡 Для остановки используйте Ctrl+C"
echo ""

# Запуск в фоне бэкенда
cd back-end
npm run start:dev &
BACKEND_PID=$!
cd ..

# Ждем запуска бэкенда
sleep 5

# Запуск фронтенда
cd front-end
npm run dev &
FRONTEND_PID=$!
cd ..

# Функция для корректного завершения
cleanup() {
    echo ""
    echo "🛑 Остановка серверов..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Обработка сигналов
trap cleanup SIGINT SIGTERM

# Ожидание
wait
