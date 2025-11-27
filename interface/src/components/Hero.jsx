import React from "react";
import { Link } from "react-router-dom";
import '../assets/Hero.css';
const Hero = () => {
  return (
    <section id="hero" className="hero">
      <div className="container">
        <div className="hero__content text-center">
          <h1 className="hero__title">Dark Pattern Detector</h1>
          <p className="hero__tagline mt-4">
            The web is full of <strong>deceptive design tricks</strong> that
            push you into unwanted choices — hidden costs, fake urgency,
            confusing buttons. <br />
            <span className="highlight">
              Our ML-powered extension detects these dark patterns in real-time
              so you can browse with confidence.
            </span>
          </p>

          <div className="hero__cta mt-6 flex justify-center gap-4">
            <Link to="/download" className="btn">
              🚀 Get the Extension
            </Link>
            <Link to="/features" className="btn btn-outline">
              🔎 Learn More
            </Link>
          </div>

          <div className="hero__extras mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="extra-item">
              <i className="fas fa-bolt text-2xl text-yellow-500"></i>
              <p><strong>Real-Time Protection</strong><br/> Flags deceptive UI instantly as you browse.</p>
            </div>
            <div className="extra-item">
              <i className="fas fa-user-shield text-2xl text-green-600"></i>
              <p><strong>Privacy First</strong><br/> Your data stays local, never shared.</p>
            </div>
            <div className="extra-item">
              <i className="fas fa-brain text-2xl text-blue-500"></i>
              <p><strong>ML-Powered</strong><br/> Trained to detect multiple categories of dark patterns.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
