import axios from "axios";
import { useState } from "react";

const BASE_URL = "https://ai-profile-generator-zrwt.onrender.com";

export default function Upload() {
  const [jobId, setJobId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bgPreview, setBgPreview] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    setPreview(URL.createObjectURL(file));
    setResultImage(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(`${BASE_URL}/api/upload`, formData);
      setJobId(res.data.jobId);
    } catch (err) {
      alert("Upload failed");
      console.error(err);
    }
  };

  const callAPI = async (url, data = null, isForm = false) => {
    setLoading(true);
    try {
      const res = isForm
        ? await axios.post(url, data)
        : await axios.post(url, data || {});
      setResultImage(`${BASE_URL}/${res.data.result}`);
    } catch (err) {
      alert("Operation failed");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white shadow-xl rounded-lg max-w-md mx-auto mt-10">
      {/* Upload Input */}
      <div className="mb-4">
        <label className="block font-semibold text-gray-700 mb-1">
          Upload Your Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Image Preview */}
      {(preview || resultImage) && (
        <div className="flex gap-4 mb-4 overflow-x-auto">
          {preview && (
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-500 mb-1">Original</p>
              <img src={preview} className="w-40 h-40 object-cover rounded-md border" />
            </div>
          )}
          {resultImage && (
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-500 mb-1">Result</p>
              <img src={resultImage} className="w-40 h-40 object-cover rounded-md border" />
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      {jobId && (
        <div className="flex flex-wrap gap-2 justify-between mb-4">
          <button
            onClick={() => callAPI(`${BASE_URL}/api/remove-bg/${jobId}`)}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Remove BG"}
          </button>

          <button
            onClick={() => callAPI(`${BASE_URL}/api/enhance/${jobId}`)}
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Enhance"}
          </button>

          <button
            onClick={() =>
              callAPI(`${BASE_URL}/api/apply-style/${jobId}`, { style: "professional" })
            }
            disabled={loading}
            className="flex-1 bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Professional"}
          </button>
        </div>
      )}

      {/* Background Options */}
      {jobId && (
        <div className="flex flex-col gap-3 mb-4">
          {/* Color Picker */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Background Color</label>
            <input
              type="color"
              onChange={(e) =>
                callAPI(`${BASE_URL}/api/bg-color/${jobId}`, { color: e.target.value })
              }
              className="w-full h-10 border rounded-md cursor-pointer"
            />
          </div>

          {/* Background Image Upload */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Background Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const fd = new FormData();
                fd.append("bg", e.target.files[0]);
                setBgPreview(URL.createObjectURL(e.target.files[0]));
                callAPI(`${BASE_URL}/api/bg-image/${jobId}`, fd, true);
              }}
              className="w-full border border-gray-300 rounded-md p-2"
            />
            {bgPreview && (
              <img
                src={bgPreview}
                className="w-full h-32 object-cover rounded-md mt-2 border"
                alt="Background Preview"
              />
            )}
          </div>
        </div>
      )}

      {/* Download */}
      {resultImage && (
        <a
          href={resultImage}
          download
          className="block text-center bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
        >
          Download Result
        </a>
      )}

      {loading && <p className="mt-2 text-gray-500">Processing...</p>}
    </div>
  );
}