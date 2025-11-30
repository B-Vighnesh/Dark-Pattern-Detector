import { useState, useEffect } from "react";

export default function FeedbackManagement() {
  const BASE = import.meta.env.VITE_API_BASE_URL;

const CONFIG = {
  API_URL: `${BASE}/feedback/admin/get`,
};
  const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d={path} />
    </svg>
  );

  const ICONS = {
    download:
      "M12 16v-8m0 8l-4-4m4 4l4-4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2",
  };

  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const res = await fetch(CONFIG.API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) {
          // helpful logging for auth / server issues
          const text = await res.text();
          throw new Error(`Failed to fetch feedback data: ${res.status} ${res.statusText} - ${text}`);
        }

        const data = await res.json();
        console.log("API response:", data);

        // Support common API shapes: data.content, data.items, or direct array
        const items = data?.content ?? data?.items ?? data;
        if (!Array.isArray(items)) {
          console.warn("API returned non-array for items, wrapping in array:", items);
          setFeedback([items]);
        } else {
          setFeedback(items);
        }
      } catch (err) {
        console.error("Error fetching feedback:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [token]);

  // Bulletproof CSV download using Blob + robust escaping
  const downloadCSV = () => {
    if (!feedback || feedback.length === 0) {
      console.warn("No feedback to download");
      return;
    }

    // Helper to escape a cell: replace CR/LF inside fields with \n, double-quote escape, and wrap with quotes
    const escapeCell = (value) => {
      if (value === null || value === undefined) return '""';
      const str = String(value);
      const normalized = str.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      return `"${normalized.replace(/"/g, '""')}"`;
    };

    const header = ["ID", "Message", "Issue", "URL", "Mail", "Date"];
    const rows = [header];

    feedback.forEach((row) => {
      // adapt keys to the actual shape of each item
      rows.push([
        row.id ?? "",
        row.message ?? "",
        row.issue ?? "",
        row.url ?? "",
        row.mail ?? "",
        row.date ?? "",
      ]);
    });

    const csvText = rows.map((r) => r.map(escapeCell).join(",")).join("\r\n");

    // Debugging info
    console.log("Feedback rows:", feedback.length);
    console.log("CSV length:", csvText.length);
    console.log("CSV preview:\n", csvText.slice(0, 1000));

    // Add BOM to help Excel detect UTF-8, use Blob to avoid data URI truncation
    const blob = new Blob(["\uFEFF" + csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "feedback.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="feedback-panel">
      <div className="feedback-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>User Feedback Entries</h2>
        <button onClick={downloadCSV} className="download-csv" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Icon path={ICONS.download} />
          <span>Download CSV</span>
        </button>
      </div>

      <div className="data-table-container glass-effect" style={{ marginTop: 12 }}>
        {loading ? (
          <p>Loading feedback...</p>
        ) : feedback.length === 0 ? (
          <p>No feedback entries found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>ID</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Message</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Issue</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>URL</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Email</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((item) => (
                <tr key={item.id ?? Math.random()}>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{item.id}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0", whiteSpace: "pre-wrap" }} className="comment-cell">
                    {item.message}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{item.issue}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{item.url}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }} className="email-text">
                    {item.mail || "—"}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
