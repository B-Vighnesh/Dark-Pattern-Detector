import React, { useState } from 'react';

export default function FileUploadCard({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [browser, setBrowser] = useState('chrome'); // default
  const [version, setVersion] = useState('');
const [message, setMessage] = useState('');
const token=localStorage.getItem("token");
  const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
         fill="currentColor" className={className}>
      <path d={path} />
    </svg>
  );

  const ICONS = {
    upload: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
  };

const handleUpload = async () => {
  if (!file) return;
  if (!version.trim()) {
    alert("Version is required!");
    return;
  }
  setStatus('uploading');

  try {
    const formData = new FormData();
    formData.append('file', file); // key must match backend @RequestParam("file")

    const url = `http://localhost:8080/files/admin/upload/${browser}/${version}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // JWT auth
          // Do NOT set 'Content-Type': the browser sets it automatically for FormData
        },
        body: formData // <-- this was missing
    });

    const message = await response.text();
    console.log("Upload response:", message);

    if (!response.ok) {
      setStatus('error');
      setMessage(message);
      return;
    }

    onUploadSuccess({
      id: Date.now().toString(),
      fileName: file.name,
      fileSize: file.size,
      browser,
      version
    });

    setFile(null);
    setVersion('');
    setStatus('success');
    setMessage(message);
    setTimeout(() => setStatus('idle'), 3000);

  } catch (err) {
    console.error("Error uploading file:", err);
    setStatus('error');
    setMessage("⚠️ Something went wrong. Please try again.");
    setTimeout(() => setStatus('idle'), 3000);
  }
};



  return (
    <div className="upload-card glass-effect">
      <h3>Upload New Extension</h3>

      {/* File selection */}
      <div className="file-drop-zone"
           onClick={() => document.getElementById('file-input').click()}>
        <Icon path={ICONS.upload} className="w-10 h-10" />
        <p>{file ? file.name : 'Click to select a .zip file'}</p>
        <input
          id="file-input"
          type="file"
          accept=".zip"
          hidden
          onChange={e => setFile(e.target.files[0])}
        />
      </div>

     {/* Browser selection */}
<div className="form-group">
  <label>Browser:</label>
  <select
    value={browser}
    onChange={(e) => setBrowser(e.target.value)}
    className="styled-select"
  >
    <option value="chrome">Chrome</option>
    <option value="firefox">Firefox</option>
    <option value="edge">Edge</option>
    <option value="dummy-browser">Dummy Browser</option>
  </select>
</div>

{/* Version input */}
<div className="form-group">
  <label>Version:</label>
  <input
    type="text"
    value={version}
    onChange={(e) => setVersion(e.target.value)}
    placeholder="Enter version"
    className="styled-input"
  />
</div>


      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || status === 'uploading'}
        className="upload-button"
        style={{ marginTop: "1rem" }}
      >
        {status === 'uploading' ? 'Uploading...' : 'Deploy Version'}
      </button>

{status === 'success' && <p className="success-message">{message}</p>}
{status === 'error' && <p style={{ color: 'red' }}>{message}</p>}

    </div>
  );
}
