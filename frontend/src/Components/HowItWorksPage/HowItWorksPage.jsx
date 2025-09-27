// src/Pages/HowItWorksPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import './HowItWorksPage.css';

export default function HowItWorksPage() {
    const navigate = useNavigate();

  return (
    <div className="howitworks-container">
      <div className="howitworks-content">
        <h1 className="howitworks-title">How It Works</h1>
        <p className="howitworks-subtitle">Get started with MockMate in just a few simple steps and transform your interview skills today.</p>

        <div className="howitworks-steps-container">
          <div className="howitworks-step">
            <div className="howitworks-step-number">01</div>
            <div className="howitworks-step-icon">🎯</div>
            <h3 className="howitworks-step-title">Choose Your Topic</h3>
            <p className="howitworks-step-description">Select from various interview categories like technical skills, behavioral questions, or industry-specific topics tailored to your career goals.</p>
            <div className="howitworks-step-details">
              <ul>
                <li>Technical interviews for developers</li>
                <li>Behavioral questions for all roles</li>
                <li>Industry-specific scenarios</li>
                <li>Custom difficulty levels</li>
              </ul>
            </div>
          </div>

          <div className="howitworks-step">
            <div className="howitworks-step-number">02</div>
            <div className="howitworks-step-icon">🎙️</div>
            <h3 className="howitworks-step-title">Start Interview</h3>
            <p className="howitworks-step-description">Begin your AI-powered mock interview session. Speak naturally as our intelligent AI asks relevant, personalized questions.</p>
            <div className="howitworks-step-details">
              <ul>
                <li>Real-time voice interaction</li>
                <li>Dynamic question generation</li>
                <li>Natural conversation flow</li>
                <li>Adaptive difficulty scaling</li>
              </ul>
            </div>
          </div>

          <div className="howitworks-step">
            <div className="howitworks-step-number">03</div>
            <div className="howitworks-step-icon">📊</div>
            <h3 className="howitworks-step-title">Get Feedback</h3>
            <p className="howitworks-step-description">Receive instant, detailed feedback on your responses, communication style, and areas for improvement with actionable insights.</p>
            <div className="howitworks-step-details">
              <ul>
                <li>Communication clarity analysis</li>
                <li>Content relevance scoring</li>
                <li>Confidence level assessment</li>
                <li>Specific improvement suggestions</li>
              </ul>
            </div>
          </div>

          <div className="howitworks-step">
            <div className="howitworks-step-number">04</div>
            <div className="howitworks-step-icon">🚀</div>
            <h3 className="howitworks-step-title">Improve & Ace</h3>
            <p className="howitworks-step-description">Practice regularly, track your progress over time, and watch your interview confidence and performance soar to new heights.</p>
            <div className="howitworks-step-details">
              <ul>
                <li>Progress tracking dashboard</li>
                <li>Performance analytics</li>
                <li>Skill improvement metrics</li>
                <li>Interview readiness score</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="howitworks-cta-section">
          <h2 className="howitworks-cta-title">Ready to Get Started?</h2>
          <p className="howitworks-cta-description">Join thousands of professionals who have improved their interview skills with MockMate.</p>
          <button onClick={() => navigate("/interview")} className="howitworks-cta-button">Start Your First Mock Interview</button>
        </div>
      </div>
    </div>
  );
}