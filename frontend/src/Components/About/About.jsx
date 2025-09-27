import React from "react";
import '../About/About.css'

export default function About() {

  return (

    <div className="about-container">
  <div className="overlay"></div>

  <div className="about-content">
    <h1 className="about-title">About MockMate</h1>
    <p className="about-description">
      MockMate is your personal AI-powered interview preparation partner.
          It simulates real-world interview scenarios, helping you practice
          with confidence and sharpen your skills. Whether you're preparing
          for technical, behavioral, or situational questions, MockMate guides
          you with interactive sessions, personalized feedback, and realistic
          mock interviews.
    </p>

    <h2 className="about-subtitle">What We Offer</h2>

    {/* Blurry card wrapper */}
    <div className="about-card">
      <ul className="about-list">
        <li><strong>AI Interviewer:</strong> Practice with an intelligent, conversational AI.</li>
        <li><strong>Voice Interaction:</strong> Speak naturally and get instant responses.</li>
        <li><strong>Personalized Feedback:</strong> Improve with step-by-step guidance.</li>
        <li><strong>Scoring & Analytics:</strong> Track your performance easily.</li>
        <li><strong>Multiple Skills:</strong> Python, JavaScript, React, Django, and more.</li>
      </ul>
    </div>

    <h2 className="about-subtitle">Our Mission</h2>
        <p className="about-description">
          At MockMate, our mission is to make interview preparation accessible
          and effective for everyone. We believe practice builds confidence,
          and with AI-driven tools, you can be ready for any challenge that
          comes your way.
        </p>
  </div>
</div>

  );
}