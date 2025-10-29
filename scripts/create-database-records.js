const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Artist bio mapping
const artistBios = {
  'Alessandro Capozzi': 'Alessandro Capozzi is an Italian tattoo artist based in Rome, known for his delicate and expressive work that builds unique shapes with his masterful dotwork technique. His style encompasses dotwork, fineline, and minimalism, creating tattoos that are both intricate and subtle. Capozzi\'s work is characterized by its precision and attention to detail, often featuring geometric patterns, organic forms, and minimalist compositions that showcase the beauty of negative space. His ability to create depth and texture using only dots and fine lines has made him a master of his craft, earning him recognition in the international tattoo community.',
  'Chen Jie': 'Chen Jie is a Chinese tattoo artist known for his innovative approach to traditional Chinese art forms, blending ancient techniques with modern aesthetics. His work often features delicate linework, watercolor effects, and traditional Chinese motifs reinterpreted for contemporary tattoo art. Chen Jie\'s style is characterized by its fluidity and grace, often incorporating elements of calligraphy, traditional painting, and modern design principles.',
  'Doctor Woo': 'Doctor Woo is a Los Angeles-based tattoo artist renowned for his intricate fine-line work and geometric designs. His style combines precision with artistic vision, creating tattoos that are both technically impressive and aesthetically beautiful. Doctor Woo\'s work often features detailed linework, geometric patterns, and minimalist compositions that showcase his mastery of the fine-line technique.',
  'Gakkin': 'Gakkin is a Japanese tattoo artist known for his bold, graphic style and innovative approach to traditional Japanese tattooing. His work often features strong contrasts, geometric elements, and modern interpretations of classic Japanese motifs. Gakkin\'s style is characterized by its boldness and precision, creating tattoos that are both striking and technically impressive.',
  'Kozo Tattoo': 'Kozo Tattoo is a tattoo artist known for their versatile style and ability to work across different genres. Their work often features a mix of traditional and modern elements, creating tattoos that are both timeless and contemporary. Kozo Tattoo\'s style is characterized by its adaptability and attention to detail.',
  'Matteo Nangeroni': 'Matteo Nangeroni is an Italian tattoo artist known for his surreal and imaginative designs. His work often features dreamlike imagery, abstract elements, and creative compositions that push the boundaries of traditional tattooing. Nangeroni\'s style is characterized by its creativity and artistic vision.',
  'Megan Massacre': 'Megan Massacre is a New York-based tattoo artist known for her bold, colorful work and innovative designs. Her style often features vibrant colors, creative compositions, and unique artistic vision. Massacre\'s work is characterized by its energy and creativity.',
  'Okan Uckun': 'Okan Uckun is a tattoo artist known for his geometric and abstract designs. His work often features precise linework, geometric patterns, and minimalist compositions. Uckun\'s style is characterized by its precision and attention to detail.',
  'Oozy Tattoo': 'Oozy Tattoo is a tattoo artist known for their creative and imaginative designs. Their work often features unique compositions, creative elements, and artistic vision. Oozy Tattoo\'s style is characterized by its creativity and innovation.',
  'Pittak KM': 'Pittak KM is a tattoo artist known for their versatile style and ability to work across different genres. Their work often features a mix of traditional and modern elements, creating tattoos that are both timeless and contemporary. Pittak KM\'s style is characterized by its adaptability and attention to detail.',
  'Romeo Lacoste': 'Romeo Lacoste is a tattoo artist known for their creative and artistic designs. Their work often features unique compositions, creative elements, and artistic vision. Lacoste\'s style is characterized by its creativity and innovation.',
  'Sasha Unisex': 'Sasha Unisex is a tattoo artist known for their versatile style and ability to work across different genres. Their work often features a mix of traditional and modern elements, creating tattoos that are both timeless and contemporary. Sasha Unisex\'s style is characterized by its adaptability and attention to detail.',
  'Tattooist Banul': 'Tattooist Banul is a tattoo artist known for their creative and artistic designs. Their work often features unique compositions, creative elements, and artistic vision. Banul\'s style is characterized by its creativity and innovation.',
  'Matias Noble': 'Matias Noble is a tattoo artist known for their versatile style and ability to work across different genres. Their work often features a mix of traditional and modern elements, creating tattoos that are both timeless and contemporary. Noble\'s style is characterized by its adaptability and attention to detail.',
  'Mr K': 'Mr K is a tattoo artist known for their creative and artistic designs. Their work often features unique compositions, creative elements, and artistic vision. Mr K\'s style is characterized by its creativity and innovation.'
};

async function createDatabaseRecords() {
  console.log('🚀 Creating database records for all storage files...');
  
  // Get all files from storage
  const { data: storageFiles, error: storageError } = await supabase.storage
    .from('sketch-images')
    .list('');
  
  if (storageError) {
    console.error('❌ Error fetching storage files:', storageError.message);
    return;
  }
  
  console.log(`📁 Files in Storage: ${storageFiles.length}`);
  
  // Get existing sketches from database
  const { data: existingSketches, error: dbError } = await supabase
    .from('sketches')
    .select('image_filename');
  
  if (dbError) {
    console.error('❌ Error fetching database sketches:', dbError.message);
    return;
  }
  
  console.log(`📊 Existing sketches in Database: ${existingSketches.length}`);
  
  // Create a set of existing filenames
  const existingFilenames = new Set(existingSketches.map(sketch => sketch.image_filename));
  
  // Find files that don't have corresponding database records
  const filesToProcess = storageFiles.filter(file => !existingFilenames.has(file.name));
  
  console.log(`📝 Files to process: ${filesToProcess.length}`);
  
  // Process each file
  for (const file of filesToProcess) {
    const fileName = file.name;
    const artistName = fileName.split('_')[0] + ' ' + fileName.split('_')[1];
    const fileNumber = fileName.split('_')[2] ? fileName.split('_')[2].replace('.jpg', '') : '1';
    
    // Create a basic sketch record
    const sketchData = {
      id: crypto.randomUUID(),
      title: `${artistName} Design ${fileNumber}`,
      artist_name: artistName,
      artist_bio: artistBios[artistName] || 'Professional tattoo artist with unique style and creative vision.',
      description: `A unique tattoo design by ${artistName}, showcasing their distinctive artistic style and creative vision.`,
      visual_description: `Tattoo sketch by ${artistName} featuring their characteristic style and artistic approach.`,
      suitable_body_parts: ['arm'],
      size: 'medium',
      price: 500,
      image_filename: fileName,
      tags: ['tattoo', 'design', 'art'],
      style: 'contemporary',
      complexity: 'medium',
      color_scheme: 'black-and-white',
      meaning: 'medium',
      visibility: 'medium',
      chaos_order: 'balanced',
      embedding: null // Will be generated later
    };
    
    try {
      const { error: insertError } = await supabase
        .from('sketches')
        .insert(sketchData);
      
      if (insertError) {
        console.log(`❌ Error inserting ${fileName}:`, insertError.message);
      } else {
        console.log(`✅ Created record for ${fileName}`);
      }
    } catch (error) {
      console.log(`❌ Error processing ${fileName}:`, error.message);
    }
  }
  
  console.log('\n🎉 Database records creation completed!');
}

// Run the creation
createDatabaseRecords().catch(console.error);
