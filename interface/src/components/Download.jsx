import React, { useState, useEffect } from 'react';
import '../assets/Download.css';

const Download = () => {
  const [chromeVersions, setChromeVersions] = useState([]);
  const [firefoxVersions, setFirefoxVersions] = useState([]);
  const [edgeVersions, setEdgeVersions] = useState([]);

  const [selectedChromeVersion, setSelectedChromeVersion] = useState('');
  const [selectedFirefoxVersion, setSelectedFirefoxVersion] = useState('');
  const [selectedEdgeVersion, setSelectedEdgeVersion] = useState('');
const BASE = import.meta.env.VITE_API_BASE_URL;

  // fetch versions per browser
  useEffect(() => {
    const fetchVersions = async (browser, setter) => {
      try {
        const response = await fetch(`${BASE}/files/${browser}/versions`);
        if (!response.ok) throw new Error(`Failed to fetch ${browser} versions`);
        const data = await response.json();
        setter(data);

        // select first version by default
        if (data.length > 0) {
          if (browser === "chrome") setSelectedChromeVersion(data[0]);
          if (browser === "firefox") setSelectedFirefoxVersion(data[0]);
          if (browser === "edge") setSelectedEdgeVersion(data[0]);
        }
      } catch (error) {
        console.error(`Error fetching ${browser} versions:`, error);
      }
    };

    fetchVersions("chrome", setChromeVersions);
    fetchVersions("firefox", setFirefoxVersions);
    fetchVersions("edge", setEdgeVersions);
  }, []);

  // download URLs (backend expects /files/admin/upload/{browser}/{version})
  const chromeDownloadUrl = selectedChromeVersion
    ? `${BASE}/files/download/chrome/${selectedChromeVersion}`
    : "#";

  const firefoxDownloadUrl = selectedFirefoxVersion
    ? `${BASE}/files/download/firefox/${selectedFirefoxVersion}`
    : "#";

  const edgeDownloadUrl = selectedEdgeVersion
    ? `${BASE}/files/download/edge/${selectedEdgeVersion}`
    : "#";

  // helper to render options
  const renderOptions = (versions) => {
    if (versions.length === 0) return <option disabled>Loading...</option>;
    return versions.map((v) => (
      <option key={v} value={v}>
        Version {v}
      </option>
    ));
  };

  return (
    <section id="download" className="section download">
      <div className="container">
        <h2 className="section-title">Get Started Today</h2>
        <p className="section-subtitle">
          Download the Dark Pattern Detector extension for your favorite browser.
        </p>

        <div className="download__grid">
          {/* Chrome Card */}
          <div className="browser-card">
            <i className="fab fa-chrome browser-icon"></i>
            <h3 className="browser-title">Google Chrome</h3>
            <p className="browser-description">Recommended for the best performance and features.</p>
            <div className="form-group">
              <label htmlFor="chrome-version">Select Version</label>
              <select
                id="chrome-version"
                value={selectedChromeVersion}
                onChange={(e) => setSelectedChromeVersion(e.target.value)}
              >
                {renderOptions(chromeVersions)}
              </select>
            </div>
            <a href={chromeDownloadUrl} className="btn download__btn">
              Download for Chrome
            </a>
          </div>

          {/* Firefox Card */}
          <div className="browser-card">
            <i className="fab fa-firefox-browser browser-icon"></i>
            <h3 className="browser-title">Mozilla Firefox</h3>
            <p className="browser-description">The best choice for privacy-focused browsing.</p>
            <div className="form-group">
              <label htmlFor="firefox-version">Select Version</label>
              <select
                id="firefox-version"
                value={selectedFirefoxVersion}
                onChange={(e) => setSelectedFirefoxVersion(e.target.value)}
              >
                {renderOptions(firefoxVersions)}
              </select>
            </div>
            <a href={firefoxDownloadUrl} className="btn download__btn">
              Download for Firefox
            </a>
          </div>

          {/* Edge Card */}
          <div className="browser-card">
            <i className="fab fa-edge browser-icon"></i>
            <h3 className="browser-title">Microsoft Edge</h3>
            <p className="browser-description">Optimized for Windows with a modern browsing experience.</p>
            <div className="form-group">
              <label htmlFor="edge-version">Select Version</label>
              <select
                id="edge-version"
                value={selectedEdgeVersion}
                onChange={(e) => setSelectedEdgeVersion(e.target.value)}
              >
                {renderOptions(edgeVersions)}
              </select>
            </div>
            <a href={edgeDownloadUrl} className="btn download__btn">
              Download for Edge
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Download;
