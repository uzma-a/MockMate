// src/Pages/TargetAudiencePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import './TargetAudiencePage.css';

export default function TargetAudiencePage() {
   const navigate = useNavigate();

  return (
    <div className="targetaudience-container">
      <div className="targetaudience-content">
        <h1 className="targetaudience-title">Who Can Benefit</h1>
        <p className="targetaudience-subtitle">MockMate is designed to help professionals at every stage of their career journey succeed in interviews and advance their goals.</p>

        <div className="targetaudience-audience-grid">
          <div className="targetaudience-audience-card">
            <div className="targetaudience-audience-icon">💼</div>
            <h3 className="targetaudience-audience-title">Job Seekers</h3>
            <p className="targetaudience-audience-description">Perfect for professionals looking to land their dream job. Practice common interview questions and get personalized feedback to stand out from the competition in today's job market.</p>
          </div>

          <div className="targetaudience-audience-card">
            <div className="targetaudience-audience-icon">🎓</div>
            <h3 className="targetaudience-audience-title">Students</h3>
            <p className="targetaudience-audience-description">Ideal for college students preparing for internships, graduate programs, or their first job interviews. Build essential communication skills early in your career journey.</p>
          </div>

          <div className="targetaudience-audience-card">
            <div className="targetaudience-audience-icon">🔄</div>
            <h3 className="targetaudience-audience-title">Career Changers</h3>
            <p className="targetaudience-audience-description">Great for professionals transitioning to new fields or roles. Practice explaining your career pivot and highlighting transferable skills to potential employers.</p>
          </div>
        </div>

        <div className="targetaudience-cta-section">
          <h2 className="targetaudience-cta-title">Find Your Path to Success</h2>
          <p className="targetaudience-cta-description">No matter where you are in your career journey, MockMate is here to help you succeed.</p>
          <button onClick={() => navigate('/interview')} className="targetaudience-cta-button">Discover Your Interview Style</button>
        </div>
      </div>
    </div>
  );
}