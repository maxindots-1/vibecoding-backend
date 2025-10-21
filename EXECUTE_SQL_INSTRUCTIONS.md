# 🚨 СРОЧНО: Выполните SQL скрипт в Supabase

## ✅ **Что уже готово:**

1. **SQL скрипт создан**: `backend/fix-match-sketches-column.sql`
2. **Backend код проверен**: уже использует правильное название `body_parts`
3. **Проблема найдена**: функция `match_sketches` в Supabase использует неправильное название колонки

## 🎯 **Что нужно сделать СЕЙЧАС:**

### **Выполните SQL скрипт в Supabase SQL Editor:**

1. **Откройте Supabase SQL Editor**
2. **Скопируйте и вставьте** содержимое файла `fix-match-sketches-column.sql`:

```sql
-- Fix match_sketches function to use correct column name 'body_parts' instead of 'suitable_body_parts'

DROP FUNCTION IF EXISTS match_sketches(vector(1536), float, int);

CREATE OR REPLACE FUNCTION match_sketches (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.01,
  match_count int DEFAULT 20
)
RETURNS TABLE (
  id text,
  title text,
  description text,
  artist_name text,
  artist_bio text,
  image_filename text,
  body_parts text[],  -- FIXED: was suitable_body_parts
  size text,
  price numeric,
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
    sketches.body_parts,  -- FIXED: was suitable_body_parts
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
```

3. **Нажмите "Run"** в SQL Editor
4. **Дождитесь успешного выполнения**

## 🧪 **После выполнения протестируйте:**

1. **Сделайте поиск** на фронтенде
2. **Проверьте консоль** - должно показать:
   - ✅ `count: 15-20` (вместо 1 fallback)
   - ✅ Нет ошибки "column suitable_body_parts does not exist"
   - ✅ Поле `body_parts` заполнено правильно

## 🎯 **Ожидаемые результаты:**

- ✅ **Ошибка 500 исправлена**
- ✅ **API возвращает 15-20 скетчей**
- ✅ **Поле body_parts работает корректно**
- ✅ **Система готова к демо**

**Выполните SQL скрипт и сообщите результат!** 🚀
