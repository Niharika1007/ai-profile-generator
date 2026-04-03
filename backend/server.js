const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

// 📁 Temp folder setup
const uploadDir = path.join(__dirname, "temp");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 📁 Serve static files
app.use(express.static(uploadDir));

// 📤 Multer storage
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// 🏠 Health check
app.get("/", (req, res) => {
  res.send("Backend running successfully 🚀");
});

// 📤 Upload API
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  res.json({
    jobId: req.file.filename,
  });
});

// 🎯 Background Removal (AI)
app.post("/api/remove-bg/:jobId", (req, res) => {
  const jobId = req.params.jobId;

  const inputPath = path.join(uploadDir, jobId);

  const cleanName = jobId.replace(/\.[^/.]+$/, "");
  const outputName = `bg_removed_${cleanName}.png`;
  const outputPath = path.join(uploadDir, outputName);

  const command = `rembg i "${inputPath}" "${outputPath}"`;

  console.log("Running:", command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("ERROR:", stderr);
      return res.status(500).send("Background removal failed (Render may not support AI)");
    }

    res.json({
      result: outputName,
    });
  });
});

// 🎨 Style API (Simulation)
app.post("/api/apply-style/:jobId", (req, res) => {
  const jobId = req.params.jobId;
  const { style } = req.body;

  const inputPath = path.join(uploadDir, jobId);

  const cleanName = jobId.replace(/\.[^/.]+$/, "");
  const outputName = `${style}_${cleanName}.png`;
  const outputPath = path.join(uploadDir, outputName);

  console.log("Applying style:", style);

  if (!fs.existsSync(inputPath)) {
    return res.status(400).send("Input file not found");
  }

  fs.copyFile(inputPath, outputPath, (err) => {
    if (err) {
      console.error("STYLE ERROR:", err);
      return res.status(500).send("Style processing failed");
    }

    res.json({
      result: outputName,
    });
  });
});

// 🚀 PORT FIX (IMPORTANT FOR RENDER)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});