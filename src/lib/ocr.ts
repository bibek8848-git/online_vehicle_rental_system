import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export interface ExtractedKYC {
    name?: string;
    idNumber?: string;
    dob?: string;
    address?: string;
    expiryDate?: string;
    rawText?: string;
}

/**
 * Preprocesses an image buffer for better OCR results.
 * 1. Grayscale: Reduces noise by removing color information.
 * 2. Resize: Upscales to 2000px width for better character resolution.
 * 3. Normalize contrast: Expands dynamic range to improve visibility.
 * 4. Sharpen: Enhances edges of characters.
 * 5. Thresholding (Binarization): Converts to black & white for higher OCR accuracy.
 */
async function preprocessImage(imageBuffer: Buffer): Promise<Buffer> {
    console.log(`Original image buffer size: ${imageBuffer.length} bytes`);

    const processedImage = await sharp(imageBuffer)
        .greyscale()
        .resize({ width: 2000, withoutEnlargement: false }) // Upscale if needed
        .normalize()
        .sharpen()
        .threshold(128) // Simple binarization
        .toBuffer();

    console.log(`Processed image buffer size: ${processedImage.length} bytes`);

    // Optional: Save processed image for debugging
    try {
        const debugDir = path.join(process.cwd(), 'debug_ocr');
        if (!fs.existsSync(debugDir)) {
            fs.mkdirSync(debugDir);
        }
        const fileName = `ocr_debug_${Date.now()}.png`;
        fs.writeFileSync(path.join(debugDir, fileName), processedImage);
        console.log(`Debug image saved to: ${path.join(debugDir, fileName)}`);
    } catch (err) {
        console.warn('Failed to save debug image:', err);
    }

    return processedImage;
}

export async function extractDataFromImage(imageBuffer: Buffer): Promise<ExtractedKYC> {
    // 1. Preprocess image
    const processedBuffer = await preprocessImage(imageBuffer);

    // 2. Convert to Base64 for Tesseract
    const base64Image = `data:image/png;base64,${processedBuffer.toString('base64')}`;

    // 3. Initialize Worker with English and Nepali
    const worker = await createWorker(['eng', 'nep'], 1, {
        logger: m => {
            if (m.status === 'recognizing text') {
                console.log(`OCR Progress: ${(m.progress * 100).toFixed(2)}%`);
            } else {
                console.log(`OCR Status: ${m.status}`);
            }
        },
        errorHandler: e => console.error('Tesseract Worker Error:', e),
    });

    try {
        // PSM 6: Assume a single uniform block of text.
        // PSM 11: Sparse text. Find as much text as possible in no particular order.
        // We'll try PSM 6 for standard documents.
        await worker.setParameters({
            tessedit_pageseg_mode: '6' as any,
        });

        const { data: { text } } = await worker.recognize(base64Image);
        console.log('--- Extracted Raw Text Start ---');
        console.log(text);
        console.log('--- Extracted Raw Text End ---');

        await worker.terminate();

        return parseKYCText(text);
    } catch (error) {
        await worker.terminate();
        throw error;
    }
}

function parseKYCText(text: string): ExtractedKYC {
    const result: ExtractedKYC = { rawText: text };

    // Nepali patterns
    // नाम थर (Name)
    const nameMatch = text.match(/(?:नाम थर|Name|Full Name)[:\s]+([^\n\r]+)/i);
    if (nameMatch) result.name = nameMatch[1].trim();

    // Citizenship/ID Number
    // Common pattern for Nepali Citizenship: XX-XX-XX-XXXXX or similar
    const idMatch = text.match(/(?:Citizenship No|प्रमाणपत्र नं|ID No|Number)[:\s]+([A-Z0-9-\/\s\.]+)/i);
    if (idMatch) result.idNumber = idMatch[1].trim();

    // Date of Birth
    // Matches YYYY-MM-DD or DD-MM-YYYY or Nepali dates
    const dobMatch = text.match(/(?:जन्म मिति|DOB|Date of Birth)[:\s]+([\d\/\-\.\s]+)/i);
    if (dobMatch) result.dob = dobMatch[1].trim();

    // Address
    const addressMatch = text.match(/(?:ठेगाना|Address)[:\s]+([^\n\r]+)/i);
    if (addressMatch) result.address = addressMatch[1].trim();

    // Expiry Date (if applicable)
    const expiryMatch = text.match(/(?:Expiry|Valid Until|Expires)[:\s]+([\d\/\-\.\s]+)/i);
    if (expiryMatch) result.expiryDate = expiryMatch[1].trim();

    return result;
}

export function verifyKYCData(user: { name: string }, extracted: ExtractedKYC): { verified: boolean, reason?: string } {
    if (!extracted.name) {
        return { verified: false, reason: "Name could not be extracted from document" };
    }

    // Fuzzy name matching
    const userName = user.name.toLowerCase();
    const extractedName = extracted.name.toLowerCase();

    // Check if parts of the name match (more robust than direct include)
    const userParts = userName.split(/\s+/).filter(p => p.length > 2);
    const matchCount = userParts.filter(part => extractedName.includes(part)).length;

    if (matchCount >= Math.min(2, userParts.length)) {
        return { verified: true };
    }

    return { verified: false, reason: `Name mismatch: User registered as "${user.name}", but document shows "${extracted.name}"` };
}
