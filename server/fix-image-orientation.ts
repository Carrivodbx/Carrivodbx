import { db } from "./db";
import { vehicles } from "@shared/schema";
import { compressBase64Image, compressImageArray, createThumbnail } from "./utils/image-compression";
import { eq } from "drizzle-orm";

async function fixImageOrientation() {
  console.log("🔄 Starting image orientation fix for all vehicles...");
  
  try {
    // Get all vehicles
    const allVehicles = await db.select().from(vehicles);
    console.log(`Found ${allVehicles.length} vehicles to process`);
    
    let processed = 0;
    let errors = 0;
    
    for (const vehicle of allVehicles) {
      try {
        console.log(`\n📸 Processing ${vehicle.brand} ${vehicle.model}...`);
        
        const updates: any = {};
        
        // Fix main photo orientation and regenerate thumbnail
        if (vehicle.photo) {
          console.log(`  ↻ Fixing main photo orientation...`);
          const beforeSize = vehicle.photo.length;
          updates.photo = await compressBase64Image(vehicle.photo);
          updates.thumbnail = await createThumbnail(updates.photo);
          const afterSize = updates.photo.length;
          const reduction = ((1 - afterSize / beforeSize) * 100).toFixed(1);
          console.log(`  ✅ Main photo: ${(beforeSize / 1024).toFixed(0)}KB → ${(afterSize / 1024).toFixed(0)}KB (${reduction}% reduction)`);
        }
        
        // Fix photos array orientation
        if (vehicle.photos && vehicle.photos.length > 0) {
          console.log(`  ↻ Fixing ${vehicle.photos.length} additional photos...`);
          const totalBefore = vehicle.photos.reduce((sum: number, p: string) => sum + p.length, 0);
          updates.photos = await compressImageArray(vehicle.photos);
          const totalAfter = updates.photos.reduce((sum: number, p: string) => sum + p.length, 0);
          const reduction = ((1 - totalAfter / totalBefore) * 100).toFixed(1);
          console.log(`  ✅ Photos array: ${(totalBefore / 1024).toFixed(0)}KB → ${(totalAfter / 1024).toFixed(0)}KB (${reduction}% reduction)`);
        }
        
        // Update vehicle if we have changes
        if (Object.keys(updates).length > 0) {
          await db.update(vehicles)
            .set(updates)
            .where(eq(vehicles.id, vehicle.id));
          
          console.log(`✅ ${vehicle.brand} ${vehicle.model} - images corrected and optimized!`);
          processed++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${vehicle.brand} ${vehicle.model}:`, error);
        errors++;
      }
    }
    
    console.log("\n📊 Summary:");
    console.log(`  ✅ Processed: ${processed}`);
    console.log(`  ❌ Errors: ${errors}`);
    console.log("✨ Image orientation fix complete!");
    
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

fixImageOrientation();
