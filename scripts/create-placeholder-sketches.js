import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from 'canvas';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SKETCHES_FOLDER = path.join(__dirname, '../../Prelude/Sketches');

// Sketch examples for each artist (English names)
const artistSketches = {
  'David_Peyote': [
    'psychedelic-mandala_large_back.png',
    'trippy-geometric_small_wrist.png',
    'colorful-vision_medium_arm.png',
    'abstract-shapes_large_chest.png',
    'cosmic-pattern_small_ankle.png',
    'neon-flower_medium_leg.png',
    'illusion-design_large_arm.png',
    'kaleidoscope-eye_small_neck.png',
    'rainbow-spiral_medium_stomach.png',
    'psychedelic-dragon_large_back.png'
  ],
  'Brando_Chiesa': [
    'anime-character_large_arm.png',
    'neotraditional-rose_small_wrist.png',
    'colorful-portrait_medium_chest.png',
    'bold-flower_large_back.png',
    'anime-symbol_small_ankle.png',
    'traditional-anchor_medium_leg.png',
    'colorful-bird_large_arm.png',
    'anime-eye_small_neck.png',
    'bold-dagger_medium_stomach.png',
    'neotraditional-eagle_large_back.png'
  ],
  'Duda_Lozano': [
    'patchwork-design_large_arm.png',
    'mixed-elements_medium_chest.png',
    'collage-style_small_wrist.png',
    'fragmented-pattern_large_back.png',
    'assembled-shapes_medium_leg.png',
    'puzzle-piece_small_ankle.png',
    'mosaic-design_large_arm.png',
    'patchwork-flower_medium_stomach.png',
    'fragmented-portrait_small_neck.png',
    'collage-animal_large_back.png'
  ],
  'Kelly_Doty': [
    'newschool-skull_large_arm.png',
    'bold-portrait_medium_chest.png',
    'colorful-flower_small_wrist.png',
    'dynamic-design_large_back.png',
    'vibrant-bird_medium_leg.png',
    'bold-symbol_small_ankle.png',
    'newschool-rose_large_arm.png',
    'colorful-heart_medium_stomach.png',
    'dynamic-dragon_small_neck.png',
    'vibrant-tiger_large_back.png'
  ],
  'Mambo_Tattooer': [
    'illustrative-portrait_large_arm.png',
    'bold-geometric_medium_chest.png',
    'artistic-flower_small_wrist.png',
    'detailed-design_large_back.png',
    'creative-pattern_medium_leg.png',
    'illustrative-symbol_small_ankle.png',
    'artistic-bird_large_arm.png',
    'detailed-dragon_medium_stomach.png',
    'creative-mandala_small_neck.png',
    'illustrative-tiger_large_back.png'
  ],
  'Alessandro_Capozzi': [
    'dotwork-mandala_large_back.png',
    'minimalist-flower_small_wrist.png',
    'dotwork-geometric_medium_arm.png',
    'fine-line-design_small_ankle.png',
    'dotwork-pattern_large_chest.png',
    'minimalist-symbol_medium_leg.png',
    'fine-line-portrait_small_neck.png',
    'dotwork-mandala_medium_stomach.png',
    'minimalist-geometric_large_arm.png',
    'fine-line-animal_small_wrist.png'
  ],
  'Chaim_Machlev': [
    'sacred-geometry_large_back.png',
    'geometric-mandala_medium_arm.png',
    'mathematical-pattern_small_wrist.png',
    'sacred-symbol_large_chest.png',
    'geometric-design_medium_leg.png',
    'mathematical-flower_small_ankle.png',
    'sacred-pattern_large_arm.png',
    'geometric-symbol_medium_stomach.png',
    'mathematical-mandala_small_neck.png',
    'sacred-geometry_medium_back.png'
  ],
  'Jesse_Rix': [
    '3d-geometric_large_back.png',
    'optical-illusion_medium_arm.png',
    '3d-mandala_small_wrist.png',
    'dimensional-design_large_chest.png',
    '3d-pattern_medium_leg.png',
    'optical-pattern_small_ankle.png',
    '3d-geometric_large_arm.png',
    'dimensional-mandala_medium_stomach.png',
    'optical-design_small_neck.png',
    '3d-illusion_large_back.png'
  ],
  'Okan_Uckun': [
    'minimalist-geometric_small_wrist.png',
    'clean-lines_medium_arm.png',
    'geometric-minimalism_large_back.png',
    'simple-pattern_small_ankle.png',
    'minimalist-design_medium_chest.png',
    'clean-symbol_large_leg.png',
    'geometric-simplicity_small_neck.png',
    'minimalist-pattern_medium_stomach.png',
    'clean-geometric_large_arm.png',
    'simple-minimalism_small_wrist.png'
  ],
  'Mo_Ganji': [
    'fine-line-minimalism_small_wrist.png',
    'delicate-design_medium_arm.png',
    'minimalist-flower_small_ankle.png',
    'fine-line-pattern_large_back.png',
    'delicate-geometric_medium_chest.png',
    'minimalist-symbol_small_neck.png',
    'fine-line-animal_medium_leg.png',
    'delicate-pattern_small_wrist.png',
    'minimalist-design_large_arm.png',
    'fine-line-simplicity_medium_stomach.png'
  ]
};

/**
 * Create a simple placeholder image
 */
function createPlaceholderImage(title, artistName, size) {
  const canvas = createCanvas(400, 400);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, 400, 400);
  
  // Border
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, 380, 380);
  
  // Title
  ctx.fillStyle = '#333';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(title, 200, 50);
  
  // Artist name
  ctx.font = '14px Arial';
  ctx.fillText(`by ${artistName}`, 200, 80);
  
  // Size
  ctx.font = '12px Arial';
  ctx.fillText(`Size: ${size}`, 200, 100);
  
  // Simple design based on artist style
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 3;
  
  if (artistName.includes('Peyote')) {
    // Psychedelic circles
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(200, 200, 50 + i * 20, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (artistName.includes('Capozzi') || artistName.includes('Ganji')) {
    // Minimalist dots and lines
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(100 + i * 15, 200, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (artistName.includes('Machlev') || artistName.includes('Rix')) {
    // Geometric shapes
    ctx.beginPath();
    ctx.moveTo(150, 150);
    ctx.lineTo(250, 150);
    ctx.lineTo(200, 250);
    ctx.closePath();
    ctx.stroke();
  } else {
    // Default flower-like pattern
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const x = 200 + Math.cos(angle) * 80;
      const y = 200 + Math.sin(angle) * 80;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  
  // Placeholder text
  ctx.fillStyle = '#999';
  ctx.font = '12px Arial';
  ctx.fillText('Placeholder Sketch', 200, 350);
  ctx.fillText('Replace with actual design', 200, 370);
  
  return canvas.toBuffer('image/png');
}

/**
 * Create placeholder sketches for all artists
 */
async function createPlaceholderSketches() {
  console.log('🎨 Creating placeholder sketches for all artists...\n');
  
  let totalCreated = 0;
  
  for (const [artistName, sketches] of Object.entries(artistSketches)) {
    const artistPath = path.join(SKETCHES_FOLDER, artistName);
    
    // Check if artist folder exists
    if (!fs.existsSync(artistPath)) {
      console.log(`⚠️  Artist folder not found: ${artistName}`);
      continue;
    }
    
    console.log(`📁 Processing artist: ${artistName}`);
    
    for (const sketchName of sketches) {
      const sketchPath = path.join(artistPath, sketchName);
      
      // Parse filename to get title and size
      const [title, size] = sketchName.replace('.png', '').split('_');
      const displayTitle = title.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      try {
        const imageBuffer = createPlaceholderImage(displayTitle, artistName, size);
        fs.writeFileSync(sketchPath, imageBuffer);
        console.log(`  ✅ Created: ${sketchName}`);
        totalCreated++;
      } catch (error) {
        console.error(`  ❌ Error creating ${sketchName}:`, error.message);
      }
    }
    
    console.log('');
  }
  
  console.log(`🎉 Created ${totalCreated} placeholder sketches!`);
  console.log('\n📋 Next steps:');
  console.log('1. Replace placeholder images with actual tattoo sketches');
  console.log('2. Run: node scripts/import-artist-sketches.js');
  console.log('3. Check results in Supabase database');
}

// Run the script
createPlaceholderSketches().catch(console.error);
