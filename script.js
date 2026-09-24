// ---- Set your wedding date/time here (local time) ----
const WEDDING_DATE = new Date("2027-01-20T14:00:00+08:00");

function updateCountdown(){
  const now = new Date();
  let diff = WEDDING_DATE - now;
  if(diff < 0) diff = 0;

  const days = Math.floor(diff / (1000*60*60*24));
  const hours = Math.floor((diff / (1000*60*60)) % 24);
  const mins = Math.floor((diff / (1000*60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  const pad = n => String(n).padStart(2,'0');
  document.getElementById('cd-days').textContent = pad(days);
  document.getElementById('cd-hours').textContent = pad(hours);
  document.getElementById('cd-mins').textContent = pad(mins);
  document.getElementById('cd-secs').textContent = pad(secs);
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ---- Mobile nav & smooth navbar scrolling ----
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if(navToggle && navLinks){
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
}

// ---- Guaranteed Smooth Animated Scroll (requestAnimationFrame) ----
function animatedScrollTo(targetY, duration = 850){
  const startY = window.pageYOffset || document.documentElement.scrollTop || 0;
  const diff = targetY - startY;
  if(Math.abs(diff) < 2) return;
  let startTimestamp = null;

  function easeInOutCubic(t){
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(timestamp){
    if(!startTimestamp) startTimestamp = timestamp;
    const elapsed = timestamp - startTimestamp;
    const progress = Math.min(elapsed / duration, 1);
    const ease = easeInOutCubic(progress);

    window.scrollTo(0, startY + diff * ease);

    if(elapsed < duration){
      window.requestAnimationFrame(step);
    }
  }

  window.requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e){
    const targetId = this.getAttribute('href');
    if(!targetId || targetId === '#') return;
    const targetEl = document.querySelector(targetId);
    if(targetEl){
      e.preventDefault();
      if(navLinks) navLinks.classList.remove('open');
      const navEl = document.getElementById('nav');
      const navOffset = navEl ? navEl.offsetHeight : 64;
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop || 0;
      const targetPosition = targetEl.getBoundingClientRect().top + currentScroll - navOffset;

      animatedScrollTo(targetPosition, 850);
    }
  });
});

// ---- FAQ accordion ----
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if(!wasOpen) item.classList.add('open');
  });
});

// ---- RSVP: hide guest count field when declining ----
const attendingSelect = document.getElementById('attendingSelect');
const guestField = document.getElementById('guestField');
attendingSelect.addEventListener('change', () => {
  guestField.style.display = attendingSelect.value === 'Regretfully declines' ? 'none' : 'block';
});

// ---- RSVP: submit to Netlify Forms via fetch (no page reload) ----
const rsvpForm = document.getElementById('rsvpForm');
const formStatus = document.getElementById('formStatus');

rsvpForm.addEventListener('submit', function(e){
  e.preventDefault();
  const data = new FormData(rsvpForm);

  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(data).toString()
  })
  .then(() => {
    formStatus.textContent = 'Thank you! Your RSVP has been received.';
    rsvpForm.reset();
    guestField.style.display = 'block';
  })
  .catch(() => {
    formStatus.textContent = 'Something went wrong — please try again or message us directly.';
  });
});

// ---- LANDING GATE: Guest Name & Animated Invitation Transition ----
const landingGate = document.getElementById('landingGate');
const gateCard = document.getElementById('gateCard');
const gateWelcome = document.getElementById('gateWelcome');
const guestNameInput = document.getElementById('guestNameInput');
const gateGuestSpan = document.getElementById('gateGuestSpan');
const gateBtn = document.getElementById('gateBtn');
const gateError = document.getElementById('gateError');
const heroVideo = document.querySelector('.hero-video');
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const musicIcon = document.getElementById('musicIcon');

if(landingGate){
  document.body.style.overflow = 'hidden';

  function openInvitation(){
    const rawName = guestNameInput ? guestNameInput.value.trim() : '';
    
    // Validation: Name is mandatory
    if(!rawName){
      if(gateError) gateError.style.display = 'block';
      if(guestNameInput){
        guestNameInput.classList.remove('input-shake');
        void guestNameInput.offsetWidth; // trigger reflow for animation restart
        guestNameInput.classList.add('input-shake');
        guestNameInput.focus();
      }
      return;
    }

    if(gateError) gateError.style.display = 'none';
    if(gateGuestSpan) gateGuestSpan.textContent = rawName;

    const rsvpNameInput = document.querySelector('#rsvpForm input[name="name"]');
    if(rsvpNameInput) rsvpNameInput.value = rawName;

    // Start background music immediately upon user interaction
    if(bgMusic){
      bgMusic.play().then(() => {
        setMusicUI(true);
      }).catch(() => {});
    }

    // Step 1: Smoothly slide DOWN the name entry card
    if(gateCard){
      gateCard.classList.add('slide-down');
    }

    setTimeout(() => {
      if(gateCard) gateCard.style.display = 'none';
      if(gateWelcome){
        gateWelcome.style.display = 'block';
        gateWelcome.classList.add('enter');
      }

      // Step 2: Atmospheric 1.5s preparation with 3-dot animation
      setTimeout(() => {
        // Step 3: Loading message slides UP
        if(gateWelcome){
          gateWelcome.classList.remove('enter');
          gateWelcome.classList.add('slide-up');
        }

        // Step 4: Landing gate slides UP and main page slides UP into place
        setTimeout(() => {
          landingGate.classList.add('gate-leave');
          document.body.classList.remove('gate-active');
          document.body.classList.add('invitation-opened');
          document.body.style.overflow = '';

          if(heroVideo){
            heroVideo.play().catch(() => {});
          }

          setTimeout(() => {
            landingGate.style.display = 'none';
          }, 950);
        }, 340);
      }, 1500);
    }, 320);
  }

  if(gateBtn){
    gateBtn.addEventListener('click', function(e){
      e.preventDefault();
      openInvitation();
    });
  }

  if(guestNameInput){
    guestNameInput.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){
        e.preventDefault();
        openInvitation();
      }
    });

    guestNameInput.addEventListener('input', function(){
      if(this.value.trim().length > 0){
        if(gateError) gateError.style.display = 'none';
        this.classList.remove('input-shake');
      }
    });
  }
}

// ---- Floating Music Play/Pause Toggle ----
const musicBars = document.getElementById('musicBars');
const musicMuteIcon = document.getElementById('musicMuteIcon');

function setMusicUI(isPlaying){
  if(!musicToggle) return;
  if(isPlaying){
    musicToggle.classList.add('playing');
    if(musicBars) musicBars.style.display = 'flex';
    if(musicMuteIcon) musicMuteIcon.style.display = 'none';
  } else {
    musicToggle.classList.remove('playing');
    if(musicBars) musicBars.style.display = 'none';
    if(musicMuteIcon) musicMuteIcon.style.display = 'block';
  }
}

if(musicToggle && bgMusic){
  musicToggle.addEventListener('click', function(){
    if(bgMusic.paused){
      bgMusic.play().then(() => {
        setMusicUI(true);
      }).catch(() => {});
    } else {
      bgMusic.pause();
      setMusicUI(false);
    }
  });
}

// ---- Order of Events Toggle ----
const orderToggleBtn = document.getElementById('orderToggleBtn');
const orderEventsPanel = document.getElementById('orderEventsPanel');

if(orderToggleBtn && orderEventsPanel){
  orderToggleBtn.addEventListener('click', function(){
    const isExpanded = orderToggleBtn.getAttribute('aria-expanded') === 'true';
    if(isExpanded){
      orderEventsPanel.style.display = 'none';
      orderToggleBtn.setAttribute('aria-expanded', 'false');
      orderToggleBtn.classList.remove('active');
    } else {
      orderEventsPanel.style.display = 'block';
      orderToggleBtn.setAttribute('aria-expanded', 'true');
      orderToggleBtn.classList.add('active');
      setTimeout(() => {
        const rect = orderEventsPanel.getBoundingClientRect();
        if(rect.top > window.innerHeight - 150){
          const targetY = (window.pageYOffset || document.documentElement.scrollTop) + rect.top - 80;
          animatedScrollTo(targetY, 600);
        }
      }, 50);
    }
  });
}

// ---- SCROLL REVEAL ANIMATIONS ----
const revealTargets = document.querySelectorAll(
  '.countdown-section, .cards .card, .note-section, .about-card, .gallery-grid img, .entourage-block, .dress-row, .faq-item, .rsvp-form, .gift-card'
);

revealTargets.forEach(el => el.classList.add('reveal'));

if('IntersectionObserver' in window){
  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.1
  });

  revealTargets.forEach(el => scrollObserver.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add('revealed'));
}
