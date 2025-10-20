import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

/**
 * Generate embedding for a text using OpenAI
 * @param {string} text - Text to generate embedding for
 * @returns {Promise<Array<number>>} - Embedding vector
 */
export async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Build a comprehensive search prompt from user responses
 * @param {Object} userResponses - User's answers to discovery questions
 * @returns {string} - Formatted prompt for embedding
 */
export function buildPromptFromResponses(userResponses) {
  const {
    tattooExperience,
    size,
    sizeDescription,
    bodyPart,
    customBodyPart,
    visibility,
    visibilityDescription,
    meaningLevel,
    meaningDescription,
    chaosOrder,
    chaosOrderDescription,
    customText,
    voiceTranscript,
    moodboardDescription,
    userInput,
    customLettering
  } = userResponses;

  let prompt = 'Tattoo design preferences and requirements:\n\n';

  // Experience level - affects complexity recommendations
  if (tattooExperience) {
    const expText = tattooExperience === 'first-time' 
      ? 'First tattoo - looking for something meaningful yet approachable, possibly starting smaller'
      : 'Experienced with tattoos - open to more complex and bold designs';
    prompt += `${expText}\n\n`;
  }

  // Size preference - use semantic description if available, otherwise fallback to numeric
  if (sizeDescription) {
    // Use the semantic description from frontend
    let sizeText = '';
    if (sizeDescription.includes('Small')) {
      sizeText = 'Small and delicate design - minimal, subtle, intimate. Keywords: fine-line, delicate, minimal, small, subtle.';
    } else if (sizeDescription.includes('Medium')) {
      sizeText = 'Medium-sized design - noticeable but not overwhelming. Keywords: refined, elegant, balanced, moderate, statement piece.';
    } else {
      sizeText = 'Large and bold design - major commitment, full coverage. Keywords: large, bold, dramatic, powerful, expansive.';
    }
    prompt += `Size: ${sizeText}\n\n`;
  } else if (size) {
    // Fallback to numeric logic
    let sizeText = '';
    if (size < 25) {
      sizeText = 'Small and delicate design - minimal, subtle, intimate. Keywords: fine-line, delicate, minimal, small, subtle.';
    } else if (size < 50) {
      sizeText = 'Medium-small design - noticeable but not overwhelming. Keywords: refined, elegant, balanced, moderate.';
    } else if (size < 75) {
      sizeText = 'Medium-large design - substantial presence. Keywords: bold, statement piece, prominent, impactful.';
    } else {
      sizeText = 'Large and bold design - major commitment, full coverage. Keywords: large, bold, dramatic, powerful, expansive.';
    }
    prompt += `Size: ${sizeText}\n\n`;
  }

  // Body placement - affects design possibilities
  const placement = customBodyPart || bodyPart;
  if (placement) {
    prompt += `Placement: ${placement}. `;
    
    // Add context about placement implications
    const placementContext = {
      'arm': 'Versatile canvas, good for both detailed and bold designs',
      'leg': 'Great for larger pieces, allows vertical or wrapping compositions',
      'back': 'Large canvas perfect for expansive, detailed artwork',
      'chest': 'Intimate placement, often chosen for deeply meaningful designs',
      'shoulder': 'Dynamic area, works well for pieces that flow with body movement',
      'ribs': 'Personal and hidden, often chosen for deeply personal designs',
      'neck': 'Highly visible, bold statement placement',
      'hand': 'Very visible, requires careful design consideration',
      'foot': 'Delicate area, suited for smaller, artistic pieces'
    };
    
    if (placementContext[placement]) {
      prompt += placementContext[placement];
    }
    prompt += '\n\n';
  }

  // Visibility - use semantic description if available, otherwise fallback to numeric
  if (visibilityDescription) {
    // Use the semantic description from frontend
    let visText = '';
    if (visibilityDescription.includes('Completely private')) {
      visText = 'Private and personal - design should be intimate, hidden, personal significance. Keywords: private, intimate, hidden, personal.';
    } else if (visibilityDescription.includes('Subtle and personal')) {
      visText = 'Selectively visible - can be shown or hidden depending on context. Keywords: versatile, discreet, adaptable.';
    } else if (visibilityDescription.includes('Moderately visible')) {
      visText = 'Moderately visible - comfortable being seen in most settings. Keywords: visible, confident, expressive.';
    } else if (visibilityDescription.includes('Clearly visible')) {
      visText = 'Clearly visible - makes a statement. Keywords: bold, prominent, statement, expressive, visible.';
    } else if (visibilityDescription.includes('Bold and unmissable')) {
      visText = 'Highly visible and bold - embracing tattoo as public expression. Keywords: bold, prominent, statement, expressive, visible, unmissable.';
    }
    prompt += `Visibility: ${visText}\n\n`;
  } else if (visibility !== undefined && visibility !== null) {
    // Fallback to numeric logic
    let visText = '';
    if (visibility < 25) {
      visText = 'Private and personal - design should be intimate, hidden, personal significance. Keywords: private, intimate, hidden, personal.';
    } else if (visibility < 50) {
      visText = 'Selectively visible - can be shown or hidden depending on context. Keywords: versatile, discreet, adaptable.';
    } else if (visibility < 75) {
      visText = 'Moderately visible - comfortable being seen in most settings. Keywords: visible, confident, expressive.';
    } else {
      visText = 'Highly visible and bold - embracing tattoo as public expression. Keywords: bold, prominent, statement, expressive, visible.';
    }
    prompt += `Visibility: ${visText}\n\n`;
  }

  // Meaning vs Visual Impact - use semantic description if available, otherwise fallback to numeric
  if (meaningDescription) {
    // Use the semantic description from frontend
    let meaningText = '';
    if (meaningDescription.includes('Bold visual statement')) {
      meaningText = 'Visual impact first - aesthetic beauty, artistic expression, visual appeal over symbolism. Keywords: aesthetic, beautiful, artistic, visual, decorative.';
    } else if (meaningDescription.includes('Balanced approach')) {
      meaningText = 'Balanced approach - design should be both beautiful and meaningful. Keywords: balanced, aesthetic with meaning, thoughtful.';
    } else if (meaningDescription.includes('Deep personal meaning')) {
      meaningText = 'Deep meaning required - tattoo must carry profound personal or spiritual significance. Keywords: spiritual, profound, symbolic, philosophical, meaningful, sacred.';
    }
    prompt += `Meaning: ${meaningText}\n\n`;
  } else if (meaningLevel !== undefined && meaningLevel !== null) {
    // Fallback to numeric logic
    let meaningText = '';
    if (meaningLevel < 25) {
      meaningText = 'Visual impact first - aesthetic beauty, artistic expression, visual appeal over symbolism. Keywords: aesthetic, beautiful, artistic, visual, decorative.';
    } else if (meaningLevel < 50) {
      meaningText = 'Balanced approach - design should be both beautiful and meaningful. Keywords: balanced, aesthetic with meaning, thoughtful.';
    } else if (meaningLevel < 75) {
      meaningText = 'Meaning-focused - symbolism and personal significance are important. Keywords: symbolic, meaningful, personal, significant.';
    } else {
      meaningText = 'Deep meaning required - tattoo must carry profound personal or spiritual significance. Keywords: spiritual, profound, symbolic, philosophical, meaningful, sacred.';
    }
    prompt += `Meaning: ${meaningText}\n\n`;
  }

  // Chaos vs Order - use semantic description if available, otherwise fallback to numeric
  if (chaosOrderDescription) {
    // Use the semantic description from frontend
    let styleText = '';
    if (chaosOrderDescription.includes('Organic and free-flowing')) {
      styleText = 'Organic and chaotic - free-flowing, natural, expressive, spontaneous designs. Keywords: organic, chaotic, flowing, natural, abstract, expressionist, wild, free.';
    } else if (chaosOrderDescription.includes('Balanced structure')) {
      styleText = 'Balanced structure - mix of organic and structured elements. Keywords: balanced, harmonious, natural with structure, versatile.';
    } else if (chaosOrderDescription.includes('Precise and geometric')) {
      styleText = 'Highly geometric and ordered - mathematical precision, sacred geometry, perfect symmetry. Keywords: geometric, precise, mathematical, sacred geometry, symmetrical, minimal, ordered.';
    }
    prompt += `Style: ${styleText}\n\n`;
  } else if (chaosOrder !== undefined && chaosOrder !== null) {
    // Fallback to numeric logic
    let styleText = '';
    if (chaosOrder < 25) {
      styleText = 'Organic and chaotic - free-flowing, natural, expressive, spontaneous designs. Keywords: organic, chaotic, flowing, natural, abstract, expressionist, wild, free.';
    } else if (chaosOrder < 50) {
      styleText = 'Balanced structure - mix of organic and structured elements. Keywords: balanced, harmonious, natural with structure, versatile.';
    } else if (chaosOrder < 75) {
      styleText = 'Structured and orderly - clean lines, intentional composition. Keywords: structured, clean, precise, orderly, defined.';
    } else {
      styleText = 'Highly geometric and ordered - mathematical precision, sacred geometry, perfect symmetry. Keywords: geometric, precise, mathematical, sacred geometry, symmetrical, minimal, ordered.';
    }
    prompt += `Style: ${styleText}\n\n`;
  }

  // Custom lettering
  if (customLettering && customLettering.trim()) {
    prompt += `Lettering/Text element: "${customLettering}"\n\n`;
  }

  // User's own description - highest priority for semantic matching
  if (userInput && userInput.trim()) {
    prompt += `Personal vision: ${userInput}\n\n`;
  }

  // Custom text input
  if (customText && customText.trim()) {
    prompt += `Additional details: ${customText}\n\n`;
  }

  // Voice transcript - natural language, high semantic value
  if (voiceTranscript && voiceTranscript.trim()) {
    prompt += `Spoken description: ${voiceTranscript}\n\n`;
  }

  // Moodboard description - visual references
  if (moodboardDescription && moodboardDescription.trim()) {
    prompt += `Visual references and mood: ${moodboardDescription}\n\n`;
  }

  return prompt.trim();
}

/**
 * Enhance search results using GPT-4 to provide personalized explanations
 * @param {string} userPrompt - Original user prompt
 * @param {Array} sketches - Matched sketches
 * @returns {Promise<Array>} - Sketches with AI-generated match explanations
 */
/**
 * Generate visual description for a tattoo sketch using GPT-4 Vision
 * @param {string} imageUrl - URL of the sketch image
 * @returns {Promise<string>} - Detailed visual description
 */
export async function generateVisualDescription(imageUrl) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Describe this tattoo sketch in detail. Focus on: visual elements (lines, shapes, patterns), artistic style, composition, key details, and overall aesthetic. Be specific and descriptive. This description will be used for semantic search matching.'
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 300
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating visual description:', error);
    throw error;
  }
}

export async function enhanceResultsWithAI(userPrompt, sketches) {
  try {
    const sketchDescriptions = sketches.map((sketch, index) => 
      `${index + 1}. ${sketch.title} by ${sketch.artist_name}: ${sketch.description}`
    ).join('\n\n');

    const systemPrompt = `You are an expert tattoo consultant. Given a user's preferences and a list of sketches, 
    explain briefly (1-2 sentences) why each sketch matches their request. Be personal and specific.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `User preferences:\n${userPrompt}\n\nMatched sketches:\n${sketchDescriptions}\n\nProvide a brief match explanation for each sketch.` }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const explanations = response.choices[0].message.content.split('\n').filter(line => line.trim());
    
    // Add explanations to sketches
    return sketches.map((sketch, index) => ({
      ...sketch,
      match_explanation: explanations[index] || 'This sketch matches your preferences.'
    }));

  } catch (error) {
    console.error('Error enhancing results with AI:', error);
    // Return sketches without explanations if AI fails
    return sketches;
  }
}

export default openai;

