import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMinimalInsert() {
  console.log('🧪 Testing minimal insert...');
  
  // Try with minimal data first
  const minimalData = {
    title: 'Test Sketch',
    artist_name: 'Test Artist'
  };
  
  console.log('📝 Trying minimal insert...');
  const { data, error } = await supabase
    .from('sketches')
    .insert(minimalData);
    
  if (error) {
    console.error('❌ Minimal insert failed:', error);
  } else {
    console.log('✅ Minimal insert successful:', data);
  }
  
  // Try with more fields
  const moreData = {
    title: 'Test Sketch 2',
    artist_name: 'Test Artist 2',
    artist_bio: 'Test bio',
    description: 'Test description',
    size: 'medium',
    price: 500,
    image_filename: 'test.jpg'
  };
  
  console.log('📝 Trying with more fields...');
  const { data: data2, error: error2 } = await supabase
    .from('sketches')
    .insert(moreData);
    
  if (error2) {
    console.error('❌ Extended insert failed:', error2);
  } else {
    console.log('✅ Extended insert successful:', data2);
  }
  
  // Try with body_parts as string instead of array
  const stringData = {
    title: 'Test Sketch 3',
    artist_name: 'Test Artist 3',
    artist_bio: 'Test bio',
    description: 'Test description',
    body_parts: 'arm', // Try as string
    size: 'medium',
    price: 500,
    image_filename: 'test.jpg'
  };
  
  console.log('📝 Trying with body_parts as string...');
  const { data: data3, error: error3 } = await supabase
    .from('sketches')
    .insert(stringData);
    
  if (error3) {
    console.error('❌ String body_parts insert failed:', error3);
  } else {
    console.log('✅ String body_parts insert successful:', data3);
  }
}

testMinimalInsert().catch(console.error);
