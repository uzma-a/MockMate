import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css'

export default function MockMateHero() {
  const heroRef = useRef(null);
  const particlesRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Create particles
    const createParticles = () => {
      if (particlesRef.current) {
        for (let i = 0; i < 50; i++) {
          const particle = document.createElement('div');
          particle.className = 'particle';
          particle.style.width = Math.random() * 4 + 1 + 'px';
          particle.style.height = particle.style.width;
          particle.style.left = Math.random() * 100 + '%';
          particle.style.top = Math.random() * 100 + '%';
          particle.style.animationDelay = Math.random() * 8 + 's';
          particle.style.animationDuration = (Math.random() * 6 + 4) + 's';
          particlesRef.current.appendChild(particle);
        }
      }
    };

    // Mouse tracking effect
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        heroRef.current.style.setProperty('--mouse-x', `${x}%`);
        heroRef.current.style.setProperty('--mouse-y', `${y}%`);
      }
    };

    createParticles();
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="hero-section" ref={heroRef}>
      
      {/* Background Animation */}
      <div className="bg-animation">
        <div className="floating-element">🤖</div>
        <div className="floating-element">💼</div>
        <div className="floating-element">🎯</div>
        <div className="floating-element">⚡</div>
      </div>

      {/* Particles */}
      <div className="particles" ref={particlesRef}></div>

      {/* Hero Content */}
      <div className="hero-container">

        <h1 className="hero-title">
          Master Your Interview Game with MockMate
        </h1>

        <p className="hero-subtitle">
          Your Personal AI Interview Coach
        </p>

        <p className="hero-description">
          Transform interview anxiety into confidence. Practice with our AI-powered interviewer,
          get instant feedback, and land your dream job. Real questions, real scenarios, real results.
        </p>

        <div className="hero-button">
          <button as={Link} onClick={()=> navigate('/interview')}
            to="/interview">Get Started</button>

        </div>


      </div>
    </div>
  );
}