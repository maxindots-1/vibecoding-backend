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

async function syncDatabaseWithStorage() {
  console.log('🚀 Syncing database with storage...');
  
  // Get all files from storage
  const { data: storageFiles, error: storageError } = await supabase.storage
    .from('sketch-images')
    .list('');
  
  if (storageError) {
    console.error('❌ Error fetching storage files:', storageError.message);
    return;
  }
  
  console.log(`📁 Files in Storage: ${storageFiles.length}`);
  
  // Get all sketches from database
  const { data: sketches, error: dbError } = await supabase
    .from('sketches')
    .select('id, image_filename');
  
  if (dbError) {
    console.error('❌ Error fetching database sketches:', dbError.message);
    return;
  }
  
  console.log(`📊 Sketches in Database: ${sketches.length}`);
  
  // Create a set of storage filenames
  const storageFilenames = new Set(storageFiles.map(file => file.name));
  
  // Find sketches that don't have corresponding files in storage
  const sketchesToDelete = sketches.filter(sketch => !storageFilenames.has(sketch.image_filename));
  
  console.log(`🗑️  Sketches to delete: ${sketchesToDelete.length}`);
  
  if (sketchesToDelete.length > 0) {
    const idsToDelete = sketchesToDelete.map(sketch => sketch.id);
    
    const { error: deleteError } = await supabase
      .from('sketches')
      .delete()
      .in('id', idsToDelete);
    
    if (deleteError) {
      console.error('❌ Error deleting sketches:', deleteError.message);
    } else {
      console.log(`✅ Deleted ${idsToDelete.length} sketches without files`);
    }
  }
  
  // Verify final state
  const { data: finalSketches, error: finalError } = await supabase
    .from('sketches')
    .select('artist_name');
  
  if (finalError) {
    console.error('❌ Error fetching final sketches:', finalError.message);
    return;
  }
  
  // Count final distribution
  const finalCounts = {};
  finalSketches.forEach(sketch => {
    finalCounts[sketch.artist_name] = (finalCounts[sketch.artist_name] || 0) + 1;
  });
  
  console.log('\n📊 Final distribution:');
  Object.entries(finalCounts).forEach(([artist, count]) => {
    console.log(`  ${artist}: ${count} sketches`);
  });
  
  console.log(`\n✅ Total sketches after sync: ${finalSketches.length}`);
  console.log(`📁 Files in Storage: ${storageFiles.length}`);
  
  if (finalSketches.length === storageFiles.length) {
    console.log('🎉 Perfect match between database and storage!');
  } else {
    console.log(`⚠️  Still ${Math.abs(finalSketches.length - storageFiles.length)} difference`);
  }
}

// Run the sync
syncDatabaseWithStorage().catch(console.error);
