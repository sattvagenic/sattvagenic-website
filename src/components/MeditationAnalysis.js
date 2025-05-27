import React, { useState, useEffect } from 'react';

const generateMetrics = (duration) => {
    // Duration is in minutes
    const completionRatio = Math.min(duration / 10, 1); // 10 minutes is full completion
    
    // Helper function for random number in range, scaled by completion
    const randomInRange = (min, max) => {
        const range = max - min;
        const scaledMax = min + (range * completionRatio);
        return Math.round(min + Math.random() * (scaledMax - min));
    };
    
    // Helper for percentage values with 1 decimal
    const randomPercentage = (min, max) => {
        const range = max - min;
        const scaledMax = min + (range * completionRatio);
        return (min + Math.random() * (scaledMax - min)).toFixed(1);
    };

    // Determine chakra status based on duration
    const getChakraStatus = (individualChakraIndex) => {
        if (duration >= 10) return 'Optimal';
        if (duration >= 5) {
            // For partial meditation, higher chakras are less likely to be optimal
            const activationChance = 1 - (individualChakraIndex / 14); // Lower chakras more likely to activate
            return Math.random() < activationChance ? 'Activating' : 'Dormant';
        }
        return 'Dormant';
    };

    return {
        peakShakti: randomInRange(3000, 5000),
        neuralCoherence: randomPercentage(85, 99.9),
        // Non-dual duration stays very low until significant meditation time
        nonDualDuration: (duration < 3) ? 
            randomInRange(0, 5).toFixed(1) : 
            (duration < 7) ? 
                randomInRange(5, 20).toFixed(1) : 
                randomInRange(20, 60).toFixed(1),
        photonicCoherence: completionRatio * 100,
        matrixStability: completionRatio * 100,
        chakras: [
            'Muladhara', 'Swadhisthana', 'Manipura', 'Anahata', 
            'Vishuddha', 'Ajna', 'Sahasrara'
        ].map((chakra, index) => ({
            name: chakra,
            status: getChakraStatus(index)
        })),
        perceptualBoundary: duration >= 10 ? 'Transcended' : 
                           duration >= 5 ? 'Shifting' : 'Limited'
    };
};

const MeditationAnalysis = ({ isVisible, onClose, duration = 0 }) => {
    const [metrics, setMetrics] = useState(null);
    
    useEffect(() => {
        if (isVisible) {
            setMetrics(generateMetrics(duration));
        }
    }, [isVisible, duration]);

    if (!metrics) return null;

    return (
        <div className={`analysis-panel ${isVisible ? 'visible' : ''}`}>
            <div className="analysis-content">
                <div className="analysis-header">
                    <h2>MEDITATION ANALYSIS</h2>
                    <span className="close-button" onClick={onClose}>×</span>
                </div>
                
                <div className="analysis-section">
                    <h3>PRIMARY METRICS</h3>
                    <div className="metric-item">
                        <span className="metric-label">Peak Shakti Level:</span>
                        <span className="metric-value">{metrics.peakShakti.toLocaleString()} LVs</span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">Neural Coherence:</span>
                        <span className="metric-value">{metrics.neuralCoherence}%</span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">Duration of Non-dual State:</span>
                        <span className="metric-value">{metrics.nonDualDuration}s</span>
                    </div>
                </div>

                <div className="analysis-section">
                    <h3>CHAKRA DIAGNOSTICS</h3>
                    <div className="chakra-status">
                        {metrics.chakras.map((chakra, index) => (
                            <div key={index} className="chakra-item">
                                <span className="chakra-dot"></span>
                                <span className="chakra-name">{chakra.name}:</span>
                                <span className="chakra-value">{chakra.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="analysis-section">
                    <h3>ENTRAINMENT ANALYSIS</h3>
                    <div className="metric-item">
                        <span className="metric-label">Photonic Coherence:</span>
                        <div className="progress-bar">
                            <div 
                                className="progress" 
                                style={{ width: `${metrics.photonicCoherence}%` }}
                            ></div>
                        </div>
                        <span className="metric-value">{Math.round(metrics.photonicCoherence)}%</span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">Reality Matrix Stability:</span>
                        <div className="progress-bar">
                            <div 
                                className="progress" 
                                style={{ width: `${metrics.matrixStability}%` }}
                            ></div>
                        </div>
                        <span className="metric-value">{Math.round(metrics.matrixStability)}%</span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">Perceptual Boundary Status:</span>
                        <span className="metric-value">{metrics.perceptualBoundary}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MeditationAnalysis;