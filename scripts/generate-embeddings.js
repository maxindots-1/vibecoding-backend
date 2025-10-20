/**
 * Script to generate embeddings for all sketches and upload to Supabase
 * Usage: node scripts/generate-embeddings.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai').default;
require('dotenv').config();

// Initialize clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

async function processSketch(sketch) {
  // Build text for embedding
  const embeddingText = `
    ${sketch.title}
    ${sketch.artist_name}
    ${sketch.description}
    ${sketch.visual_description || ''}
    ${sketch.tags ? sketch.tags.join(', ') : ''}
    Body parts: ${sketch.body_parts.join(', ')}
    Size: ${sketch.size}
    Style: ${sketch.style || ''}
    Meaning level: ${sketch.meaning_level || ''}
    Visibility: ${sketch.visibility_level || ''}
    Chaos/Order: ${sketch.chaos_order_level || ''}
  `.trim();

  console.log(`\n📝 Processing: ${sketch.title} (${sketch.id})`);
  
  // Generate embedding
  const embedding = await generateEmbedding(embeddingText);
  console.log(`✅ Generated embedding (${embedding.length} dimensions)`);

  // Prepare data for Supabase
  const sketchData = {
    ...sketch,
    embedding,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Upload to Supabase
  const { data, error } = await supabase
    .from('sketches')
    .upsert(sketchData, { onConflict: 'id' })
    .select();

  if (error) {
    console.error(`❌ Error uploading ${sketch.id}:`, error.message);
    throw error;
  }

  console.log(`✅ Uploaded to Supabase: ${sketch.id}`);
  return data;
}

async function main() {
  console.log('🚀 Starting embedding generation process...\n');

  // Check environment variables
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Missing OPENAI_API_KEY environment variable');
    process.exit(1);
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }

  // Load sketches from JSON file
  const sketchesPath = path.join(__dirname, '../../data/sketches.json');
  
  if (!fs.existsSync(sketchesPath)) {
    console.error(`❌ Sketches file not found: ${sketchesPath}`);
    process.exit(1);
  }

  const sketches = JSON.parse(fs.readFileSync(sketchesPath, 'utf8'));
  console.log(`📦 Loaded ${sketches.length} sketches from data/sketches.json`);

  // Process each sketch
  let successCount = 0;
  let errorCount = 0;

  for (const sketch of sketches) {
    try {
      await processSketch(sketch);
      successCount++;
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Failed to process ${sketch.id}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Successfully processed: ${successCount} sketches`);
  if (errorCount > 0) {
    console.log(`❌ Failed: ${errorCount} sketches`);
  }
  console.log('='.repeat(50) + '\n');
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

