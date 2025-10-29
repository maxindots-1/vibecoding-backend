import { createClient } from '@supabase/supabase-js';
import { generateEmbedding, generateVisualDescription, generateArtistDescription, analyzeSketchMetadata, generateSketchTitle } from '../lib/openai.js';
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

const ARTISTS_FOLDER = path.join(__dirname, '../../Prelude/Sketches/Tattoo_artists');
const BUCKET_NAME = 'sketch-images';
const TOTAL_NEW_SKETCHES = 100; // Add 100 new sketches total

/**
 * Calculate price in USD based on size, complexity, and artist prestige
 */
function calculatePrice(size, complexity, artistName, style) {
  // Base prices in USD
  const basePrices = {
    small: 300,
    medium: 600,
    large: 1200
  };
  
  // Complexity multipliers
  const complexityMultipliers = {
    low: 0.8,
    medium: 1.0,
    high: 1.5
  };
  
  // Artist prestige multipliers (all artists are top-tier)
  const artistMultipliers = {
    'Sasha Unisex': 1.8,
    'Doctor Woo': 2.5,
    'Romeo Lacoste': 2.2,
    'Gakkin': 2.0,
    'Alessandro Capozzi': 1.9,
    'Mambo Tattooer': 2.0,
    'Okan Uckun': 1.8,
    'Matteo Nangeroni': 1.9,
    'Chen Jie': 1.7,
    'Kozo Tattoo': 1.8,
    'Matias Noble': 1.6,
    'Megan Massacre': 1.9,
    'Mr K': 1.5,
    'Oozy Tattoo': 1.8,
    'Pittak KM': 1.7,
    'Tattooist Banul': 1.8
  };
  
  // Style multipliers
  const styleMultipliers = {
    'fine-line': 1.2,
    'dotwork': 1.15,
    'minimalist': 1.1,
    'watercolor': 1.3,
    'geometric': 1.1,
    'realistic': 1.25,
    'traditional': 1.0,
    'newschool': 1.1
  };
  
  const basePrice = basePrices[size];
  const complexityMultiplier = complexityMultipliers[complexity] || 1.0;
  const artistMultiplier = artistMultipliers[artistName] || 1.5;
  const styleMultiplier = styleMultipliers[style] || 1.0;
  
  const finalPrice = Math.round(basePrice * complexityMultiplier * artistMultiplier * styleMultiplier);
  
  // Round to nearest 10 for beautiful prices
  return Math.round(finalPrice / 10) * 10;
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
 * Get artist name from folder name
 */
function getArtistName(folderName) {
  return folderName.replace(/\s+/g, ' ').trim();
}

/**
 * Check which sketches are already in database
 */
async function getExistingSketches() {
  const { data, error } = await supabase
    .from('sketches')
    .select('image_filename');
    
  if (error) {
    console.error('Error fetching existing sketches:', error);
    return new Set();
  }
  
  return new Set(data.map(sketch => sketch.image_filename));
}

/**
 * Scan all artist folders and select new sketches to add
 */
function scanArtistsForNewSketches(existingSketches) {
  const artists = [];
  
  if (!fs.existsSync(ARTISTS_FOLDER)) {
    throw new Error(`Artists folder not found: ${ARTISTS_FOLDER}`);
  }
  
  const folders = fs.readdirSync(ARTISTS_FOLDER);
  
  for (const folder of folders) {
    const artistPath = path.join(ARTISTS_FOLDER, folder);
    
    if (fs.statSync(artistPath).isDirectory()) {
      try {
        const artistBio = readArtistBio(artistPath);
        
        // Get all JPG files
        const files = fs.readdirSync(artistPath);
        const imageFiles = files.filter(file => file.endsWith('.jpg')).sort((a, b) => {
          const numA = parseInt(a.replace('.jpg', ''));
          const numB = parseInt(b.replace('.jpg', ''));
          return numA - numB;
        });
        
        if (imageFiles.length > 0) {
          // Filter out already processed sketches
          const newSketches = imageFiles.filter(file => {
            const storageFileName = `${getArtistName(folder).replace(/\s+/g, '_')}_${file}`;
            return !existingSketches.has(storageFileName);
          });
          
          artists.push({
            name: getArtistName(folder),
            bio: artistBio,
            sketches: newSketches,
            folderPath: artistPath,
            totalSketches: imageFiles.length,
            newSketches: newSketches.length
          });
          
          console.log(`✅ Found artist: ${getArtistName(folder)} with ${newSketches.length} new sketches (from ${imageFiles.length} total)`);
        }
        
      } catch (error) {
        console.error(`❌ Error reading artist ${folder}:`, error.message);
      }
    }
  }
  
  return artists;
}

/**
 * Calculate how many sketches to add per artist
 */
function calculateSketchesPerArtist(artists, totalNewSketches) {
  const sketchesPerArtist = Math.floor(totalNewSketches / artists.length);
  const remainder = totalNewSketches % artists.length;
  
  console.log(`📊 Distribution plan:`);
  console.log(`   - Base sketches per artist: ${sketchesPerArtist}`);
  console.log(`   - Extra sketches for first ${remainder} artists: 1 each`);
  
  return { sketchesPerArtist, remainder };
}

/**
 * Upload file to Supabase Storage
 */
async function uploadFileToStorage(filePath, fileName) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true // Overwrite if exists
      });

    if (error) {
      console.error(`❌ Error uploading ${fileName}:`, error);
      return null;
    }

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
async function processSketch(artist, sketchFile, index, totalSketches) {
  const filePath = path.join(artist.folderPath, sketchFile);
  
  try {
    console.log(`\n🎨 Processing: ${sketchFile} (${index + 1}/${totalSketches})`);
    
    // Create unique filename for storage
    const storageFileName = `${artist.name.replace(/\s+/g, '_')}_${sketchFile}`;
    
    // Upload to storage
    const storagePath = await uploadFileToStorage(filePath, storageFileName);
    if (!storagePath) {
      throw new Error('Failed to upload to storage');
    }
    
    // Get image URL for AI analysis
    const imageUrl = getSketchImageUrl(storageFileName);
    
    // Generate descriptions and analyze metadata
    console.log(`📝 Generating descriptions and analyzing metadata...`);
    
    const [artistDescription, visualDescription, metadata] = await Promise.all([
      generateArtistDescription(imageUrl, artist.bio),
      generateVisualDescription(imageUrl),
      analyzeSketchMetadata(imageUrl)
    ]);
    
    // Generate meaningful title
    const meaningfulTitle = await generateSketchTitle(imageUrl, metadata, artist.name);
    
    // Calculate price
    const price = calculatePrice(metadata.size || 'medium', metadata.complexity, artist.name, metadata.style);
    
    // Generate embedding
    console.log(`🧠 Generating embedding...`);
    const embedding = await generateEmbedding(visualDescription);
    
    // Create sketch data
    const sketchData = {
      id: crypto.randomUUID(),
      title: meaningfulTitle,
      artist_name: artist.name,
      artist_bio: artist.bio,
      description: artistDescription,
      visual_description: visualDescription,
      suitable_body_parts: [metadata.body_part || 'arm'],
      size: metadata.size || 'medium',
      price: price,
      image_filename: storageFileName,
      tags: metadata.tags || ['tattoo', 'design'],
      style: metadata.style || 'traditional',
      complexity: metadata.complexity || 'medium',
      color_scheme: metadata.color_scheme || 'black-and-white',
      meaning: metadata.meaning_level || 'medium',
      visibility: metadata.visibility_level || 'medium',
      chaos_order: metadata.chaos_order_level || 'balanced',
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
    
    console.log(`✅ Successfully processed: ${sketchData.title} - $${price}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error processing ${sketchFile}:`, error.message);
    return false;
  }
}

/**
 * Main processing function
 */
async function add100Sketches() {
  console.log('🚀 Starting to add 100 new sketches evenly distributed among artists...\n');
  
  // Get existing sketches to avoid duplicates
  console.log('🔍 Checking existing sketches in database...');
  const existingSketches = await getExistingSketches();
  console.log(`📊 Found ${existingSketches.size} existing sketches in database\n`);
  
  // Scan all artists for new sketches
  const artists = scanArtistsForNewSketches(existingSketches);
  
  if (artists.length === 0) {
    console.error('❌ No artists found');
    return;
  }
  
  // Calculate distribution
  const { sketchesPerArtist, remainder } = calculateSketchesPerArtist(artists, TOTAL_NEW_SKETCHES);
  
  console.log(`\n📊 Found ${artists.length} artists for processing:`);
  artists.forEach((artist, index) => {
    const sketchesToProcess = sketchesPerArtist + (index < remainder ? 1 : 0);
    console.log(`  - ${artist.name}: ${sketchesToProcess} new sketches (from ${artist.newSketches} available)`);
  });
  
  let totalProcessed = 0;
  let totalErrors = 0;
  
  console.log(`\n🎯 Total new sketches to add: ${TOTAL_NEW_SKETCHES}\n`);
  
  // Process each artist
  for (let artistIndex = 0; artistIndex < artists.length; artistIndex++) {
    const artist = artists[artistIndex];
    const sketchesToProcess = sketchesPerArtist + (artistIndex < remainder ? 1 : 0);
    
    console.log(`\n🎨 Processing artist: ${artist.name} (${artistIndex + 1}/${artists.length})`);
    console.log(`📋 New sketches to process: ${sketchesToProcess}`);
    
    // Take only the number of sketches we need for this artist
    const sketchesToAdd = artist.sketches.slice(0, sketchesToProcess);
    
    // Process each sketch for this artist
    for (let sketchIndex = 0; sketchIndex < sketchesToAdd.length; sketchIndex++) {
      const sketchFile = sketchesToAdd[sketchIndex];
      const globalIndex = totalProcessed + totalErrors;
      
      const success = await processSketch(artist, sketchFile, globalIndex, TOTAL_NEW_SKETCHES);
      
      if (success) {
        totalProcessed++;
      } else {
        totalErrors++;
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`✅ Completed artist: ${artist.name} (${sketchesToAdd.length} sketches added)`);
  }
  
  // Final report
  console.log(`\n🎉 Adding 100 sketches completed!`);
  console.log(`✅ Successfully processed: ${totalProcessed} sketches`);
  console.log(`❌ Errors: ${totalErrors} sketches`);
  console.log(`📊 Success rate: ${((totalProcessed / (totalProcessed + totalErrors)) * 100).toFixed(1)}%`);
  console.log(`💰 Estimated cost: $${(totalProcessed * 0.065).toFixed(2)}`);
  
  // Test search functionality
  if (totalProcessed > 0) {
    console.log(`\n🔍 Testing search functionality...`);
    try {
      const testEmbedding = await generateEmbedding('watercolor tattoo design');
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
            console.log(`  ${index + 1}. ${sketch.title} by ${sketch.artist_name} - $${sketch.price}`);
          });
        }
      }
    } catch (error) {
      console.error('❌ Search test error:', error);
    }
  }
}

// Run the script
add100Sketches().catch(console.error);
