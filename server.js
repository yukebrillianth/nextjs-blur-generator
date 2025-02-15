import express from "express";
import multer from "multer";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { encode, decode } from "blurhash";

const app = express();
const port = 3251;
const processedDir = "processed";
const uploadDir = "uploads";

// Pastikan folder `uploads` dan `processed` ada
[uploadDir, processedDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Konfigurasi Multer dengan filter file dan batas ukuran
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 2 * 1024 * 1024 }, // Batas 2MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error("Invalid file type. Only JPEG, PNG, and WebP allowed."),
        false
      );
    }
    cb(null, true);
  },
});

// Menyediakan folder public sebagai static file untuk akses UI
app.use(express.static("public"));

// Route untuk upload gambar
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const imagePath = req.file.path;
    const metadata = await sharp(imagePath).metadata();
    const width = req.body?.width || 300;
    const height = req.body?.height || 400;

    // Pastikan file benar-benar gambar
    if (!["jpeg", "png", "webp"].includes(metadata.format)) {
      fs.unlinkSync(imagePath);
      return res.status(400).json({ error: "Invalid image format." });
    }

    const originalSize = fs.statSync(imagePath).size / 1024; // Ukuran asli (KB)

    // Resize gambar
    const { data, info } = await sharp(imagePath)
      .resize(width, height)
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

    // Mengubah gambar hasil decode ke dalam format base64
    const base64Image = image.toString("base64");
    const base64Url = `data:image/jpeg;base64,${base64Image}`;

    // Menyimpan gambar hasil proses
    const processedImagePath = path.join(
      processedDir,
      `${req.file.filename}.jpg`
    );
    await sharp(Buffer.from(decoded), {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      .jpeg({ quality: 90 }) // Menyimpan dengan kualitas terkompresi
      .toFile(processedImagePath);

    const processedSize = fs.statSync(processedImagePath).size / 1024; // Menghitung ukuran file hasil proses dalam KB

    // Menghapus gambar asli setelah diproses
    fs.unlinkSync(imagePath);
    fs.unlinkSync(processedImagePath);

    res.json({
      originalSize: `${originalSize.toFixed(2)} KB`,
      processedSize: `${processedSize.toFixed(2)} KB`,
      base64Url, // Base64 URL untuk preview di UI
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
