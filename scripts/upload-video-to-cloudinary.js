const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Load environment variables from both .env.local and .env
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// Use native FormData (Node.js 18+) or form-data package as fallback
let FormData;
let useFormDataPackage = false;
try {
  if (globalThis.FormData) {
    FormData = globalThis.FormData;
    console.log("Using native FormData");
  } else {
    FormData = require("form-data");
    useFormDataPackage = true;
    console.log("Using form-data package");
  }
} catch (e) {
  console.error("❌ Could not load FormData:", e.message);
  console.error("   Try: npm install form-data");
  process.exit(1);
}

// Try both CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const cloudKey = process.env.CLOUDINARY_API_KEY;
const cloudSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !cloudKey || !cloudSecret) {
  console.error("❌ Missing Cloudinary credentials in .env.local");
  console.error("Required:");
  console.error("  - CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
  console.error("  - CLOUDINARY_API_KEY");
  console.error("  - CLOUDINARY_API_SECRET");
  process.exit(1);
}

async function uploadVideoToCloudinary(filePath, publicId = "frontpage_video") {
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const fileSize = fileBuffer.length;

  console.log(`📦 File size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "vagsocietyserbia/videos";
  const signatureBase = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${cloudSecret}`;
  const signature = crypto
    .createHash("sha1")
    .update(signatureBase)
    .digest("hex");

  const form = new FormData();
  
  if (useFormDataPackage) {
    // form-data package
    form.append("file", fileBuffer, {
      filename: fileName,
      contentType: "video/mp4",
    });
  } else {
    // Native FormData (Node 18+)
    form.append("file", new Blob([fileBuffer], { type: "video/mp4" }), fileName);
  }
  
  form.append("api_key", cloudKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("public_id", publicId);
  form.append("resource_type", "video");
  form.append("signature", signature);

  console.log("⬆️  Uploading to Cloudinary...");
  
  // Get headers if form-data package is used
  const headers = useFormDataPackage && form.getHeaders ? form.getHeaders() : {};
  
  // Use native fetch (Node 18+)
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
    {
      method: "POST",
      body: form,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Cloudinary upload failed: ${errorBody}`);
  }

  const data = await response.json();
  return data.secure_url;
}

async function main() {
  const videoPath = path.join(__dirname, "..", "public", "frontpage_video.mp4");
  
  if (!fs.existsSync(videoPath)) {
    console.error(`❌ Video file not found: ${videoPath}`);
    process.exit(1);
  }

  try {
    const url = await uploadVideoToCloudinary(videoPath, "frontpage_video");
    console.log("\n✅ Video uploaded successfully!");
    console.log("Cloudinary URL:", url);
    console.log("\n📝 The video is now available at:");
    console.log(`   Public ID: vagsocietyserbia/videos/frontpage_video`);
    console.log("\n💡 You can now use getCloudinaryVideoUrl() in your code!");
  } catch (error) {
    console.error("❌ Error uploading video:", error.message);
    process.exit(1);
  }
}

main();
