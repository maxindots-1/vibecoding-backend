import { createClient } from '@supabase/supabase-js';
import { generateVisualDescription } from '../lib/openai.js';
import { getSketchImageUrl } from '../lib/supabase.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('🎨 Generating visual descriptions for all sketches...\n');

  // Fetch all sketches
  const { data: sketches, error } = await supabase
    .from('sketches')
    .select('id, title, image_filename');

  if (error) throw error;

  console.log(`Found ${sketches.length} sketches\n`);

  for (const sketch of sketches) {
    console.log(`Processing: ${sketch.title} (${sketch.id})`);
    
    // Get image URL
    const imageUrl = getSketchImageUrl(sketch.image_filename);
    console.log(`Image URL: ${imageUrl}`);
    
    try {
      // Generate visual description using GPT-4 Vision
      const visualDescription = await generateVisualDescription(imageUrl);
      console.log(`Generated description: ${visualDescription.substring(0, 100)}...`);
      
      // Update sketch in Supabase
      const { error: updateError } = await supabase
        .from('sketches')
        .update({ visual_description: visualDescription })
        .eq('id', sketch.id);
      
      if (updateError) {
        console.error(`Error updating ${sketch.id}:`, updateError);
      } else {
        console.log(`✅ Updated ${sketch.title}\n`);
      }
    } catch (error) {
      console.error(`Error processing ${sketch.id}:`, error);
    }
    
    // Rate limiting: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('✅ All visual descriptions generated!');
}

main().catch(console.error);
