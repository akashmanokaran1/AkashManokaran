/**
 * Cinematic Dark Mode / Neo-Brutalist Landing Page Logic
 * Features: Three.js Particle System, GSAP Animation Timeline, Cinematic Scroll-Trigger Simulation
 */

class CinematicExperience {
    constructor() {
        this.container = document.getElementById('cinematic-container');
        this.canvas = document.getElementById('cinematic-canvas');

        if (!this.container || !this.canvas) return;

        // Initialize Three.js
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.particles = null;
        this.particleCount = 50000;
        this.clock = new THREE.Clock();

        // State
        this.isLoaded = false;

        this.init();
    }

    async init() {
        this.createParticles();
        this.setupLights();
        this.camera.position.z = 2; // Start close

        // Wait for fonts/resources
        await document.fonts.ready;

        this.isLoaded = true;
        this.container.style.visibility = 'visible';

        this.createTimeline();
        this.animate();

        window.addEventListener('resize', () => this.onResize());
    }

    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);
        const sizes = new Float32Array(this.particleCount);

        const colorPalette = [
            new THREE.Color(0xff00ff), // Magenta
            new THREE.Color(0x8a2be2), // BlueViolet
            new THREE.Color(0x4b0082), // Indigo
            new THREE.Color(0xffffff)  // White accents
        ];

        for (let i = 0; i < this.particleCount; i++) {
            // Initial position: tightly packed core
            positions[i * 3] = (Math.random() - 0.5) * 0.1;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;

            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            sizes[i] = Math.random() * 2;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.005,
            vertexColors: true,
            transparent: true,
            opacity: 0, // Start invisible
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        // Background "Cosmic Dust"
        const dustGeometry = new THREE.BufferGeometry();
        const dustPositions = new Float32Array(10000 * 3);
        for (let i = 0; i < 30000; i++) {
            dustPositions[i] = (Math.random() - 0.5) * 10;
        }
        dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
        const dustMaterial = new THREE.PointsMaterial({
            size: 0.001,
            color: 0x444444,
            transparent: true,
            opacity: 0.2
        });
        const dust = new THREE.Points(dustGeometry, dustMaterial);
        this.scene.add(dust);
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
    }

    createTimeline() {
        const tl = gsap.timeline();

        // 0:00 - 0:01 Fade in
        tl.to(this.container, { opacity: 1, duration: 1 });

        // Fade in dust (cosmic noise)
        const dust = this.scene.children.find(child => child.material && child.material.size === 0.001);
        if (dust) {
            dust.material.opacity = 0;
            tl.to(dust.material, { opacity: 0.2, duration: 3 }, 0.5);
        }

        // 0:01 - 0:05 Explosion & Camera Pullback
        tl.to(this.particles.material, {
            opacity: 1,
            duration: 2,
            ease: "power2.inOut"
        }, 1);

        // Explode particles outward
        const positions = this.particles.geometry.attributes.position.array;
        const targetPositions = new Float32Array(positions.length);
        for (let i = 0; i < positions.length; i += 3) {
            const angle1 = Math.random() * Math.PI * 2;
            const angle2 = Math.random() * Math.PI * 2;
            const radius = 1 + Math.random() * 2;

            targetPositions[i] = Math.cos(angle1) * Math.sin(angle2) * radius;
            targetPositions[i + 1] = Math.sin(angle1) * Math.sin(angle2) * radius;
            targetPositions[i + 2] = Math.cos(angle2) * radius;
        }

        tl.to(positions, {
            endArray: targetPositions,
            duration: 4,
            ease: "power4.out",
            onUpdate: () => {
                this.particles.geometry.attributes.position.needsUpdate = true;
            }
        }, 1);

        // Camera pull back
        tl.to(this.camera.position, {
            z: 8,
            duration: 10,
            ease: "none"
        }, 0);

        // Scene Text 1 (0:03): BORN OF NATURE
        tl.fromTo('.text-born-of-nature',
            { opacity: 0, x: -50, filter: 'blur(10px)' },
            { opacity: 1, x: 0, filter: 'blur(0px)', duration: 2, ease: "power2.out" },
            3
        );

        // Scene Text 2 (0:05): THE NEXUS OF EXISTENCE
        tl.fromTo('.text-nexus',
            { opacity: 0, y: 50, filter: 'blur(10px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 2, ease: "power2.out" },
            5
        );

        // Scene Text 3 (0:07): BORN OF MYTH
        tl.fromTo('.text-born-of-myth',
            { opacity: 0, scale: 0.8, filter: 'blur(20px)' },
            { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 3, ease: "power3.out" },
            7
        );

        // Reveal scroll indicator
        tl.to('#cinematic-scroll-indicator', { opacity: 0.5, duration: 1 }, 9);

        // Link to main content - optional: hide this cinematic container when scrolling down
        this.setupScrollLink(tl);
    }

    setupScrollLink(timeline) {
        // Here you could add logic to hide the cinematic container 
        // once the user starts scrolling or after the animation ends.
        window.addEventListener('wheel', (e) => {
            if (e.deltaY > 50 && timeline.progress() > 0.9) {
                gsap.to(this.container, {
                    y: '-100%',
                    duration: 1.5,
                    ease: "power4.inOut",
                    onComplete: () => {
                        this.container.style.display = 'none';
                    }
                });
            }
        });
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const elapsedTime = this.clock.getElapsedTime();

        if (this.particles) {
            this.particles.rotation.y = elapsedTime * 0.05;
            this.particles.rotation.z = elapsedTime * 0.03;

            // Subtle pulse
            const pulse = 1 + Math.sin(elapsedTime * 2) * 0.1;
            this.particles.scale.set(pulse, pulse, pulse);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Initializing when libraries are ready
window.addEventListener('load', () => {
    if (typeof THREE !== 'undefined' && typeof gsap !== 'undefined') {
        new CinematicExperience();
    } else {
        console.error('Three.js or GSAP not loaded');
    }
});
