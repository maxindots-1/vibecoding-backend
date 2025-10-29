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

async function checkStorage() {
  console.log('🚀 Checking storage files...');
  
  try {
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('sketch-images')
      .list('');
    
    if (storageError) {
      console.log('❌ Error fetching storage files:', storageError.message);
      return;
    }
    
    console.log(`📁 Total files in Storage: ${storageFiles.length}`);
    
    // Group by artist
    const artistFiles = {};
    storageFiles.forEach(file => {
      const artistName = file.name.split('_')[0] + ' ' + file.name.split('_')[1];
      if (!artistFiles[artistName]) {
        artistFiles[artistName] = [];
      }
      artistFiles[artistName].push(file.name);
    });
    
    console.log('\n📈 Files by artist:');
    Object.entries(artistFiles).forEach(([artist, files]) => {
      console.log(`  ${artist}: ${files.length} files`);
      // Show first few files
      files.slice(0, 3).forEach(file => {
        console.log(`    - ${file}`);
      });
      if (files.length > 3) {
        console.log(`    ... and ${files.length - 3} more`);
      }
    });
    
  } catch (error) {
    console.log('❌ Error checking storage:', error.message);
  }
}

// Run the check
checkStorage().catch(console.error);
