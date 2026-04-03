import axios from "axios";
import { useState } from "react";

function Upload() {
  const [jobId, setJobId] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

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

  return (
    <div className="mt-10 p-6 border rounded-lg shadow-md w-96">
      <h2 className="text-lg font-semibold mb-4">Upload Your Image</h2>

      <input type="file" onChange={handleUpload} />

      {fileName && (
        <p className="mt-2 text-sm text-gray-600">
          Selected: {fileName}
        </p>
      )}

      {jobId && (
        <p className="mt-4 text-green-600">
          Uploaded ✔ Job ID: {jobId}
        </p>
      )}
    </div>
  );
}

export default Upload;