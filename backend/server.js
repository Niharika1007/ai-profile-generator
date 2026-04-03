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

// Folder
const uploadDir = path.join(__dirname, "temp");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Static
app.use(express.static(uploadDir));

// Multer
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const name = uuidv4() + path.extname(file.originalname);
    cb(null, name);
  },
});
const upload = multer({ storage });

// Upload API
app.post("/api/upload", upload.single("image"), (req, res) => {
  res.json({ jobId: req.file.filename });
});

// Remove BG
app.post("/api/remove-bg/:jobId", (req, res) => {
  const jobId = req.params.jobId;

  const inputPath = path.join(uploadDir, jobId);
  const cleanName = jobId.replace(/\.[^/.]+$/, "");
  const outputName = `bg_removed_${cleanName}.png`;
  const outputPath = path.join(uploadDir, outputName);

  const command = `rembg i "${inputPath}" "${outputPath}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) return res.status(500).send(stderr);

    res.json({ result: outputName });
  });
});

// Style (Simulation)
app.post("/api/apply-style/:jobId", (req, res) => {
  const jobId = req.params.jobId;
  const style = req.body.style;

  console.log("STYLE:", style); // debug

  const inputPath = path.join(uploadDir, jobId);

  const cleanName = jobId.replace(/\.[^/.]+$/, "");
  const outputName = `${style}_${cleanName}.png`;
  const outputPath = path.join(uploadDir, outputName);

  console.log("Input:", inputPath);
  console.log("Output:", outputPath);

  // check file exists
  if (!fs.existsSync(inputPath)) {
    return res.status(400).send("Input file not found");
  }

  fs.copyFile(inputPath, outputPath, (err) => {
    if (err) {
      console.error("COPY ERROR:", err);
      return res.status(500).send("Copy failed");
    }

    console.log("STYLE SUCCESS");

    res.json({
      result: outputName,
    });
  });
});


app.listen(5000, () =>
  console.log("Server running on http://localhost:5000")
);