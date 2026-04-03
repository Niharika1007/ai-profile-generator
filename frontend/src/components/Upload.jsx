import axios from "axios";
import { useState } from "react";

function Upload() {
  const [jobId, setJobId] = useState(null);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // 📤 Upload Image
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
    setResultImage(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/upload",
        formData
      );

      setJobId(res.data.jobId);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  // 🎯 Remove Background
  const removeBackground = async () => {
    setLoading(true);

    try {
      const res = await axios.post(
        `http://localhost:5000/api/remove-bg/${jobId}`
      );

      setResultImage(`http://localhost:5000/${res.data.result}`);
    } catch (err) {
      console.error(err);
      alert("Background removal failed");
    }

    setLoading(false);
  };

  return (
    <div className="mt-10 p-6 border rounded-lg shadow-md w-[420px] bg-white">
      <h2 className="text-lg font-semibold mb-4 text-center">
        Upload Your Image
      </h2>

      {/* 📁 File Input */}
      <input type="file" onChange={handleUpload} />

      {/* 📄 File Name */}
      {fileName && (
        <p className="mt-2 text-sm text-gray-600 text-center">
          Selected: {fileName}
        </p>
      )}

      {/* 🖼️ Images Preview */}
      <div className="flex gap-4 mt-4 justify-center">
        {preview && (
          <div>
            <p className="text-sm mb-2 text-center">Original</p>
            <img
              src={preview}
              alt="preview"
              className="w-40 h-40 object-cover rounded border"
            />
          </div>
        )}

        {resultImage && (
          <div>
            <p className="text-sm mb-2 text-center">Result</p>
            <img
              src={resultImage}
              alt="result"
              className="w-40 h-40 object-cover rounded border"
            />
          </div>
        )}
      </div>

      {/* 🎯 Button */}
      {jobId && (
        <button
          onClick={removeBackground}
          disabled={loading}
          className={`mt-5 w-full px-4 py-2 rounded text-white ${
            loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Processing..." : "Remove Background"}
        </button>
      )}

      {/* 📥 Download */}
      {resultImage && (
        <a
          href={resultImage}
          download
          className="mt-3 block text-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Download Image
        </a>
      )}
    </div>
  );
}

export default Upload;