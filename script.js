/* =========================================
   CANVAS — PARTÍCULAS OPTIMIZADAS
   ========================================= */
const canvas = document.getElementById('canvas-background');
const ctx = canvas.getContext('2d');

let particlesArray = [];
let animationId;
let isVisible = true;

const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent)
    || window.innerWidth < 768;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function getParticleCount() {
    if (isMobile) return 20;
    if (window.innerWidth < 1024) return 50;
    return 80;
}

const MAX_CONNECT_DIST = isMobile ? 6000 : 12000;

class Particle {
    constructor() {
        this.size = Math.random() * 1.2 + 0.6;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        const speed = isMobile ? 0.3 : 0.6;
        this.directionX = (Math.random() - 0.5) * speed;
        this.directionY = (Math.random() - 0.5) * speed;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
    }

    update() {
        if (this.x > canvas.width || this.x < 0) this.directionX *= -1;
        if (this.y > canvas.height || this.y < 0) this.directionY *= -1;
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
    }
}

function connect() {
    if (isMobile) return;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a + 1; b < particlesArray.length; b++) {
            const dx = particlesArray[a].x - particlesArray[b].x;
            const dy = particlesArray[a].y - particlesArray[b].y;
            const dist = dx * dx + dy * dy;
            if (dist < MAX_CONNECT_DIST) {
                const opacity = (1 - dist / MAX_CONNECT_DIST) * 0.08;
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

function init() {
    particlesArray = [];
    const count = getParticleCount();
    for (let i = 0; i < count; i++) {
        particlesArray.push(new Particle());
    }
}

let lastTime = 0;
const FRAME_INTERVAL = isMobile ? 1000 / 30 : 1000 / 60;

function animate(timestamp = 0) {
    if (!isVisible) return;
    animationId = requestAnimationFrame(animate);
    const elapsed = timestamp - lastTime;
    if (elapsed < FRAME_INTERVAL) return;
    lastTime = timestamp - (elapsed % FRAME_INTERVAL);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesArray.forEach(p => p.update());
    connect();
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        isVisible = false;
        cancelAnimationFrame(animationId);
    } else {
        isVisible = true;
        animate();
    }
});

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    }, 250);
}, { passive: true });

init();
animate();

/* =========================================
   NAVBAR — Scroll effect
   ========================================= */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* =========================================
   NAVBAR — Menú hamburguesa
   FIX: agrega body.menu-open para ocultar el alien
   ========================================= */
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
        // FIX: esto activa el CSS que oculta el alien
        document.body.classList.toggle('menu-open');
    });

    // Al hacer click en un link del menú, cerrar todo
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.classList.remove('menu-open');
        });
    });
}

/* =========================================
   SLIDER DE PROYECTOS
   ========================================= */
const slider = document.getElementById('projectsSlider');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('sliderDots');

if (slider) {
    const cards = slider.querySelectorAll('.project-card');
    let current = 0;

    cards.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.classList.add('slider-dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
    });

    function updateDots() {
        dotsContainer.querySelectorAll('.slider-dot').forEach((d, i) => {
            d.classList.toggle('active', i === current);
        });
    }

    function goTo(index) {
        current = Math.max(0, Math.min(index, cards.length - 1));
        cards[current].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        updateDots();
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    let isDown = false, startX, scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => isDown = false);
    slider.addEventListener('mouseup', () => isDown = false);
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        slider.scrollLeft = scrollLeft - (e.pageX - slider.offsetLeft - startX) * 1.5;
    });

    slider.addEventListener('scroll', () => {
        const cardWidth = cards[0].offsetWidth + 25;
        current = Math.round(slider.scrollLeft / cardWidth);
        updateDots();
    }, { passive: true });
}