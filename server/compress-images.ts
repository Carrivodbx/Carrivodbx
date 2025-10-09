import sharp from 'sharp';
import { db } from './db';
import { vehicles } from '@shared/schema';
import { sql } from 'drizzle-orm';

async function compressBase64Image(base64String: string): Promise<string> {
  try {
    // Extract the base64 data (remove data:image/...;base64, prefix if present)
    const base64Data = base64String.includes('base64,') 
      ? base64String.split('base64,')[1] 
      : base64String;
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Compress and resize the image
    const compressedBuffer = await sharp(buffer)
      .resize(1200, 1200, { // Max 1200x1200, maintain aspect ratio
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 70 }) // Convert to JPEG with 70% quality
      .toBuffer();
    
    // Convert back to base64
    const compressedBase64 = compressedBuffer.toString('base64');
    const prefix = base64String.includes('base64,') 
      ? base64String.split('base64,')[0] + 'base64,'
      : 'data:image/jpeg;base64,';
    
    return prefix + compressedBase64;
  } catch (error) {
    console.error('Error compressing image:', error);
    return base64String; // Return original if compression fails
  }
}

async function compressAllVehicleImages() {
  console.log('🖼️  Starting image compression...');
  
  // Get all vehicles with photos
  const allVehicles = await db.select().from(vehicles);
  
  console.log(`📦 Found ${allVehicles.length} vehicles to process`);
  
  for (const vehicle of allVehicles) {
    console.log(`\n🚗 Processing vehicle: ${vehicle.title} (${vehicle.id})`);
    
    let updated = false;
    let compressedPhoto = vehicle.photo;
    let compressedPhotos = vehicle.photos;
    
    // Compress single photo if exists
    if (vehicle.photo) {
      console.log('  📸 Compressing main photo...');
      const originalSize = Buffer.from(vehicle.photo.split('base64,')[1] || vehicle.photo, 'base64').length;
      compressedPhoto = await compressBase64Image(vehicle.photo);
      const newSize = Buffer.from(compressedPhoto.split('base64,')[1] || compressedPhoto, 'base64').length;
      const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
      console.log(`  ✅ Main photo: ${(originalSize / 1024).toFixed(1)}KB → ${(newSize / 1024).toFixed(1)}KB (${reduction}% reduction)`);
      updated = true;
    }
    
    // Compress photos array if exists
    if (vehicle.photos && vehicle.photos.length > 0) {
      console.log(`  📸 Compressing ${vehicle.photos.length} photos...`);
      compressedPhotos = [];
      for (let i = 0; i < vehicle.photos.length; i++) {
        const photo = vehicle.photos[i];
        const originalSize = Buffer.from(photo.split('base64,')[1] || photo, 'base64').length;
        const compressed = await compressBase64Image(photo);
        const newSize = Buffer.from(compressed.split('base64,')[1] || compressed, 'base64').length;
        const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
        console.log(`  ✅ Photo ${i + 1}: ${(originalSize / 1024).toFixed(1)}KB → ${(newSize / 1024).toFixed(1)}KB (${reduction}% reduction)`);
        compressedPhotos.push(compressed);
      }
      updated = true;
    }
    
    // Update vehicle in database
    if (updated) {
      await db
        .update(vehicles)
        .set({
          photo: compressedPhoto,
          photos: compressedPhotos
        })
        .where(sql`${vehicles.id} = ${vehicle.id}`);
      console.log('  💾 Updated in database');
    } else {
      console.log('  ⏭️  No photos to compress');
    }
  }
  
  console.log('\n✨ Compression completed!');
}

// Run the compression
compressAllVehicleImages()
  .then(() => {
    console.log('✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
