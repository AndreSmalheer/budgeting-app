import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";

import './index.css'
import LandingPage from './pages/LandingPage/LandingPage';
import StarterInhoud from './pages/Starter-inhoud/Starter-inhoud';
import HomePage from './pages/HomePage/HomePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home-page" element={<HomePage/>} />
      <Route path="/starter-inhoud" element={<StarterInhoud />} />
    </Routes>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
