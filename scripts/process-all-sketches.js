import { createClient } from '@supabase/supabase-js';
import { generateEmbedding, generateVisualDescription } from '../lib/openai.js';
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

const BUCKET_NAME = 'sketch-images';

/**
 * Generate Supabase Storage URL for sketch images
 */
function getSketchImageUrl(filename) {
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;
}

/**
 * Process a single sketch: generate visual description and embedding
 */
async function processSketch(sketch) {
  console.log(`\n🎨 Processing: ${sketch.title} (${sketch.id})`);
  
  try {
    // Step 1: Generate visual description from image
    console.log(`📝 Generating visual description...`);
    const imageUrl = getSketchImageUrl(sketch.image_filename);
    console.log(`🖼️  Image URL: ${imageUrl}`);
    
    let visualDescription;
    try {
      visualDescription = await generateVisualDescription(imageUrl);
      console.log(`✅ Visual description generated (${visualDescription.length} chars)`);
    } catch (error) {
      console.log(`⚠️  Could not generate visual description from image: ${error.message}`);
      console.log(`📝 Generating from text data instead...`);
      
      // Fallback: generate from existing text data
      visualDescription = generateVisualDescriptionFromText(sketch);
      console.log(`✅ Generated from text data (${visualDescription.length} chars)`);
    }
    
    // Step 2: Generate embedding
    console.log(`🧠 Generating embedding...`);
    const embedding = await generateEmbedding(visualDescription);
    console.log(`✅ Embedding generated (${embedding.length} dimensions)`);
    
    // Step 3: Update database
    console.log(`💾 Updating database...`);
    const { error: updateError } = await supabase
      .from('sketches')
      .update({ 
        visual_description: visualDescription,
        embedding: embedding
      })
      .eq('id', sketch.id);

    if (updateError) {
      console.error(`❌ Database update failed:`, updateError);
      return false;
    }
    
    console.log(`✅ ${sketch.id} processed successfully!`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error processing ${sketch.id}:`, error);
    return false;
  }
}

/**
 * Generate visual description from existing text data (fallback)
 */
function generateVisualDescriptionFromText(sketch) {
  const { title, description, tags, style, complexity, color_scheme } = sketch;
  
  let visualDescription = `The tattoo sketch "${title}" features a ${style} design with ${complexity} complexity. `;
  
  // Add style-specific details
  if (style === 'fine-line') {
    visualDescription += 'The artwork uses delicate, precise linework with intricate details. ';
  } else if (style === 'bold') {
    visualDescription += 'The design employs bold, thick lines with strong visual impact. ';
  } else if (style === 'watercolor') {
    visualDescription += 'The piece incorporates watercolor-style elements with flowing, organic shapes. ';
  }
  
  // Add complexity details
  if (complexity === 'high') {
    visualDescription += 'The composition is highly detailed with multiple interconnected elements. ';
  } else if (complexity === 'medium') {
    visualDescription += 'The design balances detail with clarity, featuring well-defined elements. ';
  } else if (complexity === 'low') {
    visualDescription += 'The artwork is clean and minimalist with simple, elegant forms. ';
  }
  
  // Add color scheme details
  if (color_scheme === 'black-and-white') {
    visualDescription += 'The piece is rendered in classic black and white, emphasizing contrast and form. ';
  } else if (color_scheme === 'colorful') {
    visualDescription += 'The design incorporates vibrant colors that enhance the visual impact. ';
  } else if (color_scheme === 'monochrome') {
    visualDescription += 'The artwork uses a monochrome palette with subtle variations in tone. ';
  }
  
  // Add description-based details
  if (description) {
    visualDescription += `The design concept: ${description.substring(0, 200)}... `;
  }
  
  // Add tag-based elements
  if (tags && tags.length > 0) {
    visualDescription += `Key visual elements include: ${tags.slice(0, 5).join(', ')}. `;
  }
  
  visualDescription += 'The overall composition is designed to work well as a tattoo, with clear lines and balanced proportions suitable for body art.';
  
  return visualDescription;
}

/**
 * Check which sketches need processing
 */
async function getSketchesToProcess() {
  const { data: sketches, error } = await supabase
    .from('sketches')
    .select('*')
    .order('id');

  if (error) {
    console.error('Error fetching sketches:', error);
    return [];
  }

  // Filter sketches that need visual description or embedding
  const toProcess = sketches.filter(sketch => 
    !sketch.visual_description || 
    !sketch.embedding || 
    sketch.embedding.length === 0
  );

  return { all: sketches, toProcess };
}

/**
 * Main processing function
 */
async function main() {
  console.log('🚀 Starting complete sketch processing...\n');
  
  const { all: allSketches, toProcess } = await getSketchesToProcess();
  
  console.log(`📊 Total sketches in database: ${allSketches.length}`);
  console.log(`🔄 Sketches needing processing: ${toProcess.length}`);
  
  if (toProcess.length === 0) {
    console.log('✅ All sketches are already processed!');
    return;
  }
  
  console.log('\n📝 Sketches to process:');
  toProcess.forEach(sketch => {
    console.log(`  - ${sketch.id}: ${sketch.title}`);
  });
  
  let successCount = 0;
  let errorCount = 0;
  
  console.log('\n🎨 Starting processing...');
  
  for (const sketch of toProcess) {
    const success = await processSketch(sketch);
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
    
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n🎉 Processing completed!`);
  console.log(`✅ Successfully processed: ${successCount} sketches`);
  console.log(`❌ Errors: ${errorCount} sketches`);
  console.log(`📊 Total sketches now ready: ${allSketches.length}`);
  
  console.log('\n🔍 Testing search...');
  const testEmbedding = await generateEmbedding('small delicate tattoo design');
  const { data: testResults, error: testError } = await supabase.rpc('match_sketches', {
    query_embedding: testEmbedding,
    match_threshold: 0.1,
    match_count: 10
  });
  
  if (testError) {
    console.error('❌ Search test failed:', testError);
  } else {
    console.log(`✅ Search test successful! Found ${testResults?.length || 0} results`);
  }
}

main().catch(console.error);
