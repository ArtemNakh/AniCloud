# ==================================================>
# 1. Етап встановлення базових залежностей
# ==================================================>
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
# Встановлюємо всі залежності (включно з devDependencies для збирання)
RUN npm ci
# ==================================================>
# 2. Етап збирання (Build)
# ==================================================>
FROM base AS build
WORKDIR /app
# Копіюємо весь вихідний код
COPY . .
# Компілюємо TypeScript у JavaScript (папка dist)
RUN npm run build

# Зберігаємо лише продакшн-залежності для фінального образу
RUN npm prune --production

# ==================================================>
# 3. Фінальний продакшн-етап
# ==================================================>
FROM node:22-alpine AS prod
WORKDIR /app

ENV NODE_ENV=production
ARG PORT=5000
ENV PORT=$PORT
EXPOSE $PORT

# Додаємо dumb-init для коректного оброблення сигналів завершення (Graceful Shutdown)
RUN apk add --no-cache dumb-init

# Копіюємо необхідні файли з попередніх етапів
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package*.json ./
COPY --from=build --chown=node:node /app/dist ./dist

# Перемикаємося на не-привілейованого користувача безпеки заради
USER node

# Запускаємо додаток через dumb-init та вказуємо правильний шлях до компіляту NestJS
# CMD [ "dumb-init", "node", "dist/main.js"]
CMD ["sh", "-c", "echo '🚀 Запуск продакшн-сценарію (Production Mode) для AniCloud Backend' && dumb-init node dist/main.js"]

# Передивитися усі логи бекенда 
# docker compose logs -f backnest

# Перевірка статусу контейнера
# docker compose ps