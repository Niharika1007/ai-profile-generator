import axios from "axios";
import { useState } from "react";

const BASE_URL = "https://ai-profile-generator-zrwt.onrender.com"; // 🔁 REPLACE THIS

function Upload() {
  const [jobId, setJobId] = useState(null);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // 📤 Upload
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
        `${BASE_URL}/api/upload`,
        formData
      );
      setJobId(res.data.jobId);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  // 🎯 Remove BG
  const removeBackground = async () => {
    setLoading(true);

    try {
      const res = await axios.post(
        `${BASE_URL}/api/remove-bg/${jobId}`
      );

      setResultImage(`${BASE_URL}/${res.data.result}`);
    } catch (err) {
      console.error(err);
      alert("Background removal failed");
    }

    setLoading(false);
  };

  // 🎨 Style
  const applyStyle = async (style) => {
    setLoading(true);

    try {
      const res = await axios.post(
        `${BASE_URL}/api/apply-style/${jobId}`,
        { style }
      );

      setResultImage(`${BASE_URL}/${res.data.result}`);
    } catch (err) {
      console.error(err);
      alert("Style failed");
    }

    setLoading(false);
  };

  return (
    <div className="mt-10 p-6 border rounded-lg shadow-md w-[450px] bg-white">
      <h2 className="text-lg font-semibold mb-4 text-center">
        AI Profile Generator
      </h2>

      {/* Upload */}
      <input type="file" onChange={handleUpload} />

      {fileName && (
        <p className="mt-2 text-sm text-gray-600 text-center">
          {fileName}
        </p>
      )}

      {/* Images */}
      <div className="flex gap-4 mt-4 justify-center">
        {preview && (
          <div>
            <p className="text-sm text-center">Original</p>
            <img
              src={preview}
              alt="preview"
              className="w-40 h-40 rounded border object-cover"
            />
          </div>
        )}

        {resultImage && (
          <div>
            <p className="text-sm text-center">Result</p>
            <img
              src={resultImage}
              alt="result"
              className="w-40 h-40 rounded border object-cover"
            />
          </div>
        )}
      </div>

      {/* Remove BG */}
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

      {/* Styles */}
      {jobId && (
        <div className="mt-4">
          <p className="text-sm mb-2 text-center">Apply Style</p>

          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={() => applyStyle("professional")}
              className="bg-purple-500 text-white px-3 py-1 rounded"
            >
              Professional
            </button>

            <button
              onClick={() => applyStyle("artistic")}
              className="bg-pink-500 text-white px-3 py-1 rounded"
            >
              Artistic
            </button>

            <button
              onClick={() => applyStyle("fantasy")}
              className="bg-yellow-500 text-white px-3 py-1 rounded"
            >
              Fantasy
            </button>
          </div>
        </div>
      )}

      {/* Download */}
      {resultImage && (
        <a
          href={resultImage}
          download
          className="mt-4 block text-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Download Image
        </a>
      )}
    </div>
  );
}

export default Upload;