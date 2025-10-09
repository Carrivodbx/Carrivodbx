import { db } from "./db";
import { vehicles } from "@shared/schema";
import { createThumbnail } from "./utils/image-compression";
import { eq } from "drizzle-orm";

async function generateThumbnails() {
  console.log("🖼️  Starting thumbnail generation for existing vehicles...");
  
  try {
    // Get all vehicles
    const allVehicles = await db.select().from(vehicles);
    console.log(`Found ${allVehicles.length} vehicles to process`);
    
    let processed = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const vehicle of allVehicles) {
      try {
        // Skip if already has thumbnail
        if (vehicle.thumbnail) {
          console.log(`⏭️  Skipping ${vehicle.brand} ${vehicle.model} - already has thumbnail`);
          skipped++;
          continue;
        }
        
        // Skip if no photo
        if (!vehicle.photo) {
          console.log(`⚠️  Skipping ${vehicle.brand} ${vehicle.model} - no photo available`);
          skipped++;
          continue;
        }
        
        // Generate thumbnail from main photo
        console.log(`📸 Processing ${vehicle.brand} ${vehicle.model}...`);
        const thumbnail = await createThumbnail(vehicle.photo);
        
        // Update vehicle with thumbnail
        await db.update(vehicles)
          .set({ thumbnail })
          .where(eq(vehicles.id, vehicle.id));
        
        const beforeSize = vehicle.photo.length;
        const afterSize = thumbnail.length;
        const reduction = ((1 - afterSize / beforeSize) * 100).toFixed(1);
        
        console.log(`✅ ${vehicle.brand} ${vehicle.model}: ${(beforeSize / 1024).toFixed(0)}KB → ${(afterSize / 1024).toFixed(0)}KB (${reduction}% reduction)`);
        processed++;
      } catch (error) {
        console.error(`❌ Error processing ${vehicle.brand} ${vehicle.model}:`, error);
        errors++;
      }
    }
    
    console.log("\n📊 Summary:");
    console.log(`  ✅ Processed: ${processed}`);
    console.log(`  ⏭️  Skipped: ${skipped}`);
    console.log(`  ❌ Errors: ${errors}`);
    console.log("✨ Thumbnail generation complete!");
    
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

generateThumbnails();
