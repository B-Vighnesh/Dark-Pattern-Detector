import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import '../assets/Footer.css';
const Footer = () => {
  return (
    <footer className="footer">
   
        <div className="container footer__bottom-container">
          <p>&copy; {new Date().getFullYear()} Dark Pattern Detector Team. All Rights Reserved.</p>
          
        </div>
    
    </footer>
  );
};

export default Footer;
