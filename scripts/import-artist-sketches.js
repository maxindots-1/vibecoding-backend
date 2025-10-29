import { createClient } from '@supabase/supabase-js';
import { generateEmbedding, generateVisualDescription, generateArtistDescription, analyzeSketchMetadata } from '../lib/openai.js';
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

// Valid values for validation
const VALID_SIZES = ['small', 'medium', 'large'];
const VALID_BODY_PARTS = ['arm', 'leg', 'chest', 'back', 'neck', 'stomach', 'wrist', 'ankle'];

/**
 * Parse filename to extract metadata
 * Format: sketch-title_size_bodypart.png
 */
function parseFileName(filename) {
  const withoutExt = path.basename(filename, '.png');
  const parts = withoutExt.split('_');
  
  if (parts.length !== 3) {
    throw new Error(`Invalid filename format: ${filename}. Expected: title_size_bodypart.png`);
  }
  
  const [title, size, bodyPart] = parts;
  
  // Validate size
  if (!VALID_SIZES.includes(size)) {
    throw new Error(`Invalid size: ${size}. Valid values: ${VALID_SIZES.join(', ')}`);
  }
  
  // Validate body part
  if (!VALID_BODY_PARTS.includes(bodyPart)) {
    throw new Error(`Invalid body part: ${bodyPart}. Valid values: ${VALID_BODY_PARTS.join(', ')}`);
  }
  
  return {
    title: title.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Convert to title case
    size,
    body_parts: [bodyPart]
  };
}

/**
 * Calculate price based on size and complexity rules
 */
function calculatePrice(size, complexity) {
  const basePrices = {
    small: 1200,
    medium: 2200,
    large: 3500
  };
  
  const complexityMultipliers = {
    low: 0.8,
    medium: 1.0,
    high: 1.3
  };
  
  const basePrice = basePrices[size];
  const multiplier = complexityMultipliers[complexity];
  
  return Math.round(basePrice * multiplier);
}

/**
 * Read artist bio from file
 */
function readArtistBio(artistFolder) {
  const bioPath = path.join(artistFolder, 'artist-bio.txt');
  
  if (!fs.existsSync(bioPath)) {
    throw new Error(`Artist bio file not found: ${bioPath}`);
  }
  
  return fs.readFileSync(bioPath, 'utf-8').trim();
}

/**
 * Scan artist folders and get all sketches
 */
function scanArtistFolders() {
  const artists = [];
  
  try {
    const folders = fs.readdirSync(SKETCHES_FOLDER, { withFileTypes: true });
    
    for (const folder of folders) {
      if (folder.isDirectory() && folder.name !== 'node_modules') {
        const artistPath = path.join(SKETCHES_FOLDER, folder.name);
        
        try {
          const artistBio = readArtistBio(artistPath);
          
          // Get all PNG files
          const files = fs.readdirSync(artistPath);
          const sketchFiles = files.filter(file => file.endsWith('.png'));
          
          if (sketchFiles.length === 0) {
            console.log(`⚠️  No PNG files found in ${folder.name}`);
            continue;
          }
          
          artists.push({
            name: folder.name,
            bio: artistBio,
            sketches: sketchFiles,
            folderPath: artistPath
          });
          
          console.log(`✅ Found artist: ${folder.name} with ${sketchFiles.length} sketches`);
          
        } catch (error) {
          console.error(`❌ Error reading artist ${folder.name}:`, error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('Error scanning artist folders:', error);
  }
  
  return artists;
}

/**
 * Upload file to Supabase Storage
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
 * Generate Supabase Storage URL for sketch images
 */
function getSketchImageUrl(filename) {
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;
}

/**
 * Process a single sketch: upload, analyze, and save to database
 */
async function processSketch(artist, sketchFile) {
  const filePath = path.join(artist.folderPath, sketchFile);
  
  try {
    console.log(`\n🎨 Processing: ${sketchFile}`);
    
    // Parse filename
    const parsedData = parseFileName(sketchFile);
    
    // Upload to storage
    const storagePath = await uploadFileToStorage(filePath, sketchFile);
    if (!storagePath) {
      throw new Error('Failed to upload to storage');
    }
    
    // Get image URL for AI analysis
    const imageUrl = getSketchImageUrl(sketchFile);
    
    // Generate descriptions and analyze metadata
    console.log(`📝 Generating descriptions and analyzing metadata...`);
    
    const [artistDescription, visualDescription, metadata] = await Promise.all([
      generateArtistDescription(imageUrl, artist.bio),
      generateVisualDescription(imageUrl),
      analyzeSketchMetadata(imageUrl)
    ]);
    
    // Calculate price
    const price = calculatePrice(parsedData.size, metadata.complexity);
    
    // Generate embedding
    console.log(`🧠 Generating embedding...`);
    const embedding = await generateEmbedding(visualDescription);
    
    // Create sketch data
    const sketchData = {
      title: parsedData.title,
      artist_name: artist.name,
      artist_bio: artist.bio,
      description: artistDescription,
      visual_description: visualDescription,
      body_parts: parsedData.body_parts,
      size: parsedData.size,
      price: price,
      image_filename: sketchFile,
      tags: metadata.tags,
      style: metadata.style,
      complexity: metadata.complexity,
      color_scheme: metadata.color_scheme,
      meaning_level: metadata.meaning_level,
      visibility_level: metadata.visibility_level,
      chaos_order_level: metadata.chaos_order_level,
      embedding: embedding
    };
    
    // Save to database
    console.log(`💾 Saving to database...`);
    const { data, error } = await supabase
      .from('sketches')
      .insert(sketchData);
    
    if (error) {
      console.error(`❌ Database insert failed:`, error);
      return false;
    }
    
    console.log(`✅ Successfully processed: ${parsedData.title}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error processing ${sketchFile}:`, error.message);
    return false;
  }
}

/**
 * Main import function
 */
async function importArtistSketches() {
  console.log('🚀 Starting artist sketches import...\n');
  
  // Scan artist folders
  const artists = scanArtistFolders();
  
  if (artists.length === 0) {
    console.log('❌ No artists found. Please create artist folders with sketches first.');
    return;
  }
  
  console.log(`\n📊 Found ${artists.length} artists:`);
  artists.forEach(artist => {
    console.log(`  - ${artist.name}: ${artist.sketches.length} sketches`);
  });
  
  let totalProcessed = 0;
  let totalErrors = 0;
  
  // Process each artist
  for (const artist of artists) {
    console.log(`\n🎨 Processing artist: ${artist.name}`);
    
    for (const sketchFile of artist.sketches) {
      const success = await processSketch(artist, sketchFile);
      
      if (success) {
        totalProcessed++;
      } else {
        totalErrors++;
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Final report
  console.log(`\n🎉 Import completed!`);
  console.log(`✅ Successfully processed: ${totalProcessed} sketches`);
  console.log(`❌ Errors: ${totalErrors} sketches`);
  
  // Test search functionality
  if (totalProcessed > 0) {
    console.log(`\n🔍 Testing search functionality...`);
    try {
      const testEmbedding = await generateEmbedding('small delicate tattoo design');
      const { data: testResults, error: testError } = await supabase.rpc('match_sketches', {
        query_embedding: testEmbedding,
        match_threshold: 0.1,
        match_count: 5
      });
      
      if (testError) {
        console.error('❌ Search test failed:', testError);
      } else {
        console.log(`✅ Search test successful! Found ${testResults?.length || 0} results`);
        if (testResults && testResults.length > 0) {
          console.log(`📋 Sample results:`);
          testResults.slice(0, 3).forEach((sketch, index) => {
            console.log(`  ${index + 1}. ${sketch.title} by ${sketch.artist_name}`);
          });
        }
      }
    } catch (error) {
      console.error('❌ Search test error:', error);
    }
  }
}

// Run the import
importArtistSketches().catch(console.error);
