import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('🧪 Testing database insert...');
  
  const testData = {
    title: 'Test Sketch',
    artist_name: 'Test Artist',
    artist_bio: 'Test bio',
    description: 'Test description',
    visual_description: 'Test visual description',
    body_parts: ['arm'],
    size: 'medium',
    price: 500,
    image_filename: 'test.jpg',
    tags: ['test', 'tattoo'],
    style: 'traditional',
    complexity: 'medium',
    color_scheme: 'black-and-white',
    meaning_level: 'medium',
    visibility_level: 'medium',
    chaos_order_level: 'balanced'
  };
  
  const { data, error } = await supabase
    .from('sketches')
    .insert(testData);
    
  if (error) {
    console.error('❌ Insert failed:', error);
    console.log('Error details:', JSON.stringify(error, null, 2));
  } else {
    console.log('✅ Insert successful:', data);
  }
}

testInsert().catch(console.error);
