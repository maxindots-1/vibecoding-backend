import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableSchema() {
  console.log('🔍 Checking table schema...');
  
  // Try to get table info
  const { data, error } = await supabase
    .from('sketches')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('❌ Error accessing table:', error);
    console.log('Error details:', JSON.stringify(error, null, 2));
  } else {
    console.log('✅ Table exists and is accessible');
    console.log('Sample data:', data);
  }
  
  // Try to get column information
  try {
    const { data: columns, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'sketches' });
      
    if (columnError) {
      console.log('⚠️  Could not get column info:', columnError.message);
    } else {
      console.log('📋 Table columns:', columns);
    }
  } catch (e) {
    console.log('⚠️  Could not get column info:', e.message);
  }
}

checkTableSchema().catch(console.error);
