import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SKETCHES_FOLDER = path.join(__dirname, '../../Prelude/Sketches');
const BUCKET_NAME = 'sketch-images';

/**
 * Upload a single file to Supabase Storage
 */
async function uploadFileToStorage(filePath, fileName) {
  try {
    console.log(`📤 Uploading ${fileName}...`);
    
    const fileBuffer = fs.readFileSync(filePath);
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileBuffer, {
        contentType: 'image/png',
        upsert: true // Overwrite if exists
      });

    if (error) {
      console.error(`❌ Error uploading ${fileName}:`, error);
      return null;
    }

    console.log(`✅ Uploaded ${fileName}`);
    return data.path;
  } catch (error) {
    console.error(`❌ Error reading ${fileName}:`, error);
    return null;
  }
}

/**
 * Get all files from the Sketches folder
 */
function getSketchFiles() {
  try {
    const files = fs.readdirSync(SKETCHES_FOLDER);
    return files.filter(file => file.endsWith('.png'));
  } catch (error) {
    console.error('Error reading Sketches folder:', error);
    return [];
  }
}

/**
 * Update database with correct file names
 */
async function updateDatabaseFileNames() {
  console.log('\n🔄 Updating database file names...');
  
  const files = getSketchFiles();
  const { data: sketches, error } = await supabase
    .from('sketches')
    .select('id, image_filename')
    .order('id');

  if (error) {
    console.error('Error fetching sketches:', error);
    return;
  }

  let updatedCount = 0;
  
  for (const sketch of sketches) {
    const { image_filename } = sketch;
    
    // Check if file exists in folder
    const filePath = path.join(SKETCHES_FOLDER, image_filename);
    if (fs.existsSync(filePath)) {
      // Upload to storage
      const storagePath = await uploadFileToStorage(filePath, image_filename);
      if (storagePath) {
        updatedCount++;
      }
    } else {
      console.log(`⚠️  File ${image_filename} not found in folder for ${sketch.id}`);
    }
  }
  
  console.log(`✅ Updated ${updatedCount} files in storage`);
}

/**
 * Upload all files from Sketches folder
 */
async function uploadAllFiles() {
  console.log('🚀 Starting upload of all sketch files...\n');
  
  const files = getSketchFiles();
  console.log(`Found ${files.length} files in Sketches folder:`);
  files.forEach(file => console.log(`  - ${file}`));
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    const filePath = path.join(SKETCHES_FOLDER, file);
    const storagePath = await uploadFileToStorage(filePath, file);
    
    if (storagePath) {
      successCount++;
    } else {
      errorCount++;
    }
  }

  console.log(`\n✅ Upload completed!`);
  console.log(`✅ Successfully uploaded: ${successCount} files`);
  console.log(`❌ Errors: ${errorCount} files`);
}

/**
 * List current files in storage
 */
async function listStorageFiles() {
  console.log('\n📋 Current files in Supabase Storage:');
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list();

  if (error) {
    console.error('Error listing files:', error);
    return;
  }

  if (data && data.length > 0) {
    data.forEach(file => {
      console.log(`  - ${file.name}`);
    });
    console.log(`\nTotal files in storage: ${data.length}`);
  } else {
    console.log('No files found in storage');
  }
}

async function main() {
  console.log('🎨 Sketch Upload and Management System\n');
  
  // List current storage contents
  await listStorageFiles();
  
  // Upload all files
  await uploadAllFiles();
  
  // List updated storage contents
  await listStorageFiles();
  
  console.log('\n🎉 All done! Files are now in Supabase Storage.');
  console.log('Next step: Run generate-embeddings.js to create embeddings for all sketches.');
}

main().catch(console.error);
