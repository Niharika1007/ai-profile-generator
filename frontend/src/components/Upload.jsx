import axios from "axios";
import { useState } from "react";

const BASE_URL = "https://ai-profile-generator-zrwt.onrender.com";

function Upload() {
  const [jobId, setJobId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("image", file);

    const res = await axios.post(`${BASE_URL}/api/upload`, formData);
    setJobId(res.data.jobId);
  };

  const callAPI = async (url, data = null, isForm = false) => {
    setLoading(true);
    try {
      const res = isForm
        ? await axios.post(url, data)
        : await axios.post(url, data || {});
      setResultImage(`${BASE_URL}/${res.data.result}`);
    } catch {
      alert("Operation failed");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white shadow rounded w-[450px]">
      <input type="file" onChange={handleUpload} />

      <div className="flex gap-4 mt-4">
        {preview && <img src={preview} className="w-40" />}
        {resultImage && <img src={resultImage} className="w-40" />}
      </div>

      {jobId && (
        <>
          <button onClick={() => callAPI(`${BASE_URL}/api/remove-bg/${jobId}`)}>
            Remove BG
          </button>

          <button onClick={() => callAPI(`${BASE_URL}/api/enhance/${jobId}`)}>
            Enhance
          </button>

          <button
            onClick={() =>
              callAPI(`${BASE_URL}/api/apply-style/${jobId}`, {
                style: "professional",
              })
            }
          >
            Professional
          </button>

          <input
            type="color"
            onChange={(e) =>
              callAPI(`${BASE_URL}/api/bg-color/${jobId}`, {
                color: e.target.value,
              })
            }
          />

          <input
            type="file"
            onChange={(e) => {
              const fd = new FormData();
              fd.append("bg", e.target.files[0]);
              callAPI(`${BASE_URL}/api/bg-image/${jobId}`, fd, true);
            }}
          />
        </>
      )}

      {loading && <p>Processing...</p>}

      {resultImage && (
        <a href={resultImage} download>
          Download
        </a>
      )}
    </div>
  );
}

export default Upload;