import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSchema() {
  console.log('🔧 Creating database schema...');
  
  // Read the SQL file
  const sqlPath = path.join(__dirname, 'update-sketches-schema.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
  
  // Execute the SQL
  const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
  
  if (error) {
    console.error('❌ Error creating schema:', error);
  } else {
    console.log('✅ Schema created successfully');
  }
}

createSchema().catch(console.error);
