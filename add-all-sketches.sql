-- Add all 26 sketches to match all uploaded images
-- This script adds sketches for all 20+ images in the Sketches folder

-- First, let's clear existing sketches to avoid duplicates
DELETE FROM sketches WHERE id IN (
  'sketch-005', 'sketch-006', 'sketch-007', 'sketch-008', 'sketch-009', 'sketch-010',
  'sketch-011', 'sketch-012', 'sketch-013', 'sketch-014', 'sketch-015', 'sketch-016',
  'sketch-017', 'sketch-018', 'sketch-019', 'sketch-020', 'sketch-021', 'sketch-022',
  'sketch-023', 'sketch-024', 'sketch-025', 'sketch-026'
);

-- Insert new sketches
INSERT INTO sketches (
  id, title, artist_name, artist_bio, description, body_parts, size, price,
  image_filename, tags, style, complexity, color_scheme, meaning_level,
  visibility_level, chaos_order_level
) VALUES
-- Sketch 5 (5.png)
(
  'sketch-005',
  'Celestial Harmony',
  'Maya Rodriguez',
  'Maya blends astronomy and art to create cosmic designs that connect the wearer to the universe.',
  'A delicate arrangement of celestial bodies and sacred patterns that represent the interconnectedness of all things. This design speaks to those who find meaning in the stars and see themselves as part of something greater. The flowing lines create a sense of movement and cosmic dance.',
  ARRAY['arm', 'shoulder', 'back'],
  'small',
  800,
  '5.png',
  ARRAY['celestial', 'cosmic', 'delicate', 'spiritual', 'astronomy', 'harmony'],
  'fine-line',
  'low',
  'black-and-white',
  'high',
  'medium',
  'order'
),

-- Sketch 6 (6.png)
(
  'sketch-006',
  'Wildflower Chronicle',
  'Liam O''Sullivan',
  'Liam specializes in botanical art with a narrative twist, creating stories through natural elements.',
  'A beautiful composition of wildflowers that tells a story of growth, resilience, and natural beauty. Each flower represents a different chapter in life''s journey. This design is perfect for those who find strength in nature and see beauty in the journey itself, not just the destination.',
  ARRAY['arm', 'leg', 'ribs'],
  'medium',
  1050,
  '6.png',
  ARRAY['botanical', 'nature', 'narrative', 'growth', 'organic', 'delicate'],
  'botanical-illustrative',
  'medium',
  'black-and-white',
  'high',
  'high',
  'order'
),

-- Sketch 7 (dummy-1.png)
(
  'sketch-007',
  'Dragon''s Wisdom',
  'Kenji Tanaka',
  'Kenji brings traditional Asian tattoo artistry into the modern age, honoring ancient techniques while innovating new styles.',
  'A powerful dragon design rooted in traditional Asian art. The dragon symbolizes wisdom, strength, and protection. This piece combines intricate linework with bold composition, creating a timeless design that carries centuries of cultural significance. Perfect for those who value tradition, power, and spiritual protection.',
  ARRAY['arm', 'back', 'chest', 'leg'],
  'large',
  1800,
  'dummy-1.png',
  ARRAY['dragon', 'traditional', 'asian', 'powerful', 'protective', 'cultural'],
  'traditional-asian',
  'high',
  'black-and-white',
  'high',
  'high',
  'balanced'
),

-- Sketch 8 (dummy-2.png)
(
  'sketch-008',
  'Abstract Emotions',
  'Isabella Rossi',
  'Isabella creates emotionally charged abstract pieces that allow wearers to express what words cannot.',
  'An abstract exploration of human emotions through flowing lines and dynamic shapes. This design doesn''t tell you what to feel—it creates space for your own emotional journey. The bold, expressive strokes capture the chaos and beauty of feeling deeply.',
  ARRAY['arm', 'back', 'chest'],
  'large',
  1400,
  'dummy-2.png',
  ARRAY['abstract', 'emotional', 'expressive', 'bold', 'dynamic', 'personal'],
  'abstract-expressionist',
  'medium',
  'black-and-white',
  'medium',
  'high',
  'chaos'
),

-- Sketch 9 (dummy-3.png)
(
  'sketch-009',
  'Mechanical Dreams',
  'Viktor Sokolov',
  'Viktor merges biomechanical elements with surrealist imagery to create thought-provoking designs.',
  'A surreal fusion of organic and mechanical elements that explores the relationship between humanity and technology. This design questions where the body ends and the machine begins, creating a visual metaphor for our cyborg present. Bold, intricate, and deeply philosophical.',
  ARRAY['arm', 'leg', 'chest', 'back'],
  'large',
  1650,
  'dummy-3.png',
  ARRAY['biomechanical', 'surreal', 'technology', 'futuristic', 'complex', 'philosophical'],
  'biomechanical',
  'high',
  'black-and-white',
  'high',
  'high',
  'chaos'
),

-- Sketch 10 (dummy-4.png)
(
  'sketch-010',
  'Sacred Geometry Portal',
  'Aria Blackwood',
  'Aria specializes in sacred geometry and metaphysical designs that serve as visual meditations.',
  'An intricate mandala of sacred geometric patterns that acts as a portal to higher consciousness. This design combines ancient wisdom with precise mathematical beauty, creating a visual meditation tool. Each line and curve is intentionally placed to create harmony and balance. For those seeking spiritual growth and inner peace.',
  ARRAY['back', 'chest', 'arm'],
  'large',
  2000,
  'dummy-4.png',
  ARRAY['sacred-geometry', 'mandala', 'spiritual', 'meditative', 'precise', 'metaphysical'],
  'sacred-geometric',
  'high',
  'black-and-white',
  'high',
  'medium',
  'order'
),

-- Sketch 11 (Image & Date-1.png)
(
  'sketch-011',
  'Timeless Portrait',
  'Carlos Martinez',
  'Carlos specializes in portrait work that captures the essence of human emotion and character.',
  'A masterful portrait piece that goes beyond mere representation to capture the soul of the subject. This design is perfect for those who want to carry the memory of a loved one or celebrate their own journey. The intricate detail work creates a piece that tells a story with every line.',
  ARRAY['arm', 'chest', 'back'],
  'large',
  2200,
  'Image & Date-1.png',
  ARRAY['portrait', 'realistic', 'emotional', 'detailed', 'memorial', 'personal'],
  'realistic-portrait',
  'high',
  'black-and-white',
  'high',
  'high',
  'order'
),

-- Sketch 12 (Image & Date-11.png)
(
  'sketch-012',
  'Ocean Depths',
  'Marina Petrov',
  'Marina creates fluid, organic designs inspired by the natural world and underwater landscapes.',
  'An ethereal underwater scene that captures the mysterious beauty of the deep ocean. This design features flowing sea creatures and coral formations that create a sense of movement and life. Perfect for those who feel connected to the ocean and its endless mysteries.',
  ARRAY['arm', 'leg', 'back', 'ribs'],
  'medium',
  1600,
  'Image & Date-11.png',
  ARRAY['ocean', 'underwater', 'organic', 'flowing', 'mysterious', 'natural'],
  'organic-flowing',
  'medium',
  'black-and-white',
  'high',
  'medium',
  'balanced'
),

-- Sketch 13 (Image & Date-2.png)
(
  'sketch-013',
  'Gothic Architecture',
  'Edgar Blackstone',
  'Edgar draws inspiration from gothic architecture and medieval art to create dramatic, architectural pieces.',
  'A stunning piece inspired by gothic cathedrals and medieval architecture. This design features intricate stonework, flying buttresses, and ornate details that create a sense of grandeur and timelessness. Perfect for those who appreciate the beauty of human craftsmanship and architectural marvels.',
  ARRAY['back', 'chest', 'arm'],
  'large',
  2400,
  'Image & Date-2.png',
  ARRAY['gothic', 'architecture', 'medieval', 'detailed', 'grand', 'timeless'],
  'architectural',
  'high',
  'black-and-white',
  'high',
  'high',
  'order'
),

-- Sketch 14 (Image & Date-22.png)
(
  'sketch-014',
  'Forest Spirits',
  'Willow Green',
  'Willow creates nature-inspired designs that celebrate the spiritual connection between humans and the natural world.',
  'A mystical forest scene filled with ancient trees, woodland creatures, and ethereal spirits. This design captures the magic and mystery of the forest, perfect for those who find peace and spiritual connection in nature. The flowing lines create a sense of movement and life.',
  ARRAY['arm', 'leg', 'back'],
  'medium',
  1400,
  'Image & Date-22.png',
  ARRAY['forest', 'nature', 'spiritual', 'mystical', 'organic', 'magical'],
  'nature-spiritual',
  'medium',
  'black-and-white',
  'high',
  'medium',
  'balanced'
),

-- Sketch 15 (Image & Date-3.png)
(
  'sketch-015',
  'Steampunk Mechanics',
  'Victor Ironwright',
  'Victor combines Victorian aesthetics with mechanical elements to create unique steampunk-inspired designs.',
  'An intricate steampunk design featuring gears, cogs, and Victorian-era mechanical elements. This piece celebrates the beauty of industrial design and the romance of the steam age. Perfect for those who appreciate vintage technology and mechanical aesthetics.',
  ARRAY['arm', 'leg', 'chest'],
  'large',
  1800,
  'Image & Date-3.png',
  ARRAY['steampunk', 'mechanical', 'victorian', 'industrial', 'gears', 'vintage'],
  'steampunk-mechanical',
  'high',
  'black-and-white',
  'medium',
  'high',
  'order'
),

-- Sketch 16 (Image & Date-33.png)
(
  'sketch-016',
  'Celestial Navigation',
  'Astrid Starlight',
  'Astrid creates astronomical designs that blend scientific accuracy with artistic beauty.',
  'A sophisticated piece featuring constellations, planetary orbits, and celestial navigation instruments. This design combines scientific precision with artistic elegance, perfect for those fascinated by astronomy and the mysteries of the cosmos.',
  ARRAY['arm', 'back', 'chest'],
  'medium',
  1700,
  'Image & Date-33.png',
  ARRAY['astronomy', 'celestial', 'navigation', 'scientific', 'elegant', 'cosmic'],
  'astronomical',
  'high',
  'black-and-white',
  'high',
  'medium',
  'order'
),

-- Sketch 17 (Image & Date-4.png)
(
  'sketch-017',
  'Tribal Fusion',
  'Kai Stormrider',
  'Kai draws from various tribal traditions to create modern fusion pieces that honor ancient wisdom.',
  'A powerful tribal design that combines elements from different cultural traditions. This piece celebrates the universal human need for spiritual connection and cultural identity. The bold, flowing lines create a sense of strength and unity.',
  ARRAY['arm', 'leg', 'back', 'chest'],
  'large',
  1600,
  'Image & Date-4.png',
  ARRAY['tribal', 'cultural', 'spiritual', 'bold', 'traditional', 'powerful'],
  'tribal-fusion',
  'medium',
  'black-and-white',
  'high',
  'high',
  'balanced'
),

-- Sketch 18 (Image & Date-44.png)
(
  'sketch-018',
  'Art Nouveau Elegance',
  'Beatrice Whimsy',
  'Beatrice specializes in Art Nouveau designs that capture the elegance and fluidity of the early 20th century.',
  'A stunning Art Nouveau piece featuring flowing lines, organic curves, and decorative elements inspired by nature. This design captures the elegance and sophistication of the Art Nouveau movement, perfect for those who appreciate vintage aesthetics and natural beauty.',
  ARRAY['arm', 'back', 'ribs'],
  'medium',
  1900,
  'Image & Date-44.png',
  ARRAY['art-nouveau', 'elegant', 'flowing', 'decorative', 'vintage', 'sophisticated'],
  'art-nouveau',
  'high',
  'black-and-white',
  'medium',
  'medium',
  'balanced'
),

-- Sketch 19 (Image & Date-5.png)
(
  'sketch-019',
  'Minimalist Zen',
  'Zen Master Liu',
  'Master Liu creates minimalist designs inspired by Zen philosophy and Eastern aesthetics.',
  'A beautifully simple design that embodies the principles of Zen philosophy. This piece uses minimal elements to create maximum impact, perfect for those seeking inner peace and simplicity. The clean lines and negative space create a sense of calm and contemplation.',
  ARRAY['arm', 'wrist', 'ankle', 'back'],
  'small',
  900,
  'Image & Date-5.png',
  ARRAY['minimalist', 'zen', 'simple', 'calm', 'meditative', 'clean'],
  'minimalist-zen',
  'low',
  'black-and-white',
  'high',
  'low',
  'order'
),

-- Sketch 20 (Image & Date-55.png)
(
  'sketch-020',
  'Phoenix Rising',
  'Ember Phoenix',
  'Ember creates designs that symbolize transformation, rebirth, and the power of renewal.',
  'A powerful phoenix design that symbolizes rebirth, transformation, and the ability to rise from the ashes. This piece is perfect for those who have overcome challenges and emerged stronger. The flowing flames and dynamic composition create a sense of energy and renewal.',
  ARRAY['back', 'chest', 'arm'],
  'large',
  2100,
  'Image & Date-55.png',
  ARRAY['phoenix', 'transformation', 'rebirth', 'powerful', 'dynamic', 'renewal'],
  'mythological',
  'high',
  'black-and-white',
  'high',
  'high',
  'balanced'
),

-- Sketch 21 (Image & Date-6.png)
(
  'sketch-021',
  'Geometric Mandala',
  'Sage Geometric',
  'Sage creates sacred geometric designs that serve as meditation tools and spiritual symbols.',
  'An intricate geometric mandala that combines mathematical precision with spiritual symbolism. This design is perfect for meditation and spiritual practice, creating a focal point for contemplation and inner peace. The symmetrical patterns create a sense of harmony and balance.',
  ARRAY['back', 'chest', 'arm'],
  'large',
  2000,
  'Image & Date-6.png',
  ARRAY['mandala', 'geometric', 'sacred', 'meditation', 'spiritual', 'symmetrical'],
  'sacred-geometric',
  'high',
  'black-and-white',
  'high',
  'medium',
  'order'
),

-- Sketch 22 (Image & Date-7.png)
(
  'sketch-022',
  'Vintage Compass',
  'Captain Navigator',
  'Captain Navigator creates maritime-inspired designs that celebrate adventure and exploration.',
  'A beautifully detailed vintage compass design that symbolizes direction, guidance, and the spirit of adventure. This piece is perfect for those who love to travel and explore, or for anyone seeking direction in life. The intricate details create a sense of craftsmanship and tradition.',
  ARRAY['arm', 'chest', 'back'],
  'medium',
  1500,
  'Image & Date-7.png',
  ARRAY['compass', 'navigation', 'adventure', 'travel', 'vintage', 'guidance'],
  'maritime-vintage',
  'medium',
  'black-and-white',
  'high',
  'medium',
  'order'
),

-- Sketch 23 (Image & Date-8.png)
(
  'sketch-023',
  'Wolf Pack',
  'Luna Wildheart',
  'Luna creates animal-inspired designs that celebrate the connection between humans and the natural world.',
  'A powerful wolf pack design that symbolizes loyalty, family, and the strength of community. This piece features multiple wolves in a dynamic composition that captures the essence of pack mentality and wild beauty. Perfect for those who value family bonds and inner strength.',
  ARRAY['arm', 'leg', 'back'],
  'large',
  1800,
  'Image & Date-8.png',
  ARRAY['wolf', 'pack', 'loyalty', 'family', 'wild', 'strength'],
  'animal-illustrative',
  'high',
  'black-and-white',
  'high',
  'high',
  'balanced'
),

-- Sketch 24 (Image & Date-9.png)
(
  'sketch-024',
  'Lotus Bloom',
  'Serenity Waters',
  'Serenity creates designs inspired by water, flowers, and the peaceful elements of nature.',
  'A delicate lotus flower design that symbolizes purity, enlightenment, and spiritual growth. This piece captures the beauty of the lotus as it rises from muddy waters to bloom in perfect beauty. Perfect for those on a spiritual journey or seeking inner peace.',
  ARRAY['arm', 'back', 'ribs'],
  'medium',
  1300,
  'Image & Date-9.png',
  ARRAY['lotus', 'flower', 'spiritual', 'pure', 'enlightenment', 'growth'],
  'botanical-spiritual',
  'medium',
  'black-and-white',
  'high',
  'medium',
  'order'
),

-- Sketch 25 (Image & Date.png)
(
  'sketch-025',
  'Clockwork Heart',
  'Time Keeper',
  'Time Keeper creates designs that explore the relationship between time, mortality, and the human experience.',
  'An intricate clockwork heart design that symbolizes the mechanical nature of life and the passage of time. This piece combines anatomical precision with mechanical elements, creating a unique fusion of organic and mechanical beauty. Perfect for those who appreciate both science and art.',
  ARRAY['chest', 'arm', 'back'],
  'large',
  2200,
  'Image & Date.png',
  ARRAY['clockwork', 'heart', 'time', 'mechanical', 'anatomical', 'unique'],
  'steampunk-anatomical',
  'high',
  'black-and-white',
  'high',
  'high',
  'order'
),

-- Sketch 26 (Image & Date33.png)
(
  'sketch-026',
  'Mystic Rose',
  'Thorn Mystic',
  'Thorn creates designs that explore the duality of beauty and pain, love and loss.',
  'A mystical rose design that captures the beauty and complexity of love and relationships. This piece features intricate thorns and delicate petals, symbolizing the balance between joy and pain in life. Perfect for those who have experienced the full spectrum of human emotion.',
  ARRAY['arm', 'back', 'ribs'],
  'medium',
  1400,
  'Image & Date33.png',
  ARRAY['rose', 'mystical', 'love', 'beauty', 'pain', 'duality'],
  'botanical-mystical',
  'medium',
  'black-and-white',
  'high',
  'medium',
  'balanced'
);

-- Verify the insert
SELECT id, title, artist_name, price, image_filename FROM sketches ORDER BY id;
