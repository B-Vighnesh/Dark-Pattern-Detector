import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
import { GoogleOAuthProvider } from "@react-oauth/google";
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
   
<React.StrictMode><GoogleOAuthProvider clientId="824307065796-gqvk08dm58i01pmmrbrens2ke0v927fj.apps.googleusercontent.com">

    <App />
  
  </GoogleOAuthProvider></React.StrictMode>
);
