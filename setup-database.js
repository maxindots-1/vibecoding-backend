import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🔧 Setting up database...');
  
  // Create sketches table
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS sketches (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      title TEXT NOT NULL,
      artist_name TEXT NOT NULL,
      artist_bio TEXT,
      description TEXT,
      visual_description TEXT,
      body_parts TEXT[],
      size TEXT,
      price INTEGER,
      image_filename TEXT,
      tags TEXT[],
      style TEXT,
      complexity TEXT,
      color_scheme TEXT,
      meaning_level TEXT,
      visibility_level TEXT,
      chaos_order_level TEXT,
      embedding vector(3072),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  
  // Create vector extension if not exists
  const createExtensionSQL = `CREATE EXTENSION IF NOT EXISTS vector;`;
  
  // Create index for embeddings
  const createIndexSQL = `
    CREATE INDEX IF NOT EXISTS sketches_embedding_idx ON sketches 
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);
  `;
  
  try {
    // Execute extension creation
    console.log('📦 Creating vector extension...');
    const { error: extError } = await supabase.rpc('exec', { sql: createExtensionSQL });
    if (extError) {
      console.log('⚠️  Extension might already exist:', extError.message);
    }
    
    // Execute table creation
    console.log('📋 Creating sketches table...');
    const { error: tableError } = await supabase.rpc('exec', { sql: createTableSQL });
    if (tableError) {
      console.log('⚠️  Table might already exist:', tableError.message);
    }
    
    // Execute index creation
    console.log('🔍 Creating embedding index...');
    const { error: indexError } = await supabase.rpc('exec', { sql: createIndexSQL });
    if (indexError) {
      console.log('⚠️  Index might already exist:', indexError.message);
    }
    
    console.log('✅ Database setup completed!');
    
    // Test the table
    const { data, error } = await supabase
      .from('sketches')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('❌ Error testing table:', error);
    } else {
      console.log('✅ Table is ready for use');
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupDatabase().catch(console.error);
