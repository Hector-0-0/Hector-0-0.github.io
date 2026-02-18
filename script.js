/* =========================================
   CANVAS — PARTÍCULAS OPTIMIZADAS
   ========================================= */
const canvas = document.getElementById('canvas-background');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];
let animationId;
let isVisible = true;

const mouse = { x: null, y: null, radius: 130 };

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

// ── Reducir partículas en móvil para mejorar performance ──
function getParticleCount() {
    const area = canvas.width * canvas.height;
    if (window.innerWidth < 768) return Math.min(40, area / 18000); // Móvil: menos partículas
    return Math.min(120, area / 9000); // Desktop: limitado a 120
}

class Particle {
    constructor() {
        this.size = Math.random() * 1.5 + 0.8;
        this.x = Math.random() * (canvas.width - this.size * 2) + this.size;
        this.y = Math.random() * (canvas.height - this.size * 2) + this.size;
        this.directionX = (Math.random() * 1.5) - 0.75; // Más lentas
        this.directionY = (Math.random() * 1.5) - 0.75;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
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

// ── Conexiones: distancia máxima proporcional a la pantalla (limitada) ──
const MAX_CONNECT_DIST = 12000; // Fija, no depende del tamaño de pantalla

function connect() {
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a + 1; b < particlesArray.length; b++) {
            const dx = particlesArray[a].x - particlesArray[b].x;
            const dy = particlesArray[a].y - particlesArray[b].y;
            const dist = dx * dx + dy * dy;

            if (dist < MAX_CONNECT_DIST) {
                // Líneas más tenues cuando están más lejos
                const opacity = 1 - dist / MAX_CONNECT_DIST;
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.08})`;
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

function animate() {
    if (!isVisible) return; // Pausa si la pestaña no está activa
    animationId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesArray.forEach(p => p.update());
    connect();
}

// ── Pausar cuando la pestaña no está visible (ahorra batería/CPU) ──
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        isVisible = false;
        cancelAnimationFrame(animationId);
    } else {
        isVisible = true;
        animate();
    }
});

// ── Resize con debounce para no recalcular cada píxel ──
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    }, 200);
});

init();
animate();

/* =========================================
   NAVBAR — Aparece al hacer scroll
   ========================================= */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}, { passive: true });
