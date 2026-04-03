const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());

const uploadDir = "./temp";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

let jobs = {};

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.post("/api/upload", upload.single("image"), (req, res) => {
  jobs[req.file.filename] = { status: "uploaded" };

  res.json({
    jobId: req.file.filename,
  });
});

app.listen(5000, () =>
  console.log("Server running on http://localhost:5000")
);