import sharp from 'sharp';

export async function compressBase64Image(base64String: string): Promise<string> {
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

export async function compressImageArray(images: string[]): Promise<string[]> {
  const compressed: string[] = [];
  for (const image of images) {
    compressed.push(await compressBase64Image(image));
  }
  return compressed;
}
