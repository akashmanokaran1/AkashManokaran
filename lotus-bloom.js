// Initialize GSAP and ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// 1. BACKGROUND PARTICLES GENERATION
const particlesContainer = document.getElementById('particles-container');
const particleCount = 40;

function createParticles() {
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Randomize initial properties
        const size = Math.random() * 4 + 2;
        const left = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = Math.random() * 10 + 5;
        const opacity = Math.random() * 0.5 + 0.1;

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${left}%`;
        particle.style.animationDelay = `-${delay}s`;
        particle.style.setProperty('--duration', `${duration}s`);
        particle.style.opacity = opacity;

        particlesContainer.appendChild(particle);
    }
}

createParticles();

// 2. LOTUS BLOOM SCROLL ANIMATION
const lotusTimeline = gsap.timeline({
    scrollTrigger: {
        trigger: ".spacer", // Scroll distance
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5, // Smooth interaction
        markers: false
    }
});

// Initial States
gsap.set(".petal", {
    transformOrigin: "center bottom",
    scale: 0.1,
    opacity: 0,
    rotate: 0
});

// Extract original rotations from HTML transform
const getOriginalRotation = (el) => {
    const transform = el.getAttribute('transform');
    if (transform && transform.includes('rotate')) {
        return parseInt(transform.match(/rotate\(([^)]+)\)/)[1]);
    }
    return 0;
};

// Map original rotations for all petals
const petals = document.querySelectorAll('.petal');
petals.forEach(p => {
    p.dataset.finalRot = getOriginalRotation(p);
});

// Bloom Animation Phases
// Phase 1: Outer Layer (10% - 30%)
lotusTimeline.to("#outer-petals .petal", {
    scale: 1,
    opacity: 1,
    rotate: (i, target) => target.dataset.finalRot,
    duration: 1,
    stagger: 0.05,
    ease: "power2.out"
}, 0.1);

// Phase 2: Middle Layer (30% - 60%)
lotusTimeline.to("#middle-petals .petal", {
    scale: 1,
    opacity: 1,
    rotate: (i, target) => target.dataset.finalRot,
    duration: 1,
    stagger: 0.05,
    ease: "power2.out"
}, 0.3);

// Phase 3: Inner Layer (60% - 90%)
lotusTimeline.to("#inner-petals .petal", {
    scale: 1,
    opacity: 1,
    rotate: (i, target) => target.dataset.finalRot,
    duration: 0.8,
    stagger: 0.05,
    ease: "back.out(1.7)"
}, 0.6);

// Phase 4: Core & Glow (90%+)
lotusTimeline.fromTo("#lotus-core",
    { scale: 0, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.5, ease: "bounce.out" },
    0.8
);

lotusTimeline.to("#lotus-svg", {
    filter: "drop-shadow(0 0 50px rgba(138, 43, 226, 0.8))",
    duration: 0.5
}, 0.85);

// Content Reveal Animation
lotusTimeline.to("#headline", { opacity: 1, y: 0, duration: 1 }, 0.4);
lotusTimeline.to("#subtext", { opacity: 0.8, y: 0, duration: 1 }, 0.5);
lotusTimeline.to(".glass-btn-wrapper", { opacity: 1, y: 0, duration: 1 }, 0.6);

// 3. STEM SWAY AMBIENT
gsap.to("#stem", {
    duration: 4,
    attr: { d: "M 250 800 Q 265 600 250 500" },
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
});

gsap.to("#flower-container", {
    duration: 4,
    x: 5,
    rotate: 2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
});

// 4. MOUSE PROXIMITY INTERACTION
document.addEventListener('mousemove', (e) => {
    const lotus = document.getElementById('lotus-svg');
    const rect = lotus.getBoundingClientRect();
    const lX = rect.left + rect.width / 2;
    const lY = rect.top + rect.height / 2;

    const dist = Math.hypot(e.clientX - lX, e.clientY - lY);
    const maxDist = 500;
    const intensity = Math.max(0, 1 - dist / maxDist);

    // Intensify glow on proximity
    gsap.to(lotus, {
        filter: `drop-shadow(0 0 ${30 + intensity * 60}px rgba(138, 43, 226, ${0.4 + intensity * 0.6}))`,
        duration: 0.3
    });
});

// 5. HOVER RIPPLE EFFECT
const lotusWrapper = document.querySelector('.lotus-wrapper');
lotusWrapper.addEventListener('mouseenter', () => {
    gsap.to(".water-ripple", {
        scale: 1.5,
        opacity: 0.5,
        duration: 0.5,
        ease: "power2.out"
    });
});

lotusWrapper.addEventListener('mouseleave', () => {
    gsap.to(".water-ripple", {
        scale: 1,
        opacity: 0.1,
        duration: 0.5,
        ease: "power2.in"
    });
});

// Click Ripples
lotusWrapper.addEventListener('click', () => {
    const ripple = document.createElement('div');
    ripple.className = 'ripple-ring';
    lotusWrapper.appendChild(ripple);

    gsap.fromTo(ripple,
        { scale: 0, opacity: 1, border: '2px solid white' },
        { scale: 4, opacity: 0, duration: 1.5, onComplete: () => ripple.remove() }
    );
});
