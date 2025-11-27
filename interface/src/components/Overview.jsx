import React from 'react';
import '../assets/Overview.css';
const Overview = () => {
  return (
    <section id="overview" className="section overview">
      <div className="container">
        <h2 className="section-title">End Deceptive Practices</h2>
        <p className="section-subtitle">
          Dark patterns trick users into decisions they never intended to make.
          Our extension shines a light on these manipulative designs so you can
          browse with clarity and confidence.
        </p>

        <div className="overview__content">
          {/* Text Content */}
          <div className="overview__text">
            <h3>What Are Dark Patterns?</h3>
            <p>
              Dark patterns are deceptive design techniques found in websites
              and apps that manipulate you into performing unintended actions.
              This includes tactics like:
            </p>
            <ul className="overview__list">
              <li><strong>Hidden costs</strong> added at checkout</li>
              <li><strong>Fake urgency</strong> like “only 1 left in stock”</li>
              <li><strong>Forced subscriptions</strong> that are hard to cancel</li>
              <li><strong>Confusing navigation</strong> to mislead users</li>
            </ul>

            <h3>Our Solution</h3>
            <p>
              Our browser extension, powered by <strong>Machine Learning</strong>,
              detects and classifies these dark patterns in real-time. It:
            </p>
            <ul className="overview__list">
              <li>Flags manipulative elements as you browse</li>
              <li>Provides clear, non-intrusive alerts</li>
              <li>Continuously improves through adaptive learning</li>
              <li>Respects your privacy by keeping analysis local</li>
            </ul>
            <p className="overview__summary">
              By combining <em>real-time detection</em>, <em>AI-powered analysis</em>,
              and <em>user feedback</em>, we put control back into your hands —
              ensuring a safer and more transparent web.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Overview;

