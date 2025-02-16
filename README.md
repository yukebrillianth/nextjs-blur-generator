# Next.js Blur Data URL BlurHash Generator

![blur-gen](https://github.com/user-attachments/assets/27adbba2-9b5f-4556-8d8c-29fb3282ffd2)

## Description
This project provides two methods to generate **BlurHash** from images:
1. **CLI (index.js)** → Generates BlurHash directly from the terminal.
2. **Web UI & API (server.js)** → Express-based server to upload images and get BlurHash results via API or web interface.

---

## 🚀 Installation
Make sure Node.js is installed on your system, then run:

```sh
npm install
```

---

## 🛠 Usage

### 1️⃣ CLI Mode (index.js)
Use the CLI to generate **BlurHash** from an image:

```sh
node index.js path/to/image.jpg
```

Output:
- Base64 URL of the BlurHash result
- Original image size
- Converted image size in Base64

---

### 2️⃣ Web UI & API Mode (server.js)
Run the server to use the web interface and API:

```sh
node server.js
```

The server will be available at `http://localhost:3251`.

#### 📌 API Endpoints:

| Method  | Endpoint  | Description |
|---------|----------|-------------|
| `POST`  | `/upload` | Upload an image and receive the BlurHash result. Optional body parameters: `width` and `height` to specify the output dimensions. |

**Example request (cURL):**
```sh
curl -X POST -F "image=@path/to/image.jpg" -F "width=300" -F "height=400" http://localhost:3251/upload
```

Response JSON:
```json
{
  "originalSize": "200 KB",
  "processedSize": "50 KB",
  "base64Url": "data:image/jpeg;base64,/9j/4AAQSk..."
}
```

---

## 🐳 Docker Support
To run the project using **Docker**, use the following commands:

```sh
docker build -t blurhash-generator .
docker run -p 3251:3251 blurhash-generator
```

---

## 📝 Technologies Used
- **Node.js**
- **Express.js**
- **Sharp** (Image Processing)
- **Multer** (File Upload)
- **BlurHash** (Image Hashing)

---

## 📜 License
This project is licensed under the **MIT** license.

---

💡 Created with ❤️ by **[Yuke Brilliant Hestiavin](https://github.com/yukebrillianth)**

