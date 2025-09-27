// App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppNavbar from './Components/Navbar/AppNavbar'
import MockMateHero from './Components/HeroSection/HeroSection';
import About from './Components/About/About';
import WhyMockMate from './Pages/WhyMockMate/WhyMockMate';
import Interview from './Pages/Interview/Interview'
import AboutPage from './Pages/AboutPage/AboutPage';
import HowItWorksPage from './Components/HowItWorksPage/HowItWorksPage';
import TargetAudiencePage from './Components/TargetAudiencePage/TargetAudiencePage';
import Footer from './Components/Footer'
import YourHistory from './Pages/YourHistory/YourHistory';

function App() {
  return (
    <>
      <AppNavbar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <MockMateHero />
              <About />
              <HowItWorksPage />
              <TargetAudiencePage />
            </>
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/why-mockmate" element={<WhyMockMate />} />
        <Route path="your-interviews-history" element={<YourHistory />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
