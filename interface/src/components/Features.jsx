import React from 'react';
import '../assets/Features.css';

const Features = () => {
  return (
    <section id="features" className="section features">
      <div className="container">
        <h2 className="section-title">Powerful Features</h2>
        <p className="section-subtitle">
          Our extension is packed with features to ensure a safer and more transparent browsing experience.
        </p>
        <div className="features__grid">
          <div className="feature-card">
            <div className="feature-card__icon"><i className="fas fa-bolt"></i></div>
            <h3>Real-Time Detection</h3>
            <p>Identifies and flags misleading UI elements, hidden costs, and other dark patterns as you browse.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card__icon"><i className="fas fa-brain"></i></div>
            <h3>ML-Powered Analysis</h3>
            <p>Utilizes advanced machine learning models to accurately classify different types of deceptive designs.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card__icon"><i className="fas fa-bell"></i></div>
            <h3>Instant User Alerts</h3>
            <p>Get clear, non-intrusive notifications about manipulative patterns, so you can make informed decisions.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card__icon"><i className="fas fa-sync-alt"></i></div>
            <h3>Adaptive Learning</h3>
            <p>Our system continuously improves by learning from new examples and user feedback to detect emerging patterns.</p>
          </div>
        </div>

        {/* --- Why Choose Us Section --- */}
        <div className="why-us">
          <h3 className="sub-section-title">Why We're Different</h3>
          <div className="why-us__grid">
            <div className="why-us-card">
              <div className="why-us-card__icon"><i className="fas fa-globe-americas"></i></div>
              <h4>Comprehensive Coverage</h4>
              <p>While many tools focus only on e-commerce, our detector is designed to identify dark patterns across all types of websites, including social media, news, and subscription services.</p>
            </div>
            <div className="why-us-card">
              <div className="why-us-card__icon"><i className="fas fa-users"></i></div>
              <h4>Community-Driven Intelligence</h4>
              <p>Our adaptive learning model is powered by user feedback. Every pattern you help identify makes our system smarter for everyone, creating a safer web for the entire community.</p>
            </div>
            <div className="why-us-card">
              <div className="why-us-card__icon"><i className="fas fa-user-shield"></i></div>
              <h4>Privacy-Focused</h4>
              <p>Your browsing data never leaves your computer. All analysis is done locally, guaranteeing your privacy and data safety.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
