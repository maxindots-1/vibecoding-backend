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

async function cleanStorage() {
  console.log('🚀 Cleaning storage to match database...');
  
  // Get all sketches from database
  const { data: sketches, error: dbError } = await supabase
    .from('sketches')
    .select('image_filename');
  
  if (dbError) {
    console.error('❌ Error fetching database sketches:', dbError.message);
    return;
  }
  
  console.log(`📊 Sketches in Database: ${sketches.length}`);
  
  // Get all files from storage
  const { data: storageFiles, error: storageError } = await supabase.storage
    .from('sketch-images')
    .list('');
  
  if (storageError) {
    console.error('❌ Error fetching storage files:', storageError.message);
    return;
  }
  
  console.log(`📁 Files in Storage: ${storageFiles.length}`);
  
  // Create a set of database filenames
  const dbFilenames = new Set(sketches.map(sketch => sketch.image_filename));
  
  // Find files that don't have corresponding database records
  const filesToDelete = storageFiles.filter(file => !dbFilenames.has(file.name));
  
  console.log(`🗑️  Files to delete: ${filesToDelete.length}`);
  
  if (filesToDelete.length > 0) {
    const filePaths = filesToDelete.map(file => file.name);
    
    const { error: deleteError } = await supabase.storage
      .from('sketch-images')
      .remove(filePaths);
    
    if (deleteError) {
      console.error('❌ Error deleting files:', deleteError.message);
    } else {
      console.log(`✅ Deleted ${filePaths.length} files from storage`);
    }
  }
  
  // Verify final state
  const { data: finalStorageFiles, error: finalStorageError } = await supabase.storage
    .from('sketch-images')
    .list('');
  
  if (finalStorageError) {
    console.error('❌ Error fetching final storage files:', finalStorageError.message);
    return;
  }
  
  console.log(`\n✅ Final state:`);
  console.log(`📊 Database records: ${sketches.length}`);
  console.log(`📁 Storage files: ${finalStorageFiles.length}`);
  
  if (sketches.length === finalStorageFiles.length) {
    console.log('🎉 Perfect match between database and storage!');
  } else {
    console.log(`⚠️  Still ${Math.abs(sketches.length - finalStorageFiles.length)} difference`);
  }
}

// Run the cleanup
cleanStorage().catch(console.error);
