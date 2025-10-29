# Исправление админки под рабочий проект

## Проблема
Админка не работает, потому что использует неправильные названия колонок в базе данных.

## Решение
Подстроить админку под существующую схему рабочего проекта.

## Что исправлено

### 1. Backend код (`backend/app/api/upload-sketch/route.js`)
- ✅ Исправлено: `body_parts` → `suitable_body_parts`
- ✅ Исправлено: `meaning_level` → `meaning`
- ✅ Исправлено: `visibility_level` → `visibility`  
- ✅ Исправлено: `chaos_order_level` → `chaos_order`

### 2. Admin панель (`admin/admin.js`)
- ✅ Обновлен API URL на актуальный: `https://backend-51kzhexql-maxims-projects-92fd3574.vercel.app`

### 3. База данных
Нужно выполнить SQL скрипт в Supabase для синхронизации схемы:

```sql
-- Fix admin schema to match working project schema
-- Run this in Supabase SQL Editor

-- Ensure all required columns exist with correct names
ALTER TABLE sketches 
ADD COLUMN IF NOT EXISTS suitable_body_parts TEXT[],
ADD COLUMN IF NOT EXISTS visual_description TEXT,
ADD COLUMN IF NOT EXISTS meaning TEXT,
ADD COLUMN IF NOT EXISTS visibility TEXT,
ADD COLUMN IF NOT EXISTS chaos_order TEXT;

-- If body_parts exists but suitable_body_parts doesn't, rename it
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sketches' AND column_name = 'body_parts'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sketches' AND column_name = 'suitable_body_parts'
    ) THEN
        ALTER TABLE sketches RENAME COLUMN body_parts TO suitable_body_parts;
        RAISE NOTICE 'Renamed body_parts to suitable_body_parts';
    END IF;
END $$;

-- If meaning_level exists but meaning doesn't, rename it
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sketches' AND column_name = 'meaning_level'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sketches' AND column_name = 'meaning'
    ) THEN
        ALTER TABLE sketches RENAME COLUMN meaning_level TO meaning;
        RAISE NOTICE 'Renamed meaning_level to meaning';
    END IF;
END $$;

-- If visibility_level exists but visibility doesn't, rename it
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sketches' AND column_name = 'visibility_level'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sketches' AND column_name = 'visibility'
    ) THEN
        ALTER TABLE sketches RENAME COLUMN visibility_level TO visibility;
        RAISE NOTICE 'Renamed visibility_level to visibility';
    END IF;
END $$;

-- If chaos_order_level exists but chaos_order doesn't, rename it
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sketches' AND column_name = 'chaos_order_level'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sketches' AND column_name = 'chaos_order'
    ) THEN
        ALTER TABLE sketches RENAME COLUMN chaos_order_level TO chaos_order;
        RAISE NOTICE 'Renamed chaos_order_level to chaos_order';
    END IF;
END $$;

-- Update the match_sketches function to use correct column names
DROP FUNCTION IF EXISTS match_sketches(vector, double precision, integer);

CREATE OR REPLACE FUNCTION match_sketches(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.01,
  match_count int DEFAULT 20
)
RETURNS TABLE(
  id text,
  title text,
  description text,
  artist_name text,
  artist_bio text,
  image_filename text,
  suitable_body_parts text[],
  size text,
  price integer,
  tags text[],
  style text,
  complexity text,
  meaning text,
  visibility text,
  chaos_order text,
  visual_description text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sketches.id,
    sketches.title,
    sketches.description,
    sketches.artist_name,
    sketches.artist_bio,
    sketches.image_filename,
    sketches.suitable_body_parts,
    sketches.size,
    sketches.price,
    sketches.tags,
    sketches.style,
    sketches.complexity,
    sketches.meaning,
    sketches.visibility,
    sketches.chaos_order,
    sketches.visual_description,
    1 - (sketches.embedding <=> query_embedding) as similarity
  FROM sketches
  WHERE 1 - (sketches.embedding <=> query_embedding) > match_threshold
  ORDER BY sketches.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Verify the schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'sketches' 
ORDER BY ordinal_position;

-- Test the function
SELECT 'Schema updated to match working project' as status;
```

## Инструкции

### Шаг 1: Обновить базу данных
1. Откройте Supabase Dashboard
2. Перейдите в SQL Editor
3. Выполните SQL скрипт выше
4. Проверьте, что все колонки созданы/переименованы

### Шаг 2: Протестировать админку
1. Откройте админку: `/Users/maximshishkin/Documents/Dots/Web/Vibecoding/admin/index.html`
2. Заполните форму:
   - Sketch Title: "Test Sketch"
   - Artist Name: "Test Artist"
   - Artist Bio: "Test bio"
   - Sketch Description: "Test description"
   - Body Parts: выберите "Arm"
   - Size: выберите "Large"
   - Price: 100
   - Upload image
3. Нажмите "Add Sketch"
4. Проверьте, что загрузка прошла успешно

## Результат
Админка должна работать точно так же, как основной проект, используя ту же схему базы данных.

## Файлы изменены
- `backend/app/api/upload-sketch/route.js` - исправлены названия колонок
- `admin/admin.js` - обновлен API URL
- `backend/fix-admin-schema-to-match-project.sql` - SQL скрипт для базы данных
- Этот файл - инструкции
