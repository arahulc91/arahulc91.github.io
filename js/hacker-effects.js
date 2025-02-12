/*
 * Copyright 2025 Alvin Rahul Chauhan. All rights reserved.
 */

// Hacking animation effect
function createHackingAnimation() {
  const hackingTexts = document.querySelectorAll(".hacking-animation");
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:,.<>?";

  hackingTexts.forEach((element) => {
    const originalText = element.textContent;
    let isHacking = false;

    element.addEventListener("mouseover", () => {
      if (isHacking) return;
      isHacking = true;

      let iterations = 0;
      const maxIterations = 20;

      const interval = setInterval(() => {
        element.textContent = element.textContent
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("");

        iterations++;

        if (iterations >= maxIterations) {
          clearInterval(interval);
          element.textContent = originalText;
          isHacking = false;
        }
      }, 50);
    });
  });
}

// Code typing animation
function createCodeTypingEffect() {
  const codeBlocks = document.querySelectorAll(".code-typing");

  codeBlocks.forEach((block) => {
    const code = block.textContent;
    block.textContent = "";
    let index = 0;

    function typeCode() {
      if (index < code.length) {
        block.textContent += code.charAt(index);
        index++;
        setTimeout(typeCode, Math.random() * 50 + 20);
      }
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          typeCode();
          observer.unobserve(block);
        }
      });
    });

    observer.observe(block);
  });
}

// ASCII art generator
function createAsciiArt(text, element) {
  const font = figlet.textSync(text, {
    font: "Standard",
    horizontalLayout: "default",
    verticalLayout: "default",
  });
  element.textContent = font;
}

// Static noise effect
function createStaticNoise() {
  const noise = document.createElement("div");
  noise.classList.add("static-noise");
  document.body.appendChild(noise);
}

// Initialize all effects
document.addEventListener("DOMContentLoaded", () => {
  createHackingAnimation();
  createCodeTypingEffect();
  createStaticNoise();
  // Load figlet.js for ASCII art
  const script = document.createElement("script");
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/figlet/1.5.2/figlet.min.js";
  script.onload = () => {
    const asciiElements = document.querySelectorAll(".ascii-art");
    asciiElements.forEach((element) => {
      createAsciiArt(element.getAttribute("data-text"), element);
    });
  };
  document.head.appendChild(script);
});
