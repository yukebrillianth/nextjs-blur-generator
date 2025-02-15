import fs from "fs";
import { encode, decode } from "blurhash";
import sharp from "sharp";

async function getBlurHash(imagePath) {
  // Resize gambar agar lebih kecil dan mudah diproses
  const { data, info } = await sharp(imagePath)
    .resize(300, 400)
    .ensureAlpha()
    .raw()
    .toBuffer({
      resolveWithObject: true,
    });

  const encoded = encode(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    4,
    4
  );
  const decoded = decode(encoded, info.width, info.height);

  const image = await sharp(Buffer.from(decoded), {
    raw: {
      channels: 4,
      width: info.width,
      height: info.height,
    },
  })
    .jpeg({
      overshootDeringing: true,
      quality: 90,
    })
    .toBuffer();

  return image.toString("base64");
}

(async () => {
  const imagePath = "./baju-perawat-rounded-1.jpg"; // Ganti dengan path gambar
  const blurDataURL = await getBlurHash(imagePath);
  console.log("data:image/jpeg;base64," + blurDataURL);
  const imageSize = fs.statSync(imagePath).size / 1024;
  console.log("Original image size (KB):", imageSize.toFixed(2));

  const base64Size = Buffer.byteLength(blurDataURL, "base64") / 1024;
  console.log("Base64 image size (KB):", base64Size.toFixed(2));
})();
