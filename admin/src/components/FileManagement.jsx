import { useState, useEffect } from "react";
import Modal from "./Modal";
import FileUpload from "./FileUpload";
import "../styles/FileManagement.css";

export default function FileManagement() {
  const BASE = import.meta.env.VITE_API_BASE_URL;

  const CONFIG = {
    API_URL: `${BASE}/files/admin/files`,
  };

  const [files, setFiles] = useState([]);
  const [itemToDelete, setItemToDelete] = useState(null);
  const token = localStorage.getItem("token");

  // Fetch data from backend on load
  useEffect(() => {
    fetch(CONFIG.API_URL, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch files");
        return res.json();
      })
      .then((data) => {
        const mappedFiles = data.map((f, index) => ({
          id: f.id || index,
          fileName: f.fileName || f.name || "Unnamed File",
          browser: f.browser || "-",
          version: f.version || "-",
          fileSize: f.fileSize || 0,
        }));
        setFiles(mappedFiles);
      })
      .catch((err) => console.error("Error fetching files:", err));
  }, []);

  // Add newly uploaded file to table
  const onUploadSuccess = (newFile) =>
    setFiles((prev) => [newFile, ...prev]);

  // Delete request to backend
  const handleDelete = async (fileId) => {
    try {
      const res = await fetch(`${BASE}/files/admin/delete/${fileId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete file");

      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      setItemToDelete(null);
      console.log(`File ${fileId} deleted successfully.`);
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  };

  // Download file from backend
  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(`${BASE}/files/download/${fileId}`);
      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || `file-${fileId}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log(`File ${fileId} downloaded successfully.`);
    } catch (err) {
      console.error("Error downloading file:", err);
    }
  };

  const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 24 24"
         fill="currentColor"
         className={className}
    >
      <path d={path} />
    </svg>
  );

  const ICONS = {
    delete:
      "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134H8.718c-1.123 0-2.033.954-2.033 2.134v.916m7.5 0a48.667 48.667 00-7.5 0",
    download:
      "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3",
  };

  const formatBytes = (bytes = 0) => {
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${
      ["B", "KB", "MB", "GB"][i]
    }`;
  };

  return (
    <div className="management-panel">
      <FileUpload onUploadSuccess={onUploadSuccess} />

      <div className="data-table-container glass-effect">
        <table>
          <thead>
            <tr>
              <th>Filename</th>
              <th>Browser</th>
              <th>Version</th>
              <th>Size</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.length > 0 ? (
              files.map((file) => (
                <tr key={file.id}>
                  <td>{file.fileName}</td>
                  <td className="capitalize">{file.browser}</td>
                  <td>v{file.version}</td>
                  <td>{formatBytes(file.fileSize)}</td>
                  <td className="action-buttons">
                    <button
                      onClick={() => handleDownload(file.id, file.fileName)}
                      className="upload-button"
                      title="Download File"
                    >
                      <Icon path={ICONS.download} />
                    </button>

                    <button
                      onClick={() => setItemToDelete(file)}
                      className="delete-button"
                      title="Delete File"
                    >
                      <Icon path={ICONS.delete} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "1rem" }}>
                  No files available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {itemToDelete && (
        <Modal
          item={itemToDelete}
          onConfirm={() => handleDelete(itemToDelete.id)}
          onCancel={() => setItemToDelete(null)}
        />
      )}
    </div>
  );
}
