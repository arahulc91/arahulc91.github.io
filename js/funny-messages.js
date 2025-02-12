// Random coding messages
const funnyCodeMessages = [
  "Writes code so clean, even Marie Kondo would be proud",
  "Debugs with interpretive dance moves",
  "Types faster than a caffeinated squirrel on a keyboard",
  "Comments code in haiku format only",
  "Has a pet bug named 'Feature'",
  "Solves merge conflicts by challenging Git to a duel",
  "Names variables like they're writing a fantasy novel",
  "Speaks fluent binary in their sleep",
  "Writes functions so pure, they make functional programmers cry",
  "Has achieved perfect indentation through meditation",
  "Debugs production by whispering sweet nothings to the server",
  "Writes code that's self-aware and slightly sarcastic",
  "Has a rubber duck with a PhD in Computer Science",
  "Refactors code like a DJ dropping sick beats",
  "Writes regex patterns that look like modern art",
  "Has achieved Stack Overflow enlightenment",
  "Codes in dark mode because light attracts bugs",
  "Writes commit messages that deserve a Pulitzer",
  "Has a special keyboard that only types in JavaScript",
  "Fixes bugs by staring them into submission"
];

function getRandomMessage() {
  const randomIndex = Math.floor(Math.random() * funnyCodeMessages.length);
  return funnyCodeMessages[randomIndex];
}

// Update hero text with glitch effect
function updateHeroText(newText) {
  const heroText = document.querySelector('.hero-subtitle');
  if (!heroText) return;

  heroText.style.animation = 'none';
  heroText.offsetHeight; // Trigger reflow
  heroText.textContent = newText;
  heroText.style.animation = 'glitchText 0.5s ease-out';
}

// Initialize click handler when document is loaded
document.addEventListener('DOMContentLoaded', () => {
  const clickMeButton = document.getElementById('click-me-btn');
  if (clickMeButton) {
    clickMeButton.addEventListener('click', (e) => {
      e.preventDefault();
      const newMessage = getRandomMessage();
      updateHeroText(newMessage);
    });
  }
});
