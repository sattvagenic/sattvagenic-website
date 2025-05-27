import React from 'react';
import ConsciousnessSlider from './components/ConsciousnessSlider'; // Adjust path as needed

function SliderPage() {
  // First, let's import the fonts from Google Fonts
  React.useEffect(() => {
    // Create a link element for the Google Fonts
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&family=Iceland&display=swap';
    fontLink.rel = 'stylesheet';
    
    // Add it to the document head
    document.head.appendChild(fontLink);
    
    // Clean up function to remove the link when component unmounts
    return () => {
      document.head.removeChild(fontLink);
    };
  }, []);

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <h1 style={{
        fontFamily: 'Orbitron, sans-serif', // Change to 'Iceland, sans-serif' if preferred
        fontSize: '2rem',
        marginBottom: '1rem',
        color: '#333', // Default color - will use your site's color theme
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }}>
        
      </h1>
      
      <ConsciousnessSlider />
    </div>
  );
}

export default SliderPage;