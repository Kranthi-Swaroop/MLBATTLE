// ========================================
// MLBattle - Frontend JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initAnimations();
  initLeaderboardUpdates();
});

// ========================================
// Navbar Scroll Effect
// ========================================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// ========================================
// Mobile Menu Toggle
// ========================================
function initMobileMenu() {
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      mobileToggle.classList.toggle('active');
    });
  }
}

// ========================================
// Smooth Scroll for Anchor Links
// ========================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(targetId);
      
      if (target) {
        const navbarHeight = document.getElementById('navbar').offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Close mobile menu if open
        const navLinks = document.getElementById('navLinks');
        const mobileToggle = document.getElementById('mobileToggle');
        if (navLinks) navLinks.classList.remove('active');
        if (mobileToggle) mobileToggle.classList.remove('active');
      }
    });
  });
}

// ========================================
// Scroll Animations (Intersection Observer)
// ========================================
function initAnimations() {
  const animateElements = document.querySelectorAll(
    '.competition-card, .stat-card, .feature-card, .section-header'
  );
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fadeInUp');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  animateElements.forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

// ========================================
// Simulated Leaderboard Updates
// ========================================
function initLeaderboardUpdates() {
  const ratings = document.querySelectorAll('.rating');
  const changes = document.querySelectorAll('.change');
  
  // Simulate live score changes every 10 seconds
  setInterval(() => {
    ratings.forEach(rating => {
      const currentRating = parseInt(rating.textContent);
      const change = Math.floor(Math.random() * 10) - 5; // -5 to +5
      const newRating = currentRating + change;
      
      // Add flash animation
      rating.style.transition = 'transform 0.2s ease';
      rating.style.transform = 'scale(1.1)';
      
      setTimeout(() => {
        rating.textContent = newRating;
        rating.style.transform = 'scale(1)';
      }, 200);
    });
    
    // Randomly update change indicators
    changes.forEach(change => {
      const outcomes = ['up', 'down', 'neutral'];
      const symbols = ['↑', '↓', '—'];
      const randomIndex = Math.floor(Math.random() * 3);
      
      change.className = 'change ' + outcomes[randomIndex];
      
      if (outcomes[randomIndex] === 'neutral') {
        change.textContent = symbols[randomIndex];
      } else {
        const amount = Math.floor(Math.random() * 5) + 1;
        change.textContent = symbols[randomIndex] + ' ' + amount;
      }
    });
  }, 10000);
}

// ========================================
// Button Ripple Effect
// ========================================
document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    
    ripple.style.cssText = `
      position: absolute;
      background: rgba(255,255,255,0.3);
      border-radius: 50%;
      pointer-events: none;
      width: 100px;
      height: 100px;
      left: ${e.clientX - rect.left - 50}px;
      top: ${e.clientY - rect.top - 50}px;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
    `;
    
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  });
});

// Add ripple animation to stylesheet
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .nav-links.active {
    display: flex !important;
    flex-direction: column;
    position: absolute;
    top: 72px;
    left: 0;
    right: 0;
    background: white;
    padding: 1rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    gap: 1rem;
    animation: slideDown 0.3s ease;
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .mobile-toggle.active span:nth-child(1) {
    transform: rotate(45deg) translate(6px, 6px);
  }
  
  .mobile-toggle.active span:nth-child(2) {
    opacity: 0;
  }
  
  .mobile-toggle.active span:nth-child(3) {
    transform: rotate(-45deg) translate(6px, -6px);
  }
`;
document.head.appendChild(style);
