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

// 📁 Create temp folder if not exists
const uploadDir = path.join(__dirname, "temp");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 📁 Serve images
app.use(express.static(uploadDir));

// 📤 Multer storage config
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// 🧠 In-memory job store
let jobs = {};

// 🏠 Test route
app.get("/", (req, res) => {
  res.send("Backend running");
});

// 📤 Upload API
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  jobs[req.file.filename] = { status: "uploaded" };

  res.json({
    jobId: req.file.filename,
  });
});

// 🎯 Background removal API (FIXED VERSION)
app.post("/api/remove-bg/:jobId", (req, res) => {
  const jobId = req.params.jobId;

  const inputPath = path.join(uploadDir, jobId);

  const cleanName = jobId.replace(/\.[^/.]+$/, "");
  const outputName = `bg_removed_${cleanName}.png`;

  const outputPath = path.join(uploadDir, outputName);

  const command = `rembg i "${inputPath}" "${outputPath}"`;

  console.log("Running command:", command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("ERROR:", stderr);
      return res.status(500).send(stderr);
    }

    console.log("SUCCESS");

    res.json({
      result: outputName,
    });
  });
});

// 🚀 Start server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});