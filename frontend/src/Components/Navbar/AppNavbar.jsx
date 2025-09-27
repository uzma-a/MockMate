// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../Navbar/AppNavbar.css"; // Import the fixed CSS file

export default function AppNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking on a link
  const handleNavClick = () => {
    setExpanded(false);
  };

  // Handle toggle
  const handleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <Navbar
      expand="lg"
      expanded={expanded}
      onToggle={handleToggle}
      className={`modern-navbar ${scrolled ? 'scrolled' : ''}`}
      fixed="top"
    >
      <Container>
        {/* Enhanced Brand */}
        <Navbar.Brand
          as={Link}
          to="/"
          className="brand-container"
          onClick={handleNavClick}
        >
          <div className="brand-logo">
            <span className="brand-initial">M</span>
          </div>
          <span className="brand-text">
            <span className="brand-main">MockMate</span>
            
          </span>
        </Navbar.Brand>


        {/* Custom Toggle with proper spans */}
        <Navbar.Toggle
          aria-controls="main-navbar"
          className="custom-toggler"
          onClick={handleToggle}
        >
          <span></span>
          <span></span>
          <span></span>
        </Navbar.Toggle>

        {/* Enhanced Navigation */}
        <Navbar.Collapse id="main-navbar">
          <Nav className="ms-auto align-items-center">
            <Nav.Link
              as={Link}
              to="/about"
              className="nav-item-modern"
              onClick={handleNavClick}
            >
              <span>About</span>
              <div className="nav-underline"></div>
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/why-mockmate"
              className="nav-item-modern"
              onClick={handleNavClick}
            >
              <span>Why MockMate</span>
              <div className="nav-underline"></div>
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="your-interviews-history"
              className="nav-item-modern"
              onClick={handleNavClick}
            >
              <span>Your History</span>
              <div className="nav-underline"></div>
            </Nav.Link>

            <Button
              as={Link}
              to="/interview"
              className="cta-button"
              onClick={handleNavClick}
            >
              <span>Get Started</span>
              <i className="fas fa-arrow-right button-icon"></i>
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}