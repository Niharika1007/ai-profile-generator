const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// 📁 Temp folder
const uploadDir = path.join(__dirname, "temp");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// 📁 Static access
app.use(express.static(uploadDir));

// 📤 Multer setup
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// 🏠 Health
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// 📤 Upload
app.post("/api/upload", upload.single("image"), (req, res) => {
  res.json({ jobId: req.file.filename });
});

// 🎯 Remove BG
app.post("/api/remove-bg/:jobId", (req, res) => {
  const jobId = req.params.jobId;

  const inputPath = path.join(uploadDir, jobId);
  const cleanName = jobId.replace(/\.[^/.]+$/, "");
  const outputName = `bg_removed_${cleanName}.png`;
  const outputPath = path.join(uploadDir, outputName);

  const command = `rembg i "${inputPath}" "${outputPath}"`;

  exec(command, (err, stdout, stderr) => {
    if (err) return res.status(500).send("AI failed");

    res.json({ result: outputName });
  });
});

// 🎨 Style
app.post("/api/apply-style/:jobId", (req, res) => {
  const jobId = req.params.jobId;
  const { style } = req.body;

  const inputPath = path.join(uploadDir, jobId);
  const cleanName = jobId.replace(/\.[^/.]+$/, "");
  const outputName = `${style}_${cleanName}.png`;
  const outputPath = path.join(uploadDir, outputName);

  fs.copyFile(inputPath, outputPath, (err) => {
    if (err) return res.status(500).send("Error");

    res.json({ result: outputName });
  });
});

// 🎨 Background Color
app.post("/api/bg-color/:jobId", (req, res) => {
  const jobId = req.params.jobId;

  const inputPath = path.join(uploadDir, jobId);
  const cleanName = jobId.replace(/\.[^/.]+$/, "");
  const outputName = `bgcolor_${cleanName}.png`;
  const outputPath = path.join(uploadDir, outputName);

  fs.copyFile(inputPath, outputPath, (err) => {
    if (err) return res.status(500).send("Error");

    res.json({ result: outputName });
  });
});

// 🖼 Background Image
app.post("/api/bg-image/:jobId", upload.single("bg"), (req, res) => {
  const jobId = req.params.jobId;

  const inputPath = path.join(uploadDir, jobId);
  const cleanName = jobId.replace(/\.[^/.]+$/, "");
  const outputName = `bgimg_${cleanName}.png`;
  const outputPath = path.join(uploadDir, outputName);

  fs.copyFile(inputPath, outputPath, (err) => {
    if (err) return res.status(500).send("Error");

    res.json({ result: outputName });
  });
});

// ✨ Face Enhance
app.post("/api/enhance/:jobId", (req, res) => {
  const jobId = req.params.jobId;

  const inputPath = path.join(uploadDir, jobId);
  const cleanName = jobId.replace(/\.[^/.]+$/, "");
  const outputName = `enhanced_${cleanName}.png`;
  const outputPath = path.join(uploadDir, outputName);

  fs.copyFile(inputPath, outputPath, (err) => {
    if (err) return res.status(500).send("Error");

    res.json({ result: outputName });
  });
});

// 🧹 Auto Cleanup (1 hour)
setInterval(() => {
  const files = fs.readdirSync(uploadDir);

  files.forEach((file) => {
    const filePath = path.join(uploadDir, file);
    const stats = fs.statSync(filePath);

    if (Date.now() - stats.mtimeMs > 60 * 60 * 1000) {
      fs.unlinkSync(filePath);
      console.log("Deleted:", file);
    }
  });
}, 60 * 60 * 1000);

// 🚀 PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});