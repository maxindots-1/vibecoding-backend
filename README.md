# Vibecoding Backend - AI-Powered Tattoo Sketch Matching

Backend API для интеллектуального подбора тату-эскизов на основе предпочтений пользователя.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd backend
npm install
```

### 2. Настройка окружения

Создайте файл `.env` на основе `env-template.txt`:

```bash
cp env-template.txt .env
```

Заполните необходимые переменные:
- `OPENAI_API_KEY` - API ключ OpenAI
- `SUPABASE_URL` - URL вашего Supabase проекта
- `SUPABASE_ANON_KEY` - Anon/Public ключ Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role ключ Supabase

### 3. Настройка Supabase

1. Создайте новый проект на [supabase.com](https://supabase.com)
2. Перейдите в SQL Editor
3. Выполните SQL из файла `supabase-setup.sql`
4. Скопируйте URL и ключи из Settings > API

### 4. Генерация embeddings

После настройки Supabase, загрузите эскизы:

```bash
npm run generate-embeddings
```

Этот скрипт:
- Читает данные из `../data/sketches.json`
- Генерирует embeddings через OpenAI
- Загружает все в Supabase

### 5. Запуск в режиме разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## 📡 API Endpoints

### `POST /api/search-sketches`

Поиск эскизов на основе предпочтений пользователя.

**Request body:**
```json
{
  "tattooExperience": "first-time",
  "size": 50,
  "bodyPart": "arm",
  "visibility": 60,
  "meaningLevel": 80,
  "chaosOrder": 30,
  "customText": "I want something minimal and geometric",
  "voiceTranscript": "",
  "moodboardDescription": ""
}
```

**Response:**
```json
{
  "success": true,
  "prompt": "User is looking for a tattoo with...",
  "sketches": [
    {
      "id": "sketch-001",
      "title": "Infinity Mirrored Room",
      "artist_name": "Frank Lepkowski",
      "description": "...",
      "similarity": 0.89,
      "match_explanation": "This geometric design matches your preference..."
    }
  ],
  "count": 6
}
```

### `GET /api/sketches/:id`

Получить детали конкретного эскиза.

**Response:**
```json
{
  "success": true,
  "sketch": { ... }
}
```

### `POST /api/upload-sketch`

Загрузить новый эскиз (admin endpoint).

**Request body:** Полный объект эскиза из `sketch-template.json`

### `GET /api/health`

Health check endpoint.

## 🎨 Добавление новых эскизов

1. Скопируйте `../data/sketch-template.json`
2. Заполните все поля
3. Добавьте в массив `../data/sketches.json`
4. Запустите `npm run generate-embeddings`

## 🌐 Деплой на Vercel

### Через CLI:

```bash
npm install -g vercel
vercel login
vercel
```

### Через GitHub:

1. Запушьте код в GitHub
2. Подключите репозиторий на [vercel.com](https://vercel.com)
3. Добавьте environment variables в настройках проекта
4. Deploy!

### Environment Variables для Vercel:

Не забудьте добавить в Vercel все переменные из `.env`:
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOWED_ORIGINS` (добавьте домен вашего фронтенда)

## 🔧 Технологии

- **Framework**: Next.js 14 (API Routes)
- **Database**: Supabase (PostgreSQL + pgvector)
- **AI**: OpenAI (GPT-4 + Embeddings API)
- **Hosting**: Vercel

## 📊 Мониторинг и оптимизация

### Стоимость OpenAI API:
- Embeddings: ~$0.0001 за 1K токенов
- GPT-4: ~$0.03 за 1K токенов (input)

### Оптимизация:
- Embeddings генерируются один раз при загрузке эскиза
- Можно отключить GPT-4 объяснения (`enhanceWithAI: false`)
- Кэширование результатов на стороне фронтенда

## 🐛 Troubleshooting

### Ошибка: "Missing environment variables"
- Проверьте, что `.env` файл существует и содержит все ключи

### Ошибка при генерации embeddings
- Проверьте OPENAI_API_KEY
- Убедитесь, что у вас есть кредиты на аккаунте OpenAI

### Ошибка подключения к Supabase
- Проверьте SUPABASE_URL и ключи
- Убедитесь, что выполнили SQL из `supabase-setup.sql`
- Проверьте, что pgvector extension включен

### CORS ошибки
- Добавьте домен фронтенда в `ALLOWED_ORIGINS`
- Проверьте настройки в `next.config.js`

## 📝 Лицензия

Proprietary - Vibecoding Project

