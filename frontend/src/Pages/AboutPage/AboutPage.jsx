import React from "react";
import './AboutPage.css'
import { useNavigate } from "react-router-dom";

export default function AboutPage() {

  const navigate = useNavigate();
  
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

        {/* Hero Image */}
        <div className="hero-image-container">
          <img 
            src="https://www.simplilearn.com/ice9/free_resources_article_thumb/Types_of_Artificial_Intelligence.jpg" 
            alt="Professional interview preparation" 
            className="hero-image"
          />
        </div>

        <h2 className="about-subtitle">What We Offer</h2>
        
        {/* Features Grid */}
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Interviewer</h3>
            <p>Practice with an intelligent, conversational AI that adapts to your responses and provides realistic interview scenarios.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎤</div>
            <h3>Voice Interaction</h3>
            <p>Speak naturally and get instant responses. Our advanced speech recognition creates authentic conversation flows.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Personalized Feedback</h3>
            <p>Improve with step-by-step guidance, detailed analysis of your responses, and actionable improvement suggestions.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Scoring & Analytics</h3>
            <p>Track your performance with detailed metrics, progress charts, and comprehensive skill assessments.</p>
          </div>
        </div>

        {/* Technology Stack Images */}
        <h2 className="about-subtitle">Technologies We Support</h2>
        <div className="tech-stack">
          <div className="tech-item">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/HTML5_logo_and_wordmark.svg/512px-HTML5_logo_and_wordmark.svg.png" 
              alt="Frontend Technologies" 
              className="tech-image"
            />
            <span className="tech-label">Frontend</span>
          </div>
          <div className="tech-item">
            <img 
              src="https://nodejs.org/static/images/logo.svg" 
              alt="Backend Technologies" 
              className="tech-image"
            />
            <span className="tech-label">Backend</span>
          </div>
          <div className="tech-item">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Postgresql_elephant.svg/640px-Postgresql_elephant.svg.png" 
              alt="Database Technologies" 
              className="tech-image"
            />
            <span className="tech-label">Databases</span>
          </div>
          <div className="tech-item">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/R_logo.svg/512px-R_logo.svg.png" 
              alt="Data Structures and Algorithms" 
              className="tech-image"
            />
            <span className="tech-label">DSA Concepts</span>
          </div>
          <div className="tech-item">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/640px-Python-logo-notext.svg.png" 
              alt="More Technologies" 
              className="tech-image"
            />
            <span className="tech-label">And More +</span>
          </div>
        </div>

        {/* Process Flow */}
        <h2 className="about-subtitle">How It Works</h2>
        <div className="process-flow">
          <div className="process-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Choose Your Focus</h4>
              <p>Select the technology stack, role type, and difficulty level for your mock interview session.</p>
            </div>
          </div>
          <div className="process-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Start Practicing</h4>
              <p>Engage with our AI interviewer through voice or text, answering questions just like in a real interview.</p>
            </div>
          </div>
          <div className="process-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Get Feedback</h4>
              <p>Receive instant, personalized feedback on your responses, communication skills, and technical knowledge.</p>
            </div>
          </div>
          <div className="process-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>Track Progress</h4>
              <p>Monitor your improvement over time with detailed analytics and performance metrics.</p>
            </div>
          </div>
        </div>

        {/* Statistics */}

        <h2 className="about-subtitle">Our Mission</h2>
        <p className="about-description">
          At MockMate, our mission is to make interview preparation accessible
          and effective for everyone. We believe practice builds confidence,
          and with AI-driven tools, you can be ready for any challenge that
          comes your way. Join thousands of successful candidates who have
          enhanced their interview skills with MockMate.
        </p>

        {/* Call to Action */}
        <div className="cta-section">
          <button className="ctaa-button" onClick={()=> navigate('/interview')}>Start Your Practice Today</button>
          <p className="cta-subtitle">Free trial available - No credit card required</p>
        </div>
      </div>

      
    </div>
  );
}