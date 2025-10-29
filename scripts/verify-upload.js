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

async function verifyUpload() {
  console.log('🚀 Verifying upload...');
  
  // Get all sketches
  const { data: sketches, error } = await supabase
    .from('sketches')
    .select('id, title, artist_name, image_filename')
    .order('artist_name');
  
  if (error) {
    console.error('❌ Error fetching sketches:', error.message);
    return;
  }
  
  console.log(`📊 Total sketches in database: ${sketches.length}`);
  
  // Group by artist
  const artistCounts = {};
  sketches.forEach(sketch => {
    if (!artistCounts[sketch.artist_name]) {
      artistCounts[sketch.artist_name] = 0;
    }
    artistCounts[sketch.artist_name]++;
  });
  
  console.log('\n📈 Artist distribution:');
  Object.entries(artistCounts).forEach(([artist, count]) => {
    const percentage = (count / sketches.length * 100).toFixed(1);
    console.log(`  ${artist}: ${count} sketches (${percentage}%)`);
  });
  
  // Check for missing files
  console.log('\n🔍 Checking for missing files...');
  let missingFiles = 0;
  
  for (const sketch of sketches) {
    try {
      const { data, error } = await supabase.storage
        .from('sketch-images')
        .list('', {
          search: sketch.image_filename
        });
      
      if (error || !data || data.length === 0) {
        console.log(`❌ Missing file: ${sketch.image_filename} (${sketch.title})`);
        missingFiles++;
      }
    } catch (error) {
      console.log(`❌ Error checking file: ${sketch.image_filename} - ${error.message}`);
      missingFiles++;
    }
  }
  
  if (missingFiles === 0) {
    console.log('✅ All files are present in Storage!');
  } else {
    console.log(`❌ ${missingFiles} files are missing from Storage`);
  }
  
  // Get storage file count
  try {
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('sketch-images')
      .list('');
    
    if (storageError) {
      console.log('❌ Error fetching storage files:', storageError.message);
    } else {
      console.log(`📁 Files in Storage: ${storageFiles.length}`);
      console.log(`📊 Database records: ${sketches.length}`);
      
      if (storageFiles.length === sketches.length) {
        console.log('✅ Perfect match between database and storage!');
      } else {
        console.log(`⚠️  Mismatch: ${Math.abs(storageFiles.length - sketches.length)} difference`);
      }
    }
  } catch (error) {
    console.log('❌ Error checking storage:', error.message);
  }
}

// Run the verification
verifyUpload().catch(console.error);
