import { createClient } from '@supabase/supabase-js';
import { generateEmbedding, generateVisualDescription } from '../../../lib/openai.js';
import OpenAI from 'openai';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const BUCKET_NAME = 'sketch-images';

/**
 * Upload sketch image to Supabase Storage
 */
async function uploadImageToStorage(imageFile) {
  try {
    // Generate unique filename
    const fileExtension = path.extname(imageFile.name);
    const uniqueFilename = `${randomUUID()}${fileExtension}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(uniqueFilename, imageFile, {
        contentType: imageFile.type,
        upsert: true
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    return uniqueFilename;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Generate visual description from image
 */
async function generateVisualDescriptionFromImage(imageFilename) {
  try {
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${imageFilename}`;
    return await generateVisualDescription(imageUrl);
  } catch (error) {
    console.error('Error generating visual description:', error);
    // Fallback: generate from text data
    throw error;
  }
}

/**
 * Generate visual description from text data (fallback)
 */
function generateVisualDescriptionFromText(sketchData) {
  const { title, description, tags, style, complexity, color_scheme } = sketchData;
  
  let visualDescription = `The tattoo sketch "${title}" features a ${style} design with ${complexity} complexity. `;
  
  // Add style-specific details
  if (style === 'fine-line') {
    visualDescription += 'The artwork uses delicate, precise linework with intricate details. ';
  } else if (style === 'bold') {
    visualDescription += 'The design employs bold, thick lines with strong visual impact. ';
  } else if (style === 'watercolor') {
    visualDescription += 'The piece incorporates watercolor-style elements with flowing, organic shapes. ';
  } else if (style === 'realistic') {
    visualDescription += 'The design features realistic, detailed artwork with lifelike elements. ';
  } else if (style === 'geometric') {
    visualDescription += 'The artwork uses precise geometric shapes and mathematical precision. ';
  } else if (style === 'traditional') {
    visualDescription += 'The design follows traditional tattoo styles with classic elements. ';
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
 * Generate missing fields using AI
 */
async function generateMissingFields(sketchData, imageUrl) {
  try {
    const prompt = `Analyze this tattoo sketch and generate missing metadata. Here's what we know:
    
Title: ${sketchData.title}
Artist: ${sketchData.artist_name}
Description: ${sketchData.description}
Body Parts: ${sketchData.body_parts.join(', ')}
Size: ${sketchData.size.join(', ')}
Price: $${sketchData.price}

Please generate the following fields if they're missing or null, based on the image and description:

1. Tags: 3-5 relevant tags (comma-separated, lowercase, no spaces)
2. Style: one of: fine-line, bold, realistic, geometric, traditional
3. Complexity: one of: low, medium, high
4. Meaning Level: one of: low (visual impact), medium (balanced), high (deep meaning)
5. Visibility Level: one of: low (hidden), medium (moderate), high (very visible)
6. Chaos/Order Level: one of: chaos, balanced, order

Return ONLY a JSON object with the fields that need to be generated. Example:
{
  "tags": "minimal, geometric, black-and-white",
  "style": "geometric",
  "complexity": "medium",
  "meaning_level": "low",
  "visibility_level": "medium",
  "chaos_order_level": "order"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert tattoo analyst. Analyze tattoo sketches and generate appropriate metadata.'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const generatedData = JSON.parse(response.choices[0].message.content);
    
    // Merge with existing data, only using generated values for null/empty fields
    // Ensure tags is always an array
    const tagsArray = generatedData.tags ? 
      generatedData.tags.split(',').map(tag => tag.trim()) : 
      (sketchData.tags || []);
    
    return {
      tags: tagsArray,
      style: sketchData.style || generatedData.style,
      complexity: sketchData.complexity || generatedData.complexity,
      meaning_level: sketchData.meaning_level || generatedData.meaning_level,
      visibility_level: sketchData.visibility_level || generatedData.visibility_level,
      chaos_order_level: sketchData.chaos_order_level || generatedData.chaos_order_level,
    };
  } catch (error) {
    console.error('Error generating missing fields:', error);
    // Return defaults if AI generation fails
    return {
      tags: sketchData.tags || ['tattoo', 'black-and-white'],
      style: sketchData.style || 'traditional',
      complexity: sketchData.complexity || 'medium',
      meaning_level: sketchData.meaning_level || 'medium',
      visibility_level: sketchData.visibility_level || 'medium',
      chaos_order_level: sketchData.chaos_order_level || 'balanced',
    };
  }
}

/**
 * Generate embedding for the sketch
 */
async function generateSketchEmbedding(visualDescription) {
  try {
    return await generateEmbedding(visualDescription);
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Save sketch to database
 */
async function saveSketchToDatabase(sketchData, imageFilename, visualDescription, embedding) {
  try {
    const sketchRecord = {
      id: `sketch-${randomUUID()}`, // Generate unique ID
      title: sketchData.title,
      artist_name: sketchData.artist_name,
      artist_bio: sketchData.artist_bio,
      description: sketchData.description,
      body_parts: sketchData.body_parts,
      size: sketchData.size,
      price: sketchData.price,
      image_filename: imageFilename,
      tags: sketchData.tags,
      style: sketchData.style,
      complexity: sketchData.complexity,
      color_scheme: 'black-and-white', // Always black and white
      meaning_level: sketchData.meaning_level,
      visibility_level: sketchData.visibility_level,
      chaos_order_level: sketchData.chaos_order_level,
      notes: sketchData.notes,
      visual_description: visualDescription,
      embedding: embedding
    };

    const { data, error } = await supabase
      .from('sketches')
      .insert([sketchRecord])
      .select('id')
      .single();

    if (error) {
      throw new Error(`Database insert failed: ${error.message}`);
    }

    return data.id;
  } catch (error) {
    console.error('Error saving to database:', error);
    throw error;
  }
}

/**
 * API endpoint for uploading sketches
 */
export async function POST(request) {
  try {
    console.log('=== SKETCH UPLOAD START ===');
    
    // Parse form data
    const formData = await request.formData();
    const sketchDataJson = formData.get('sketchData');
    const imageFile = formData.get('image');

    if (!sketchDataJson || !imageFile) {
      return Response.json({
        success: false,
        error: 'Missing sketch data or image file'
      }, { status: 400 });
    }

    // Parse sketch data
    let sketchData;
    try {
      sketchData = JSON.parse(sketchDataJson);
    } catch (error) {
      return Response.json({
        success: false,
        error: 'Invalid sketch data format'
      }, { status: 400 });
    }

    console.log('Sketch data:', sketchData);
    console.log('Image file:', imageFile.name, imageFile.size, 'bytes');

    // Step 1: Upload image to storage
    console.log('Step 1: Uploading image...');
    const imageFilename = await uploadImageToStorage(imageFile);
    console.log('Image uploaded:', imageFilename);

    // Step 2: Generate visual description
    console.log('Step 2: Generating visual description...');
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${imageFilename}`;
    let visualDescription;
    try {
      visualDescription = await generateVisualDescriptionFromImage(imageFilename);
      console.log('Visual description generated from image');
    } catch (error) {
      console.log('Falling back to text-based description');
      visualDescription = generateVisualDescriptionFromText(sketchData);
    }
    console.log('Visual description length:', visualDescription.length);

    // Step 3: Generate missing fields using AI
    console.log('Step 3: Generating missing fields with AI...');
    const generatedFields = await generateMissingFields(sketchData, imageUrl);
    console.log('Generated fields:', generatedFields);
    
    // Ensure all array fields are properly formatted
    const finalSketchData = {
      ...sketchData,
      ...generatedFields,
      body_parts: Array.isArray(sketchData.body_parts) ? sketchData.body_parts : [sketchData.body_parts],
      size: sketchData.size, // Keep as single TEXT value
      tags: Array.isArray(generatedFields.tags) ? generatedFields.tags : (generatedFields.tags ? generatedFields.tags.split(',').map(tag => tag.trim()) : [])
    };

    // Step 4: Generate embedding
    console.log('Step 4: Generating embedding...');
    const embedding = await generateSketchEmbedding(visualDescription);
    console.log('Embedding generated:', embedding.length, 'dimensions');

    // Step 5: Save to database
    console.log('Step 5: Saving to database...');
    const sketchId = await saveSketchToDatabase(finalSketchData, imageFilename, visualDescription, embedding);
    console.log('Saved to database with ID:', sketchId);

    console.log('=== SKETCH UPLOAD SUCCESS ===');

    return Response.json({
      success: true,
      sketch_id: sketchId,
      image_filename: imageFilename,
      message: 'Sketch uploaded and processed successfully'
    });

  } catch (error) {
    console.error('=== SKETCH UPLOAD ERROR ===');
    console.error('Error:', error);
    
    return Response.json({
      success: false,
      error: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}