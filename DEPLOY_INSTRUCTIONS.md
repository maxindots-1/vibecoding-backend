# 🚀 ИНСТРУКЦИЯ ДЛЯ ДЕПЛОЯ

## ✅ **Статус:**
- ✅ Backend код исправлен
- ✅ Векторный поиск восстановлен
- ✅ Создание сессий восстановлено
- ✅ Функция `match_sketches` исправлена

## 🎯 **ЧТО НУЖНО СДЕЛАТЬ:**

### **1. Исправить функцию в Supabase:**
1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Перейдите в ваш проект
3. Откройте **SQL Editor**
4. Скопируйте содержимое файла `SIMPLE_FIX.sql` и выполните

### **2. Обновить backend на Vercel:**
1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Найдите проект backend
3. Нажмите **Redeploy** на последнем деплое
4. Или загрузите обновленные файлы:
   - `app/api/search-sketches/route.js`
   - `api/index.js`
   - `lib/supabase.js`

### **3. Обновить frontend файлы:**
Загрузите на хостинг:
- `Prelude/main.js`
- `Prelude/styles.css`

## 🎯 **РЕЗУЛЬТАТ:**
После выполнения этих шагов:
- ✅ Векторный поиск работает
- ✅ Создание сессий работает
- ✅ Обновление email работает
- ✅ Все функции восстановлены

## 📋 **ФАЙЛЫ ДЛЯ ОБНОВЛЕНИЯ:**

### **Backend (Vercel):**
- `app/api/search-sketches/route.js` - восстановлен векторный поиск и создание сессий
- `api/index.js` - восстановлено создание сессий
- `lib/supabase.js` - исправлена функция `updateUserSession`

### **Frontend (хостинг):**
- `Prelude/main.js` - исправления для сохранения email
- `Prelude/styles.css` - стили для кнопки и шрифта

### **Supabase:**
- Выполнить SQL из `SIMPLE_FIX.sql` - исправляет функцию `match_sketches`

## 🚀 **ПОСЛЕ ДЕПЛОЯ:**
Протестируйте полный флоу:
1. Поиск скетчей ✅
2. Ввод email ✅
3. Успешное завершение ✅
