import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Checking database schema...');
  
  const { data, error } = await supabase
    .from('sketches')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Schema check successful');
    console.log('Available columns:', Object.keys(data[0] || {}));
  }
}

checkSchema().catch(console.error);
