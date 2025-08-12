# 🚀 Быстрый запуск

## Автоматический запуск (рекомендуется)

```bash
./start.sh
```

Этот скрипт автоматически:
- Проверит зависимости
- Установит пакеты (если нужно)
- Настроит базу данных
- Запустит backend и frontend

## Ручной запуск

### 1. Backend
```bash
cd back-end
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run start:dev
```

### 2. Frontend (в новом терминале)
```bash
cd front-end
npm install
npm run dev
```

## Доступ

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Prisma Studio**: `npx prisma studio` (в папке back-end)

## Остановка

Используйте `Ctrl+C` для остановки серверов.
