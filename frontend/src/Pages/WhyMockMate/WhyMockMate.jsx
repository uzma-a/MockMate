import React from "react";
import './WhyMockMate.css'

export default function WhyMockMate() {
  return (
    <div className="why-mockmate-page">
      <div className="container">
        {/* Header */}
        <div className="why-header">
          <h1 className="why-title">Why MockMate?</h1>
          <p className="why-subtitle">
            Because confidence comes from practice — and preparation is the key to success.
          </p>
        </div>

        {/* Importance Section */}
        <div className="content-section">
          <div className="image-text-row">
            <div className="content-image">
              <img
                src="https://cdn.analyticsvidhya.com/wp-content/uploads/2024/07/Building-a-Contextual-Chatbot-with-GPT4o_-Maintaining-Conversation-History-1-scaled.webp"
                alt="AI-powered interview preparation"
              />
            </div>
            <div className="content-text">
              <h2 className="content-title">The Importance of Testing Yourself</h2>
              <p className="content-description">
                Job interviews are stressful, not because of lack of knowledge, but because of
                <strong> lack of practice</strong>. MockMate helps you test yourself in a
                <strong> low-pressure environment</strong>, so that when the real moment comes,
                you're already prepared. Our AI-driven platform simulates real interview scenarios,
                giving you the confidence to tackle any question that comes your way.
              </p>
            </div>
          </div>
        </div>

        {/* Practice Makes Perfect Section */}
        <div className="content-section">
          <div className="image-text-row">
            <div className="content-text">
              <h2 className="content-title">Practice Makes Perfect</h2>
              <p className="content-description">
                The difference between knowing something and being able to articulate it under pressure 
                is <strong>practice</strong>. MockMate provides unlimited practice sessions where you can 
                refine your answers, improve your communication skills, and build the muscle memory needed 
                for successful interviews. Every session brings you closer to your dream job.
              </p>
            </div>
            <div className="content-image">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Team collaboration and practice"
              />
            </div>
          </div>
        </div>

        {/* Real-World Simulation Section */}
        <div className="content-section">
          <div className="image-text-row">
            <div className="content-image">
              <img
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Professional interview setting"
              />
            </div>
            <div className="content-text">
              <h2 className="content-title">Real-World Interview Simulation</h2>
              <p className="content-description">
                MockMate doesn't just ask random questions. Our AI understands <strong>industry standards</strong>, 
                company-specific requirements, and current market trends. We simulate real interview conditions 
                with time pressure, follow-up questions, and behavioral assessments that mirror what you'll 
                encounter in actual interviews.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="content-section">
          <h2 className="section-header">How MockMate Builds Confidence</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <span className="card-emoji">🧠</span>
              <h5 className="card-title">Knowledge Reinforcement</h5>
              <p className="card-text">
                Practice makes perfect. Each mock session reinforces what you already know and 
                helps identify knowledge gaps before the real interview.
              </p>
            </div>
            <div className="benefit-card">
              <span className="card-emoji">💬</span>
              <h5 className="card-title">Communication Skills</h5>
              <p className="card-text">
                Improve the way you explain concepts and structure your answers clearly. 
                Learn to communicate complex ideas in simple, understandable terms.
              </p>
            </div>
            <div className="benefit-card">
              <span className="card-emoji">🚀</span>
              <h5 className="card-title">Confidence Boost</h5>
              <p className="card-text">
                Enter real interviews with confidence knowing you've already practiced. 
                Reduce anxiety and perform at your best when it matters most.
              </p>
            </div>
            <div className="benefit-card">
              <span className="card-emoji">📊</span>
              <h5 className="card-title">Performance Analytics</h5>
              <p className="card-text">
                Track your progress with detailed feedback and analytics. 
                Understand your strengths and focus on areas that need improvement.
              </p>
            </div>
            <div className="benefit-card">
              <span className="card-emoji">🎯</span>
              <h5 className="card-title">Targeted Practice</h5>
              <p className="card-text">
                Focus on specific technologies, roles, or company types. 
                Customize your practice sessions to match your career goals.
              </p>
            </div>
            <div className="benefit-card">
              <span className="card-emoji">🔄</span>
              <h5 className="card-title">Continuous Learning</h5>
              <p className="card-text">
                Learn from every session with instant feedback and suggestions. 
                Continuously improve your interview skills with each practice round.
              </p>
            </div>
          </div>
        </div>

        {/* Success Stories Preview */}
        <div className="content-section">
          <h2 className="section-header">The MockMate Advantage</h2>
          <div className="image-text-row">
            <div className="content-text">
              <h2 className="content-title">Join Thousands of Success Stories</h2>
              <p className="content-description">
                Over <strong>10,000+ professionals</strong> have used MockMate to land their dream jobs at 
                top companies. Our users report an <strong>85% improvement</strong> in interview performance 
                and confidence levels. From junior developers to senior engineers, MockMate has helped 
                professionals across all experience levels achieve their career goals.
              </p>
            </div>
            <div className="content-image">
              <img
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Success and achievement"
              />
            </div>
          </div>
        </div>

        {/* Closing Section */}
        <div className="content-section">
          <div className="closing-section">
            <h3 className="closing-title">Your Future Starts Here</h3>
            <p className="closing-text">
              Don't let fear hold you back. MockMate ensures that your knowledge,
              communication, and confidence are interview-ready. Start your journey 
              to career success today – because every expert was once a beginner who 
              never gave up practicing.
            </p>
          </div>
        </div>
      </div>

      
    </div>
  );
}