const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Artist folders mapping
const artistFolders = {
  'Chen Jie': 'Chen Jie',
  'Doctor Woo': 'Doctor Woo',
  'Gakkin': 'Gakkin',
  'Kozo Tattoo': 'Kozo Tattoo',
  'Matteo Nangeroni': 'Matteo Nangeroni',
  'Megan Massacre': 'Megan Massacre',
  'Okan Uckun': 'Okan Uckun',
  'Oozy Tattoo': 'Oozy Tattoo',
  'Pittak KM': 'Pittak KM',
  'Romeo Lacoste': 'Romeo Lacoste',
  'Sasha Unisex': 'Sasha Unisex',
  'Tattooist Banul': 'Tattooist Banul',
  'Matias Noble': 'Matias Noble',
  'Mr K': 'Mr K'
};

async function uploadAllArtists() {
  console.log('🚀 Starting upload of all artists...');
  
  const basePath = '/Users/maximshishkin/Documents/Dots/Web/Vibecoding/Prelude/Sketches/Tattoo_artists';
  
  for (const [artistName, folderName] of Object.entries(artistFolders)) {
    console.log(`\n📁 Processing ${artistName}...`);
    
    const artistPath = path.join(basePath, folderName);
    
    if (!fs.existsSync(artistPath)) {
      console.log(`❌ Folder not found: ${artistPath}`);
      continue;
    }
    
    // Get all JPG files in the folder
    const files = fs.readdirSync(artistPath)
      .filter(file => file.endsWith('.jpg'))
      .sort((a, b) => {
        const numA = parseInt(a.replace('.jpg', ''));
        const numB = parseInt(b.replace('.jpg', ''));
        return numA - numB;
      });
    
    console.log(`📊 Found ${files.length} files for ${artistName}`);
    
    // Upload first 20 files (to match the database records)
    const filesToUpload = files.slice(0, 20);
    
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const filePath = path.join(artistPath, file);
      const fileName = `${artistName.replace(/\s+/g, '_')}_${i + 1}.jpg`;
      
      try {
        // Read file
        const fileBuffer = fs.readFileSync(filePath);
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('sketch-images')
          .upload(fileName, fileBuffer, {
            contentType: 'image/jpeg',
            upsert: true
          });
        
        if (error) {
          console.log(`❌ Error uploading ${fileName}:`, error.message);
        } else {
          console.log(`✅ Uploaded ${fileName}`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`❌ Error processing ${fileName}:`, error.message);
      }
    }
  }
  
  console.log('\n🎉 Upload completed!');
}

// Run the upload
uploadAllArtists().catch(console.error);
