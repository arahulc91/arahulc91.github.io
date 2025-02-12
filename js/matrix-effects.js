/*
 * Copyright 2025 Alvin Rahul Chauhan. All rights reserved.
 */

// Matrix rain effect
function createMatrixRain() {
    const canvas = document.getElementById('matrix-rain');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()";
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = [];

    for (let i = 0; i < columns; i++) {
        drops[i] = 1;
    }

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0F0';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(draw, 33);

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Glitch text effect
function createGlitchEffect() {
    const glitchTexts = document.querySelectorAll('.glitch-text');
    
    glitchTexts.forEach(text => {
        const original = text.textContent;
        const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        text.addEventListener('mouseover', () => {
            let iterations = 0;
            const maxIterations = 3;
            
            const interval = setInterval(() => {
                text.textContent = text.textContent
                    .split('')
                    .map((char, index) => {
                        if (index < iterations) {
                            return original[index];
                        }
                        return glitchChars[Math.floor(Math.random() * glitchChars.length)];
                    })
                    .join('');
                
                iterations += 1/3;
                
                if (iterations >= original.length) {
                    clearInterval(interval);
                    text.textContent = original;
                }
            }, 30);
        });
    });
}

// Terminal typing effect
function createTypingEffect() {
    const terminals = document.querySelectorAll('.terminal-text');
    
    terminals.forEach(terminal => {
        const text = terminal.textContent;
        terminal.textContent = '';
        let index = 0;
        
        function type() {
            if (index < text.length) {
                terminal.textContent += text.charAt(index);
                index++;
                setTimeout(type, Math.random() * 100 + 50);
            }
        }
        
        type();
    });
}

// Binary hover effect
function createBinaryEffect() {
    const binaryElements = document.querySelectorAll('.binary-hover');
    
    binaryElements.forEach(element => {
        const original = element.textContent;
        
        element.addEventListener('mouseover', () => {
            const binary = original.split('').map(char => {
                return char.charCodeAt(0).toString(2).padStart(8, '0');
            }).join(' ');
            
            element.setAttribute('data-original', original);
            element.textContent = binary;
        });
        
        element.addEventListener('mouseout', () => {
            element.textContent = element.getAttribute('data-original');
        });
    });
}

// Initialize all effects
document.addEventListener('DOMContentLoaded', () => {
    createMatrixRain();
    createGlitchEffect();
    createTypingEffect();
    createBinaryEffect();
});
