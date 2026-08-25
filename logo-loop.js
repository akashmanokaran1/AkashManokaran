// logo-loop.js
export class LogoLoop {
    constructor(container, options = {}) {
        if (!container) return;
        this.container = container;
        this.logos = options.logos || [];
        this.speed = options.speed || 100;
        this.direction = options.direction || 'left';
        this.logoHeight = options.logoHeight || 28;
        this.gap = options.gap || 32;
        this.pauseOnHover = options.pauseOnHover !== undefined ? options.pauseOnHover : true;
        this.hoverSpeed = options.hoverSpeed;
        this.fadeOut = options.fadeOut || false;
        this.fadeOutColor = options.fadeOutColor || 'black';
        this.scaleOnHover = options.scaleOnHover || false;

        this.SMOOTH_TAU = 0.25;
        this.COPY_HEADROOM = 2;

        this.offset = 0;
        this.velocity = 0;
        this.targetVelocity = 0;
        this.isHovered = false;
        this.seqSize = 0;
        this.lastTimestamp = null;
        this.rafId = null;
        this.lists = [];

        this.init();
    }

    init() {
        const isVertical = this.direction === 'up' || this.direction === 'down';
        
        // Setup Container
        this.container.classList.add('logoloop');
        this.container.classList.add(isVertical ? 'logoloop--vertical' : 'logoloop--horizontal');
        if (this.fadeOut) this.container.classList.add('logoloop--fade');
        if (this.scaleOnHover) this.container.classList.add('logoloop--scale-hover');

        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        this.container.style.display = 'flex';
        
        if (isVertical) {
            this.container.style.flexDirection = 'column';
            this.container.style.height = '100%';
        }

        // Apply CSS Variables
        this.container.style.setProperty('--logoloop-gap', `${this.gap}px`);
        this.container.style.setProperty('--logoloop-logoHeight', `${this.logoHeight}px`);
        
        const magnitude = Math.abs(this.speed);
        const dir = (this.direction === 'left' || this.direction === 'up') ? 1 : -1;
        this.targetVelocity = magnitude * dir;

        // Track Element
        this.track = document.createElement('div');
        this.track.className = 'logoloop__track';
        this.track.style.display = 'flex';
        this.track.style.gap = 'var(--logoloop-gap)';
        this.track.style.flexDirection = isVertical ? 'column' : 'row';
        this.track.style.willChange = 'transform';
        this.container.appendChild(this.track);

        // Events
        this.container.addEventListener('mouseenter', () => this.isHovered = true);
        this.container.addEventListener('mouseleave', () => this.isHovered = false);

        // Start Logic
        this.resizeObserver = new ResizeObserver(() => this.updateDimensions());
        this.resizeObserver.observe(this.container);

        this.updateDimensions();
        this.rafId = requestAnimationFrame((time) => this.animate(time));
    }

    createList(isHidden = false) {
        const list = document.createElement('ul');
        list.className = 'logoloop__list';
        list.style.display = 'flex';
        list.style.flexShrink = '0';
        list.style.listStyle = 'none';
        list.style.margin = '0';
        list.style.padding = '0';
        list.style.gap = 'var(--logoloop-gap)';
        list.style.flexDirection = (this.direction === 'up' || this.direction === 'down') ? 'column' : 'row';
        list.style.alignItems = 'center';

        if (isHidden) list.setAttribute('aria-hidden', 'true');

        this.logos.forEach(logo => {
            const item = document.createElement('li');
            item.className = 'logoloop__item';
            
            const content = document.createElement('span');
            content.className = 'logoloop__node';
            content.style.whiteSpace = 'nowrap';
            content.textContent = typeof logo === 'string' ? logo : (logo.title || logo.alt);

            if (typeof logo === 'object' && logo.href) {
                const link = document.createElement('a');
                link.href = logo.href;
                link.appendChild(content);
                item.appendChild(link);
            } else {
                item.appendChild(content);
            }
            list.appendChild(item);
        });

        return list;
    }

    updateDimensions() {
        if (this.lists.length === 0) {
            const firstList = this.createList(false);
            this.track.appendChild(firstList);
            this.lists.push(firstList);
        }

        const isVertical = this.direction === 'up' || this.direction === 'down';
        const rect = this.lists[0].getBoundingClientRect();
        
        // Critical Fix: Account for the Gap in the total sequence size
        this.seqSize = (isVertical ? rect.height : rect.width) + this.gap;

        if (this.seqSize <= this.gap) return; // Prevent division by zero

        const containerDim = isVertical ? this.container.offsetHeight : this.container.offsetWidth;
        const needed = Math.ceil(containerDim / this.seqSize) + this.COPY_HEADROOM;

        while (this.lists.length < needed) {
            const newList = this.createList(true);
            this.track.appendChild(newList);
            this.lists.push(newList);
        }
    }

    animate(time) {
        if (!this.lastTimestamp) {
            this.lastTimestamp = time;
            this.rafId = requestAnimationFrame((t) => this.animate(t));
            return;
        }

        let delta = (time - this.lastTimestamp) / 1000;
        this.lastTimestamp = time;

        // Fix: Prevent large jumps when switching tabs
        if (delta > 0.1) delta = 0.016; 

        const isVertical = this.direction === 'up' || this.direction === 'down';
        const target = this.isHovered
            ? (this.hoverSpeed ?? (this.pauseOnHover ? 0 : this.targetVelocity))
            : this.targetVelocity;

        const easing = 1 - Math.exp(-delta / this.SMOOTH_TAU);
        this.velocity += (target - this.velocity) * easing;

        if (this.seqSize > 0) {
            this.offset = (this.offset + this.velocity * delta) % this.seqSize;
            if (this.offset < 0) this.offset += this.seqSize;

            // Use 3D transform for hardware acceleration
            const x = isVertical ? 0 : -this.offset;
            const y = isVertical ? -this.offset : 0;
            this.track.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }

        this.rafId = requestAnimationFrame((t) => this.animate(t));
    }

    stop() {
        if (this.rafId) cancelAnimationFrame(this.rafId);
        if (this.resizeObserver) this.resizeObserver.disconnect();
    }
}