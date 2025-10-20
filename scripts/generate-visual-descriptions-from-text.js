import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

/**
 * Generate visual description from existing text description
 * This is a temporary solution until we fix image access issues
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

async function main() {
  console.log('🚀 Starting visual description generation from text...\n');
  
  // Get all sketches without visual descriptions
  const { data: sketches, error } = await supabase
    .from('sketches')
    .select('*')
    .is('visual_description', null)
    .order('id');

  if (error) {
    console.error('Error fetching sketches:', error);
    return;
  }

  console.log(`Found ${sketches.length} sketches without visual descriptions\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const sketch of sketches) {
    console.log(`Processing: ${sketch.title} (${sketch.id})`);
    
    try {
      // Generate visual description from existing text data
      const visualDescription = generateVisualDescriptionFromText(sketch);
      
      // Update sketch in Supabase
      const { error: updateError } = await supabase
        .from('sketches')
        .update({ visual_description: visualDescription })
        .eq('id', sketch.id);

      if (updateError) {
        console.error(`Error updating ${sketch.id}:`, updateError);
        errorCount++;
      } else {
        console.log(`✅ Updated ${sketch.id}`);
        successCount++;
      }
    } catch (error) {
      console.error(`Error processing ${sketch.id}:`, error);
      errorCount++;
    }
  }

  console.log(`\n✅ Visual description generation completed!`);
  console.log(`✅ Successfully updated: ${successCount} sketches`);
  console.log(`❌ Errors: ${errorCount} sketches`);
}

main().catch(console.error);
