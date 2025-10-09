import { db } from "./db";
import { vehicles } from "@shared/schema";
import { createThumbnail } from "./utils/image-compression";
import { eq } from "drizzle-orm";

async function forceRegenerateThumbnails() {
  console.log("🔄 Force regenerating thumbnails with corrected orientation...");
  
  try {
    // Get all vehicles
    const allVehicles = await db.select().from(vehicles);
    console.log(`Found ${allVehicles.length} vehicles to process`);
    
    let processed = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const vehicle of allVehicles) {
      try {
        // Skip if no photo
        if (!vehicle.photo) {
          console.log(`⚠️  Skipping ${vehicle.brand} ${vehicle.model} - no photo available`);
          skipped++;
          continue;
        }
        
        // Force regenerate thumbnail from corrected photo
        console.log(`📸 Regenerating thumbnail for ${vehicle.brand} ${vehicle.model}...`);
        const thumbnail = await createThumbnail(vehicle.photo);
        
        // Update vehicle with new thumbnail
        await db.update(vehicles)
          .set({ thumbnail })
          .where(eq(vehicles.id, vehicle.id));
        
        const photoSize = vehicle.photo.length;
        const thumbnailSize = thumbnail.length;
        const reduction = ((1 - thumbnailSize / photoSize) * 100).toFixed(1);
        
        console.log(`✅ ${vehicle.brand} ${vehicle.model}: ${(photoSize / 1024).toFixed(0)}KB → ${(thumbnailSize / 1024).toFixed(0)}KB (${reduction}% reduction)`);
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
    console.log("✨ Thumbnail regeneration complete!");
    
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

forceRegenerateThumbnails();
