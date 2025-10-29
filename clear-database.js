import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearDatabase() {
  console.log('🗑️  Clearing all sketches from database...');
  
  const { error } = await supabase
    .from('sketches')
    .delete()
    .neq('id', 'dummy'); // Delete all records
  
  if (error) {
    console.error('❌ Error clearing database:', error);
  } else {
    console.log('✅ Database cleared successfully');
  }
}

clearDatabase().catch(console.error);
