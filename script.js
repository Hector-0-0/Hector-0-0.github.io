const canvas = document.getElementById('canvas-background');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray;

// Guardar la posición del mouse para la interacción
let mouse = {
    x: null,
    y: null,
    radius: 150 // Área de efecto alrededor del cursor
}

window.addEventListener('mousemove', function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

// Clase para crear cada punto individual
class Particle {
    constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
    }
    // Dibujar el punto
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
    }
    // Mover el punto y rebotar en los bordes
    update() {
        if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
        if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
        
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
    }
}

// Crear la red de conexiones entre puntos cercanos
function connect() {
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
            + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
            
            // Si están lo suficientemente cerca, dibuja una línea
            if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

// Llenar el arreglo con partículas aleatorias
function init() {
    particlesArray = [];
    let numberOfParticles = (canvas.height * canvas.width) / 9000;
    for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 1;
        let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * 2) - 1;
        let directionY = (Math.random() * 2) - 1;

        particlesArray.push(new Particle(x, y, directionX, directionY, size));
    }
}

// Bucle de animación
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    connect();
}

init();
animate();

// Ajustar el tamaño si cambias la ventana
window.addEventListener('resize', function() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    init();
});