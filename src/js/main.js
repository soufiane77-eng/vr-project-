import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Initialize smooth scrolling with Lenis
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard exponential easing
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1.5,
});

// Synchronize Lenis scrolling with ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

// Hook Lenis into GSAP's RAF ticker
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

// Disable lag smoothing to align frame updates perfectly with scroll updates
gsap.ticker.lagSmoothing(0);

// DOM Elements - Section 1
const canvas = document.getElementById('scroll-canvas');
const ctx = canvas.getContext('2d');
const heroOverlay = document.getElementById('hero-overlay');

// DOM Elements - Section 3
const canvas2 = document.getElementById('scroll-canvas-2');
const ctx2 = canvas2.getContext('2d');

const loader = document.getElementById('loader');
const loaderText = document.getElementById('loader-text');

// Sequence 1 Configuration
const frameCount = 240;
const images = [];
let loadedCount = 0;
const sequence = { frame: 0 };

// Sequence 2 Configuration
const frameCount2 = 240;
const images2 = [];
let loadedCount2 = 0;
const sequence2 = { frame: 0 };
let sequence2Loaded = false;

// Generate frame paths for Section 1 (frames3 - recompressed, local)
const getFramePath = (index) => {
  return `/frames3/frame_${index.toString().padStart(6, '0')}.webp`;
};

// Generate frame paths for Section 3 (CDN)
const getFramePath2 = (index) => {
  return `https://cdn.jsdelivr.net/gh/soufiane77-eng/vr-project-@master/public/frames2/frame_${index.toString().padStart(6, '0')}.webp`;
};

// Proportional cover drawing for Canvas 1
function drawImageCover(img) {
  if (!img || !img.complete) return;

  // Mobile: zoom out slightly (scale < 1 = image smaller = more visible)
  const isMobile = window.innerWidth <= 767;
  const zoomOut = isMobile ? 0.80 : 1;

  const canvasWidth = canvas.width * zoomOut;
  const canvasHeight = canvas.height * zoomOut;
  const offsetX = (canvas.width - canvasWidth) / 2;
  const offsetY = (canvas.height - canvasHeight) / 2;
  
  const imgWidth = img.width;
  const imgHeight = img.height;
  
  const imgRatio = imgWidth / imgHeight;
  const canvasRatio = canvasWidth / canvasHeight;
  
  let drawWidth, drawHeight, x, y;
  
  if (canvasRatio > imgRatio) {
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / imgRatio;
    x = offsetX;
    y = offsetY + (canvasHeight - drawHeight) / 2;
  } else {
    drawWidth = canvasHeight * imgRatio;
    drawHeight = canvasHeight;
    x = offsetX + (canvasWidth - drawWidth) / 2;
    y = offsetY;
  }
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, x, y, drawWidth, drawHeight);
}

// Proportional cover drawing for Canvas 2
function drawImageCover2(img) {
  if (!img || !img.complete) return;

  // Mobile: zoom out slightly (scale < 1 = image smaller = more visible)
  const isMobile = window.innerWidth <= 767;
  const zoomOut = isMobile ? 0.80 : 1;

  const canvasWidth = canvas2.width * zoomOut;
  const canvasHeight = canvas2.height * zoomOut;
  const offsetX = (canvas2.width - canvasWidth) / 2;
  const offsetY = (canvas2.height - canvasHeight) / 2;
  
  const imgWidth = img.width;
  const imgHeight = img.height;
  
  const imgRatio = imgWidth / imgHeight;
  const canvasRatio = canvasWidth / canvasHeight;
  
  let drawWidth, drawHeight, x, y;
  
  if (canvasRatio > imgRatio) {
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / imgRatio;
    x = offsetX;
    y = offsetY + (canvasHeight - drawHeight) / 2;
  } else {
    drawWidth = canvasHeight * imgRatio;
    drawHeight = canvasHeight;
    x = offsetX + (canvasWidth - drawWidth) / 2;
    y = offsetY;
  }
  
  ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
  ctx2.drawImage(img, x, y, drawWidth, drawHeight);
}

// Render Canvas 1
function render() {
  const frameIndex = Math.round(sequence.frame);
  const img = images[frameIndex];
  if (img) {
    drawImageCover(img);
  }
}

// Render Canvas 2
function render2() {
  const frameIndex = Math.round(sequence2.frame);
  const img = images2[frameIndex];
  if (img && img.complete) {
    drawImageCover2(img);
  } else {
    // Keep canvas 2 clear and black until images preload
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    ctx2.fillStyle = '#000000';
    ctx2.fillRect(0, 0, canvas2.width, canvas2.height);
  }
}

// Update canvas resolution and fit to viewport
function resizeCanvas() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;

  // Canvas 1 Sizing
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  // Canvas 2 Sizing
  canvas2.width = width * dpr;
  canvas2.height = height * dpr;

  // Render current frames
  render();
  render2();
}

// Listen for window resize events
window.addEventListener('resize', resizeCanvas);

// Preload all Section 1 images and synchronously preserve order
function preloadImages() {
  return new Promise((resolve) => {
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      images.push(img);
      img.onload = () => {
        loadedCount++;
        loaderText.textContent = `Loading ${Math.round((loadedCount / frameCount) * 100)}%`;
        
        if (loadedCount === frameCount) {
          resolve();
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          resolve();
        }
      };
      img.src = getFramePath(i);
    }
  });
}

// Preload Section 3 images asynchronously in the background and preserve order
function preloadImages2() {
  return new Promise((resolve) => {
    for (let i = 1; i <= frameCount2; i++) {
      const img = new Image();
      images2.push(img);
      img.onload = () => {
        loadedCount2++;
        if (loadedCount2 === frameCount2) {
          sequence2Loaded = true;
          resolve();
        }
      };
      img.onerror = () => {
        loadedCount2++;
        if (loadedCount2 === frameCount2) {
          sequence2Loaded = true;
          resolve();
        }
      };
      img.src = getFramePath2(i);
    }
  });
}

// Initialize components
async function init() {
  // 1. Load Section 1 first to make page immediately interactive
  await preloadImages();

  // 2. Hide loading overlay
  loader.classList.add('loader--hidden');

  // 3. Trigger initial sizing and render first frame of Section 1
  resizeCanvas();

  // 4. Canvas 1 + Hero visible from the start
  gsap.set(canvas, { opacity: 1 });
  gsap.set(heroOverlay, { opacity: 1 });

  // 5. Hero fades out as user scrolls (same range as canvas1 fade-out)
  gsap.to(heroOverlay, {
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '.scroll-container',
      start: '50% top',
      end: 'bottom top',
      scrub: true,
    },
  });

  // 6. Canvas 1 fades out at the end of scroll-container → reveals black section
  gsap.to(canvas, {
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '.scroll-container',
      start: '80% top',
      end: 'bottom top',
      scrub: true,
    },
  });

  // 6. Canvas 1 + Hero fade back in when scrolling back up past the black section
  ScrollTrigger.create({
    trigger: '.plain-section',
    start: 'top bottom',
    onLeave: () => { gsap.set(canvas, { opacity: 0 }); gsap.set(heroOverlay, { opacity: 0 }); },
    onEnterBack: () => { gsap.set(canvas, { opacity: 1 }); gsap.set(heroOverlay, { opacity: 1 }); },
  });

  // 7. Setup ScrollTrigger for Section 1 frame animation
  gsap.to(sequence, {
    frame: frameCount - 1,
    ease: 'none',
    scrollTrigger: {
      trigger: '.scroll-container',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
    },
    onUpdate: render,
  });

  // 5. Preload Section 3 images in the background
  preloadImages2().then(() => {
    // Redraw Canvas 2 with first frame of Section 3 once preloaded
    render2();

    // Canvas 2 fades in at the START of scroll-wrapper (just after black section)
    gsap.to(canvas2, {
      opacity: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '#seq-wrapper-2',
        start: 'top top',
        end: '20% top',
        scrub: true,
      },
    });

    // Canvas 2 hidden when scrolling back above Section 3
    ScrollTrigger.create({
      trigger: '#seq-wrapper-2',
      start: 'top top',
      onLeaveBack: () => gsap.set(canvas2, { opacity: 0 }),
    });

    // Setup ScrollTrigger for Section 3 frame animation
    gsap.to(sequence2, {
      frame: frameCount2 - 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '#seq-wrapper-2',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
      },
      onUpdate: render2,
    });
  });
}

// ============================================
// Interactive UI Logic — ChatModal, WorksDrawer, ExploreWidget
// ============================================

// --- DOM References ---
const chatModal = document.getElementById('chat-modal');
const chatClose = document.getElementById('chat-close');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

const worksDrawer = document.getElementById('works-drawer');
const worksClose = document.getElementById('works-close');
const worksStartProject = document.getElementById('works-start-project');

const menuBtn = document.querySelector('.hero-nav-menu-btn');
const chatWithUsBtn = document.querySelector('.hero-btn-primary');
const ourWorksBtn = document.querySelector('.hero-btn-secondary');
const exploreExpandBtn = document.querySelector('.hero-widget-expand');

// --- Nav Links References ---
const navLinks = document.querySelectorAll('.hero-nav-link');

// --- Open / Close Helpers ---
function openChat() {
  chatModal.classList.add('open');
  chatInput.focus();
}

function closeChat() {
  chatModal.classList.remove('open');
}

function openWorks() {
  worksDrawer.classList.add('open');
}

function closeWorks() {
  worksDrawer.classList.remove('open');
}

// --- Chat With Us Button ---
if (chatWithUsBtn) chatWithUsBtn.addEventListener('click', openChat);

// --- Our Works Button ---
if (ourWorksBtn) ourWorksBtn.addEventListener('click', openWorks);

// --- Menu Button (opens Works Drawer as menu) ---
if (menuBtn) menuBtn.addEventListener('click', openWorks);

// --- Explore Widget Expand Button (+) → Opens Works Drawer ---
if (exploreExpandBtn) exploreExpandBtn.addEventListener('click', openWorks);

// --- Close Buttons ---
if (chatClose) chatClose.addEventListener('click', closeChat);
if (worksClose) worksClose.addEventListener('click', closeWorks);

// --- Close on Backdrop Click ---
chatModal.addEventListener('click', (e) => {
  if (e.target === chatModal) closeChat();
});
worksDrawer.addEventListener('click', (e) => {
  if (e.target === worksDrawer) closeWorks();
});

// --- Close on Escape Key ---
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeChat();
    closeWorks();
  }
});

// --- "Start Project" in Works Drawer → Close Drawer, Open Chat ---
if (worksStartProject) {
  worksStartProject.addEventListener('click', () => {
    closeWorks();
    setTimeout(openChat, 300);
  });
}

// --- Nav Links Logic ---
navLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const text = link.textContent.trim().split('\n')[0].trim(); // "Home", "Product", etc.

    // Toggle active state
    navLinks.forEach((l) => l.classList.remove('active'));
    link.classList.add('active');

    // Specific actions
    if (text === 'Home') {
      lenis.scrollTo(0, { duration: 1.5 });
    } else if (text === 'Product') {
      openWorks();
    } else if (text === 'About' || text === 'Brands' || text === 'Careers' || text === 'Partners') {
      openWorks();
    }
  });
});

// --- Chat History for Big Pickle Context ---
const chatHistory = [];

// --- OpenCode Zen API Call (Big Pickle) ---
async function callAI(userMessage) {
  chatHistory.push({ role: 'user', content: userMessage });

  const systemPrompt = `You are Zenrixa, a creative strategist and digital agency assistant. You help clients with:
- Brand identity & visual design
- Web & app development
- Spatial computing & UI/UX systems
- Motion design & 3D experiences
- Digital strategy & consulting

PRICING: Any question about VR experience price is 600 DH (approx. 60 USD).
CONTACT: For any contact-related question, reply with "Contactez-moi sur 0677889910".
DEVELOPER: For any question about who developed or built this site, reply with "The Midnight Dev a développé ce site."

Respond in a professional, friendly, and concise tone. If the user asks about a project, guide them. Keep responses under 150 words. You work at Zenrixa Creative Agency.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory
  ];

  try {
    const response = await fetch(
      '/api/zen',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'big-pickle',
          messages: messages,
          temperature: 0.7,
          max_tokens: 200
        })
      }
    );

    const data = await response.json();
    console.log('Big Pickle response:', data);
    if (!response.ok) {
      console.error('API error:', data.error?.message || JSON.stringify(data));
      return 'API Error: ' + (data.error?.message || 'Unknown error');
    }
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I encountered an issue. Please try again.';
    chatHistory.push({ role: 'assistant', content: reply });
    return reply;
  } catch (err) {
    console.error('API error:', err);
    return 'Sorry, I could not connect right now. Please try again later.';
  }
}
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  // Add user message
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-msg chat-msg-user';
  userMsg.innerHTML = `<div class="chat-bubble chat-bubble-user">${escapeHtml(text)}</div>`;
  chatMessages.appendChild(userMsg);

  chatInput.value = '';
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Show typing indicator
  const typing = document.createElement('div');
  typing.className = 'chat-msg chat-msg-agent';
  typing.id = 'chat-typing';
  typing.innerHTML = `<div class="chat-typing"><div class="chat-typing-spinner"></div>Zenrixa strategist typing...</div>`;
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Call Gemini API and show reply
  callAI(text).then((reply) => {
    const typingEl = document.getElementById('chat-typing');
    if (typingEl) typingEl.remove();

    const agentReply = document.createElement('div');
    agentReply.className = 'chat-msg chat-msg-agent';
    agentReply.innerHTML = `<div class="chat-bubble chat-bubble-agent">${escapeHtml(reply)}</div>`;
    chatMessages.appendChild(agentReply);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================================
// ExploreWidget Interactive Logic
// ============================================
const widgetTag = document.querySelector('.hero-widget-tag');
const widgetTitle = document.querySelector('.hero-widget-title');
const widgetSubtitle = document.querySelector('.hero-widget-subtitle');
const widgetProgressHeader = document.querySelector('.hero-widget-progress-header');
const widgetProgressFill = document.querySelector('.hero-widget-progress-fill');
const widgetPlayBtn = document.querySelector('.hero-widget-buttons .hero-widget-btn-sm');
const widgetNextBtn = document.querySelector('.hero-widget-nav .hero-widget-btn-sm');

const exploreSlides = [
  { title: 'Design to explore.', subtitle: 'Spatial Computing & UI/UX Systems', tag: 'Vision OS 2.0' },
  { title: 'Built from zero.', subtitle: 'Zero-latency Digital Architecture', tag: 'Core Engineering' },
  { title: 'Delivering value.', subtitle: 'Tailored brand identities & software', tag: 'Identity Design' },
];

let currentSlide = 0;
let isPlaying = false;
let widgetProgress = 35;
let widgetTimer = null;

function updateWidget() {
  const s = exploreSlides[currentSlide];
  if (widgetTag) {
    // Preserve the SVG icon, update just the tag text
    const svg = widgetTag.querySelector('svg');
    if (svg) {
      widgetTag.textContent = '';
      widgetTag.appendChild(svg);
      widgetTag.appendChild(document.createTextNode('\n                ' + s.tag + '\n              '));
    } else {
      widgetTag.textContent = s.tag;
    }
  }
  if (widgetTitle) widgetTitle.textContent = s.title;
  if (widgetSubtitle) widgetSubtitle.textContent = s.subtitle;
  if (widgetProgressFill) widgetProgressFill.style.width = widgetProgress + '%';
  // Update progress header text
  if (widgetProgressHeader) {
    const spans = widgetProgressHeader.querySelectorAll('span');
    if (spans.length >= 2) {
      spans[1].textContent = Math.round(widgetProgress) + '%';
    }
  }
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % exploreSlides.length;
  widgetProgress = 0;
  updateWidget();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + exploreSlides.length) % exploreSlides.length;
  widgetProgress = 0;
  updateWidget();
}

function startAutoplay() {
  isPlaying = true;
  updatePlayIcon();
  widgetTimer = setInterval(() => {
    widgetProgress += 2;
    if (widgetProgress >= 100) {
      nextSlide();
      cycleFirstFrame();
    }
    updateWidget();
  }, 60);
}

function stopAutoplay() {
  isPlaying = false;
  updatePlayIcon();
  if (widgetTimer) clearInterval(widgetTimer);
}

function updatePlayIcon() {
  if (!widgetPlayBtn) return;
  if (isPlaying) {
    widgetPlayBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
  } else {
    widgetPlayBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
  }
}

if (widgetPlayBtn) {
  widgetPlayBtn.addEventListener('click', () => {
    if (isPlaying) stopAutoplay();
    else startAutoplay();
  });
}

// Custom overlay images cycle (bleu, vert, violet)
const overlayImages = [];
const overlayPaths = [
  'https://cdn.jsdelivr.net/gh/soufiane77-eng/vr-project-@master/public/bleu.webp',
  'https://cdn.jsdelivr.net/gh/soufiane77-eng/vr-project-@master/public/vert.webp',
  'https://cdn.jsdelivr.net/gh/soufiane77-eng/vr-project-@master/public/violet.webp'
];
let overlayIndex = 0;
overlayPaths.forEach(src => {
  const img = new Image();
  img.src = src;
  overlayImages.push(img);
});

function cycleFirstFrame() {
  const nextImg = overlayImages[overlayIndex % overlayImages.length];
  if (nextImg && nextImg.complete && nextImg.naturalWidth) {
    images[0] = nextImg; // replace first frame
    render(); // re-render immediately
  }
  overlayIndex++;
}

if (widgetNextBtn) widgetNextBtn.addEventListener('click', () => {
  stopAutoplay();
  nextSlide();
  cycleFirstFrame();
});

// Progress bar click to seek
const progressBar = document.querySelector('.hero-widget-progress-bar');
if (progressBar) {
  progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    widgetProgress = Math.round((clickX / rect.width) * 100);
    updateWidget();
  });
}

// Initialize widget display
updateWidget();
updatePlayIcon();

// Run application
init();

// ----------------------------------------
// Mobile: hide widget on scroll down, show on scroll up
// ----------------------------------------
(function initMobileWidgetHide() {
  const widget = document.querySelector('.hero-widget');
  if (!widget) return;

  let lastScroll = 0;
  let ticking = false;

  lenis.on('scroll', ({ scroll }) => {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const isMobile = window.innerWidth <= 767;
      if (!isMobile) {
        widget.classList.remove('widget-hidden');
        lastScroll = scroll;
        ticking = false;
        return;
      }

      const delta = scroll - lastScroll;
      if (delta > 5) {
        // scrolling down
        widget.classList.add('widget-hidden');
      } else if (delta < -5) {
        // scrolling up
        widget.classList.remove('widget-hidden');
      }

      lastScroll = scroll;
      ticking = false;
    });
  });
})();
