import React, { useEffect, useRef } from 'react';

const SanskritRain = ({ expandCenter }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const patternRef = useRef(null);

    const sanskritChars = [
        'ॐ', 'ः', 'ं', 'ऋ', 'ॠ', 'ऌ', 'ॡ', 
        'क', 'ख', 'ग', 'घ', 'ङ',
        'च', 'छ', 'ज', 'झ', 'ञ',
        'ट', 'ठ', 'ड', 'ढ', 'ण',
        'त', 'थ', 'द', 'ध', 'न',
        'प', 'फ', 'ब', 'भ', 'म',
        'य', 'र', 'ल', 'व', 'श',
        'ष', 'स', 'ह', '॥', '॰'
    ];

    class CircularPattern {
        constructor(centerX, centerY) {
            this.centerX = centerX;
            this.centerY = centerY;
            this.baseRadius = 75;
            this.spirals = 13;
            this.charsPerSpiral = 65;
            this.rotationSpeed = 0.00011;
            this.pulseSpeed = 0.001;
            this.centerHoleSize = 20;  // Initial hole size
            this.targetHoleSize = this.centerHoleSize;
            this.characters = [];

            // Initialize characters in spiral pattern
            for (let s = 0; s < this.spirals; s++) {
                for (let i = 0; i < this.charsPerSpiral; i++) {
                    this.characters.push({
                        char: sanskritChars[Math.floor(Math.random() * sanskritChars.length)],
                        spiralIndex: s,
                        indexInSpiral: i,
                        opacity: 0.5 + Math.random() * 0.5,
                        lastChange: 0,
                        changeInterval: 2000 + Math.random() * 2000
                    });
                }
            }
        }

        setHoleSize(size) {
            this.targetHoleSize = size;
        }

        update(time, ctx) {
            // Smoothly interpolate hole size
            this.centerHoleSize += (this.targetHoleSize - this.centerHoleSize) * 0.05;

            const baseAngle = (time * this.rotationSpeed);
            const pulseFactor = Math.sin(time * this.pulseSpeed) * 10;

            this.characters.forEach((char, idx) => {
                const spiralOffset = (Math.PI * 2 * char.spiralIndex) / this.spirals;
                const progressInSpiral = char.indexInSpiral / this.charsPerSpiral;
                
                // Calculate radius with respect to center hole
                const radius = Math.max(
                    this.centerHoleSize, 
                    this.baseRadius + (progressInSpiral * 180) + pulseFactor
                );
                
                const angle = baseAngle + spiralOffset + (progressInSpiral * Math.PI * 4);

                const x = this.centerX + Math.cos(angle) * radius;
                const y = this.centerY + Math.sin(angle) * radius;

                // Update character occasionally
                if (time - char.lastChange > char.changeInterval) {
                    char.char = sanskritChars[Math.floor(Math.random() * sanskritChars.length)];
                    char.lastChange = time;
                }

                // Calculate opacity with wave effect
                const opacityWave = Math.sin(time * 0.001 + progressInSpiral * Math.PI * 2) * 0.3;
                const finalOpacity = Math.min(Math.max(char.opacity + opacityWave, 0), 1);

                // Draw character
                ctx.font = `${16 + (progressInSpiral * 8)}px Arial`;
                ctx.fillStyle = `rgba(79, 212, 198, ${finalOpacity})`;
                ctx.fillText(char.char, x, y);
            });
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth * 0.45;  // Adjust if needed
            canvas.height = window.innerHeight;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Adjust center point
            patternRef.current = new CircularPattern(
                canvas.width * 0.5,  // Changed from 0.3 to center it more
                canvas.height / 2.2
            );
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        let startTime = Date.now();

        // Animation loop
        const animate = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const time = Date.now() - startTime;
            patternRef.current.update(time, ctx);

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    // Effect to handle center expansion
    useEffect(() => {
        if (expandCenter && patternRef.current) {
            patternRef.current.setHoleSize(300);  // Adjust size as needed
        }
    }, [expandCenter]);

    return (
        <canvas
            ref={canvasRef}
            className="sanskrit-rain-canvas"
        />
    );
};

export default SanskritRain;