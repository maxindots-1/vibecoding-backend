import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const API_BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'https://backend-lxh5zm68j-maxims-projects-92fd3574.vercel.app';

/**
 * Upload a single sketch via API
 */
async function uploadSketch(sketchData, imagePath) {
  try {
    console.log(`📤 Uploading sketch: ${sketchData.title}`);
    
    // Check if image file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    // Create form data
    const formData = new FormData();
    
    // Add sketch data
    formData.append('sketchData', JSON.stringify(sketchData));
    
    // Add image file
    const imageFile = fs.readFileSync(imagePath);
    const imageBlob = new Blob([imageFile], { type: 'image/png' });
    formData.append('image', imageBlob, path.basename(imagePath));
    
    // Upload via API
    const response = await fetch(`${API_BASE_URL}/api/upload-sketch`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Successfully uploaded: ${sketchData.title} (ID: ${result.sketch_id})`);
      return result;
    } else {
      throw new Error(result.error);
    }
    
  } catch (error) {
    console.error(`❌ Error uploading ${sketchData.title}:`, error.message);
    throw error;
  }
}

/**
 * Example usage function
 */
async function exampleUpload() {
  const sketchData = {
    title: "Example Tattoo Design",
    artist_name: "John Doe",
    artist_bio: "Experienced tattoo artist specializing in geometric designs.",
    description: "A beautiful geometric mandala design perfect for the back or chest.",
    body_parts: ["back", "chest"],
    size: "large",
    price: 2000,
    tags: ["geometric", "mandala", "sacred"],
    style: "geometric",
    complexity: "high",
    color_scheme: "black-and-white",
    meaning_level: "high",
    visibility_level: "high",
    chaos_order_level: "order",
    notes: "This is an example sketch uploaded via script"
  };
  
  const imagePath = path.join(__dirname, '../../Prelude/Sketches/1.png');
  
  try {
    await uploadSketch(sketchData, imagePath);
  } catch (error) {
    console.error('Upload failed:', error);
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node upload-single-sketch.js <image-path>');
    console.log('');
    console.log('Example:');
    console.log('node upload-single-sketch.js ../../Prelude/Sketches/1.png');
    console.log('');
    console.log('The script will prompt you for sketch details.');
    return;
  }
  
  const imagePath = args[0];
  
  // Simple prompt-based data collection (in a real scenario, you'd use a proper CLI library)
  console.log('Please provide the following sketch details:');
  console.log('(This is a simplified example - in production, use proper CLI input handling)');
  
  // For now, use example data
  const sketchData = {
    title: "Script Uploaded Design",
    artist_name: "Script Artist",
    artist_bio: "Uploaded via script",
    description: "This sketch was uploaded using the upload script",
    body_parts: ["arm", "leg"],
    size: "medium",
    price: 1500,
    tags: ["script", "upload", "example"],
    style: "fine-line",
    complexity: "medium",
    color_scheme: "black-and-white",
    meaning_level: "medium",
    visibility_level: "medium",
    chaos_order_level: "balanced",
    notes: "Uploaded via script"
  };
  
  try {
    await uploadSketch(sketchData, imagePath);
  } catch (error) {
    console.error('Upload failed:', error);
    process.exit(1);
  }
}

// Export for use in other scripts
export { uploadSketch };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
