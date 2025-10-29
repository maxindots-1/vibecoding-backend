const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateImageFilenames() {
  console.log('🚀 Starting update of image filenames...');
  
  // Artist mapping
  const artists = [
    'Chen Jie',
    'Doctor Woo', 
    'Gakkin',
    'Kozo Tattoo',
    'Matteo Nangeroni',
    'Megan Massacre',
    'Okan Uckun',
    'Oozy Tattoo',
    'Pittak KM',
    'Romeo Lacoste',
    'Sasha Unisex',
    'Tattooist Banul',
    'Matias Noble',
    'Mr K'
  ];
  
  for (const artistName of artists) {
    console.log(`\n📁 Processing ${artistName}...`);
    
    // Get all sketches for this artist
    const { data: sketches, error } = await supabase
      .from('sketches')
      .select('id, title')
      .eq('artist_name', artistName)
      .order('created_at');
    
    if (error) {
      console.log(`❌ Error fetching sketches for ${artistName}:`, error.message);
      continue;
    }
    
    console.log(`📊 Found ${sketches.length} sketches for ${artistName}`);
    
    // Update each sketch with correct filename
    for (let i = 0; i < sketches.length; i++) {
      const sketch = sketches[i];
      const fileName = `${artistName.replace(/\s+/g, '_')}_${i + 1}.jpg`;
      
      const { error: updateError } = await supabase
        .from('sketches')
        .update({ image_filename: fileName })
        .eq('id', sketch.id);
      
      if (updateError) {
        console.log(`❌ Error updating ${sketch.title}:`, updateError.message);
      } else {
        console.log(`✅ Updated ${sketch.title} → ${fileName}`);
      }
    }
  }
  
  console.log('\n🎉 Update completed!');
}

// Run the update
updateImageFilenames().catch(console.error);
