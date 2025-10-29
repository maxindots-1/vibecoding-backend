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

async function cleanupDatabase() {
  console.log('🚀 Cleaning up database to match storage files...');
  
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
  
  // Group by artist and keep only first 20 for each artist
  const artistCounts = {};
  const sketchesToKeep = [];
  const sketchesToDelete = [];
  
  sketches.forEach(sketch => {
    if (!artistCounts[sketch.artist_name]) {
      artistCounts[sketch.artist_name] = 0;
    }
    
    artistCounts[sketch.artist_name]++;
    
    // Keep only first 20 sketches for each artist
    if (artistCounts[sketch.artist_name] <= 20) {
      sketchesToKeep.push(sketch);
    } else {
      sketchesToDelete.push(sketch);
    }
  });
  
  console.log(`📈 Sketches to keep: ${sketchesToKeep.length}`);
  console.log(`🗑️  Sketches to delete: ${sketchesToDelete.length}`);
  
  // Delete excess sketches
  if (sketchesToDelete.length > 0) {
    console.log('\n🗑️  Deleting excess sketches...');
    
    const idsToDelete = sketchesToDelete.map(sketch => sketch.id);
    
    const { error: deleteError } = await supabase
      .from('sketches')
      .delete()
      .in('id', idsToDelete);
    
    if (deleteError) {
      console.error('❌ Error deleting sketches:', deleteError.message);
    } else {
      console.log(`✅ Deleted ${idsToDelete.length} excess sketches`);
    }
  }
  
  // Verify final state
  console.log('\n🔍 Verifying final state...');
  const { data: finalSketches, error: finalError } = await supabase
    .from('sketches')
    .select('artist_name')
    .order('artist_name');
  
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
  
  console.log(`\n✅ Total sketches after cleanup: ${finalSketches.length}`);
}

// Run the cleanup
cleanupDatabase().catch(console.error);
