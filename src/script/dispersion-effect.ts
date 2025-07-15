interface PhysicsElement {
    x: number;
    y: number;
    vx: number;
    vy: number;
    width: number;
    height: number;
    color: string;
    shape: 'blob' | 'triangle' | 'circle' | 'ring';
    padding: number;
    mass: number;
    isResting: boolean;
    restingTime: number;
    collisionRadius: number;
    visualRadius: number;
    rotation: number;
    rotationSpeed: number;
}

class CanvasPhysics {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private elements: PhysicsElement[] = [];
    private mouse = { x: 0, y: 0 };
    private prevMouse = { x: 0, y: 0 };
    private animationId: number | null = null;
    
    private config = {
        gravity: 0.15,
        friction: 0.94,
        bounce: 0.3,
        mouseForce: 25000,
        mouseRadius: 30,
        mouseVelocityMultiplier: 25,
        elementCount: 300,
        elementSize: 32,
        elementPadding: 8,
        restThreshold: 0.01,
        restTimeThreshold: 30,
        damping: 0.99,
        separationForce: 150000,
        rotationDamping: 0.95,
        maxRotationSpeed: 0.3,
        rotationIntensity: 0.8,
        fallSpeed: 0.4,
        animationSpeed: 30,
        // Настройки масс для разных форм
        massConfig: {
            blob: { min: 0.6, max: 0.65 },
            triangle: { min: 0.5, max: 0.55 },
            circle: { min: 0.4, max: 0.55 },
            ring: { min: 0.4, max: 0.45 }
        },
        // Распределение форм (в процентах)
        shapeDistribution: {
            blob: 40,
            triangle: 25,
            circle: 20,
            ring: 15
        },
        // Цвета с процентами распределения
        colorDistribution: {
            '#CFFF10': 20,
            '#D6E4EC': 15,
            '#A7AAC1': 15,
            '#2B2E3A': 10,
            '#0044FF': 10,
            '#BB2BFF': 10,
            '#FF383C': 10,
            '#1EFF5D': 5,
            '#CAD4DE': 5
        } as Record<string, number>,
        shapes: ['blob', 'triangle', 'circle', 'ring'] as const
    };

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!this.canvas) {
            throw new Error(`Canvas with id "${canvasId}" not found`);
        }
        
        this.ctx = this.canvas.getContext('2d')!;
        this.setupCanvas();
        this.setupEventListeners();
        this.createElements();
        this.startAnimation();
    }

    private setupCanvas() {
        const resizeCanvas = () => {
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    private setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.prevMouse.x = this.mouse.x;
            this.prevMouse.y = this.mouse.y;
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = -1000;
            this.mouse.y = -1000;
            this.prevMouse.x = -1000;
            this.prevMouse.y = -1000;
        });

        this.canvas.addEventListener('mouseenter', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            this.prevMouse.x = this.mouse.x;
            this.prevMouse.y = this.mouse.y;
        });
    }

    private createColorArray(): string[] {
        const colors: string[] = [];
        const totalElements = this.config.elementCount;
        
        Object.entries(this.config.colorDistribution).forEach(([color, percentage]) => {
            const count = Math.round((percentage / 100) * totalElements);
            for (let i = 0; i < count; i++) {
                colors.push(color);
            }
        });
        
        while (colors.length < totalElements) {
            const colorKeys = Object.keys(this.config.colorDistribution);
            const randomColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];
            colors.push(randomColor);
        }
        
        if (colors.length > totalElements) {
            colors.splice(totalElements);
        }
        
        return this.shuffleArray(colors);
    }

    private createShapeArray(): ('blob' | 'triangle' | 'circle' | 'ring')[] {
        const shapes: ('blob' | 'triangle' | 'circle' | 'ring')[] = [];
        const totalElements = this.config.elementCount;
        
        Object.entries(this.config.shapeDistribution).forEach(([shape, percentage]) => {
            const count = Math.round((percentage / 100) * totalElements);
            for (let i = 0; i < count; i++) {
                shapes.push(shape as 'blob' | 'triangle' | 'circle' | 'ring');
            }
        });
        
        while (shapes.length < totalElements) {
            const shapeKeys = Object.keys(this.config.shapeDistribution) as ('blob' | 'triangle' | 'circle' | 'ring')[];
            const randomShape = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
            shapes.push(randomShape);
        }
        
        if (shapes.length > totalElements) {
            shapes.splice(totalElements);
        }
        
        return this.shuffleArray(shapes);
    }

    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    private createElements() {
        this.elements = [];
        
        const colorArray = this.createColorArray();
        const shapeArray = this.createShapeArray();
        
        for (let i = 0; i < this.config.elementCount; i++) {
            const baseRadius = this.config.elementSize / 2;
            const shape = shapeArray[i];
            
            const massRange = this.config.massConfig[shape];
            const mass = massRange.min + Math.random() * (massRange.max - massRange.min);
            
            const centerX = this.canvas.width / 2;
            const spreadRadius = 100;
            
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * spreadRadius;
            const x = centerX + Math.cos(angle) * distance - this.config.elementSize / 2;
            
            const element: PhysicsElement = {
                x: Math.max(0, Math.min(x, this.canvas.width - this.config.elementSize)),
                y: Math.random() * -400 - i * 25,
                vx: (Math.random() - 0.5) * 1,
                vy: 0,
                width: this.config.elementSize,
                height: this.config.elementSize,
                color: colorArray[i],
                shape: shape,
                padding: this.config.elementPadding,
                mass: mass,
                isResting: false,
                restingTime: 0,
                collisionRadius: baseRadius + this.config.elementPadding,
                visualRadius: baseRadius,
                rotation: Math.random() * 0.2 - 0.1,
                rotationSpeed: 0
            };
            
            this.elements.push(element);
        }
    }

    private updatePhysics() {
        this.applyMouseForcesToAllElements();
        
        for (let i = 0; i < this.elements.length; i++) {
            const element = this.elements[i];
            
            if (!element.isResting) {
                const gravityForce = this.config.gravity * element.mass;
                
                element.vy += gravityForce;
                
                const massEffect = 1 / element.mass;
                element.vx *= this.config.friction * (1 - massEffect * 0.1);
                element.vy *= this.config.friction * (1 - massEffect * 0.1);
                element.vx *= this.config.damping;
                element.vy *= this.config.damping;
            } else {
                element.vx *= 0.85;
                element.vy *= 0.85;
                
                if (Math.abs(element.vx) < 0.01) element.vx = 0;
                if (Math.abs(element.vy) < 0.01) element.vy = 0;
            }
            
            element.rotationSpeed *= this.config.rotationDamping;
            
            if (Math.abs(element.rotationSpeed) < 0.002) {
                element.rotationSpeed = 0;
            }
            
            if (element.rotationSpeed !== 0) {
                element.rotation += element.rotationSpeed;
            }
            
            if (Math.abs(element.rotationSpeed) > this.config.maxRotationSpeed) {
                element.rotationSpeed = Math.sign(element.rotationSpeed) * this.config.maxRotationSpeed;
            }
            
            element.x += element.vx * this.config.animationSpeed;
            element.y += element.vy * this.config.animationSpeed;
            
            this.checkBoundaryCollisions(element);
        }
        
        let maxIterations = 15;
        let iteration = 0;
        let hasOverlaps = true;
        
        while (hasOverlaps && iteration < maxIterations) {
            hasOverlaps = this.separateAllElements();
            iteration++;
        }
        
        for (let i = 0; i < this.elements.length; i++) {
            this.updateRestState(this.elements[i]);
        }
    }

    private applyMouseForcesToAllElements() {
        const mouseDistance = Math.sqrt(
            Math.pow(this.mouse.x - this.prevMouse.x, 2) + 
            Math.pow(this.mouse.y - this.prevMouse.y, 2)
        );
        
        const steps = Math.max(1, Math.ceil(mouseDistance / 10));
        
        for (let step = 0; step <= steps; step++) {
            const t = step / steps;
            const interpolatedX = this.prevMouse.x + (this.mouse.x - this.prevMouse.x) * t;
            const interpolatedY = this.prevMouse.y + (this.mouse.y - this.prevMouse.y) * t;
            
            for (const element of this.elements) {
                this.applyMouseForceAtPosition(element, interpolatedX, interpolatedY, t);
            }
        }
    }

    private applyMouseForceAtPosition(element: PhysicsElement, mouseX: number, mouseY: number, interpolationStep: number) {
        const dx = this.getElementCenterX(element) - mouseX;
        const dy = this.getElementCenterY(element) - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.config.mouseRadius && distance > 0) {
            element.isResting = false;
            element.restingTime = 0;
            
            const force = (this.config.mouseRadius - distance) / this.config.mouseRadius;
            
            const baseForceX = (dx / distance) * force * this.config.mouseForce;
            const baseForceY = (dy / distance) * force * this.config.mouseForce;
            
            const mouseVx = this.mouse.x - this.prevMouse.x;
            const mouseVy = this.mouse.y - this.prevMouse.y;
            const mouseSpeed = Math.sqrt(mouseVx * mouseVx + mouseVy * mouseVy);
            
            const velocityForceX = (dx / distance) * mouseSpeed * (this.config.mouseVelocityMultiplier / this.config.animationSpeed);
            const velocityForceY = (dy / distance) * mouseSpeed * (this.config.mouseVelocityMultiplier / this.config.animationSpeed);
            
            // УВЕЛИЧИЛИ силу инерции для более сильного эффекта
            const inertiaForceX = mouseVx * (1.2 / this.config.animationSpeed); // Было 0.4
            const inertiaForceY = mouseVy * (1.2 / this.config.animationSpeed); // Было 0.4
            
            const totalForceX = baseForceX + velocityForceX + inertiaForceX;
            const totalForceY = baseForceY + velocityForceY + inertiaForceY;
            
            // УВЕЛИЧИЛИ множитель близости для более сильного эффекта
            const proximityMultiplier = distance < this.config.mouseRadius * 0.5 ? 4.0 : 1.5; // Было 2.5 : 1
            const interpolationMultiplier = 1 / Math.max(1, Math.ceil(mouseSpeed / (10 * this.config.animationSpeed)));
            const animationCompensation = 1 / this.config.animationSpeed;
            
            element.vx += totalForceX * proximityMultiplier * interpolationMultiplier * animationCompensation;
            element.vy += totalForceY * proximityMultiplier * interpolationMultiplier * animationCompensation;
            
            // УСИЛИЛИ эффект вращения
            if (mouseSpeed > 5) { // Уменьшили порог с 10 до 5
                const tiltForce = force * this.config.rotationIntensity * 0.8; // Увеличили с 0.2 до 0.8
                const direction = (mouseVx * dy - mouseVy * dx) > 0 ? 1 : -1;
                element.rotationSpeed += tiltForce * direction / element.mass;
            }
            
            if (Math.abs(element.rotationSpeed) > this.config.maxRotationSpeed) {
                element.rotationSpeed = Math.sign(element.rotationSpeed) * this.config.maxRotationSpeed;
            }
            
            // УВЕЛИЧИЛИ максимальную скорость для более динамичного движения
            const maxSpeed = (35 / Math.sqrt(element.mass)) / this.config.animationSpeed; // Было 20
            const currentSpeed = Math.sqrt(element.vx * element.vx + element.vy * element.vy);
            if (currentSpeed > maxSpeed) {
                element.vx = (element.vx / currentSpeed) * maxSpeed;
                element.vy = (element.vy / currentSpeed) * maxSpeed;
            }
            
            this.activateNearbyElements(element);
        }
    }

    private separateAllElements(): boolean {
        let hasOverlaps = false;
        
        for (let i = 0; i < this.elements.length; i++) {
            for (let j = i + 1; j < this.elements.length; j++) {
                if (this.separateElements(this.elements[i], this.elements[j])) {
                    hasOverlaps = true;
                }
            }
        }
        
        return hasOverlaps;
    }

    private separateElements(element1: PhysicsElement, element2: PhysicsElement): boolean {
        const dx = this.getElementCenterX(element1) - this.getElementCenterX(element2);
        const dy = this.getElementCenterY(element1) - this.getElementCenterY(element2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const minDistance = element1.collisionRadius + element2.collisionRadius + 2;
        
        if (distance < minDistance) {
            if (distance < 0.1) {
                const angle = Math.random() * Math.PI * 2;
                const separationDistance = minDistance * 0.6;
                
                const totalMass = element1.mass + element2.mass;
                const massRatio1 = element2.mass / totalMass;
                const massRatio2 = element1.mass / totalMass;
                
                element1.x += Math.cos(angle) * separationDistance * massRatio1;
                element1.y += Math.sin(angle) * separationDistance * massRatio1;
                element2.x -= Math.cos(angle) * separationDistance * massRatio2;
                element2.y -= Math.sin(angle) * separationDistance * massRatio2;
            } else {
                const overlap = minDistance - distance;
                const totalMass = element1.mass + element2.mass;
                const massRatio1 = element2.mass / totalMass;
                const massRatio2 = element1.mass / totalMass;
                
                const separationX = (dx / distance) * overlap * 0.6;
                const separationY = (dy / distance) * overlap * 0.6;
                
                element1.x += separationX * massRatio1;
                element1.y += separationY * massRatio1;
                element2.x -= separationX * massRatio2;
                element2.y -= separationY * massRatio2;
                
                if (element1.isResting || element2.isResting) {
                    const additionalForce = overlap * 0.2;
                    const pushX = (dx / distance) * additionalForce;
                    const pushY = (dy / distance) * additionalForce;
                    
                    element1.vx += pushX * massRatio1;
                    element1.vy += pushY * massRatio1;
                    element2.vx -= pushX * massRatio2;
                    element2.vy -= pushY * massRatio2;
                    
                    element1.isResting = false;
                    element2.isResting = false;
                    element1.restingTime = 0;
                    element2.restingTime = 0;
                }
            }
            
            this.constrainElementPosition(element1);
            this.constrainElementPosition(element2);
            
            if (distance > 0.1) {
                const relativeVx = element1.vx - element2.vx;
                const relativeVy = element1.vy - element2.vy;
                const normalDotProduct = relativeVx * (dx / distance) + relativeVy * (dy / distance);
                
                if (normalDotProduct > 0) {
                    const totalMass = element1.mass + element2.mass;
                    const bounceForce = normalDotProduct * this.config.bounce;
                    
                    const impulse1 = bounceForce * (2 * element2.mass / totalMass);
                    const impulse2 = bounceForce * (2 * element1.mass / totalMass);
                    
                    element1.vx -= impulse1 * (dx / distance);
                    element1.vy -= impulse1 * (dy / distance);
                    element2.vx += impulse2 * (dx / distance);
                    element2.vy += impulse2 * (dy / distance);
                    
                    if (bounceForce > 0.1) {
                        const tiltForce = bounceForce * this.config.rotationIntensity * 0.3;
                        element1.rotationSpeed += tiltForce * (Math.random() - 0.5) / element1.mass;
                        element2.rotationSpeed += tiltForce * (Math.random() - 0.5) / element2.mass;
                        
                        element1.rotationSpeed = Math.max(-this.config.maxRotationSpeed, 
                                                          Math.min(this.config.maxRotationSpeed, element1.rotationSpeed));
                        element2.rotationSpeed = Math.max(-this.config.maxRotationSpeed, 
                                                          Math.min(this.config.maxRotationSpeed, element2.rotationSpeed));
                    }
                }
            }
            
            element1.isResting = false;
            element2.isResting = false;
            element1.restingTime = Math.max(0, element1.restingTime - 30);
            element2.restingTime = Math.max(0, element2.restingTime - 30);
            
            return true;
        }
        
        return false;
    }

    private activateNearbyElements(centerElement: PhysicsElement) {
        const activationRadius = centerElement.collisionRadius * 5; // Увеличили с 3 до 5
        
        for (const element of this.elements) {
            if (element === centerElement) continue;
            
            const dx = this.getElementCenterX(element) - this.getElementCenterX(centerElement);
            const dy = this.getElementCenterY(element) - this.getElementCenterY(centerElement);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < activationRadius) {
                element.isResting = false;
                element.restingTime = Math.max(0, element.restingTime - 90); // Увеличили с 60 до 90
                
                if (distance < activationRadius * 0.7) {
                    const force = ((activationRadius - distance) / activationRadius * 8) / this.config.animationSpeed; // Увеличили с 3 до 8
                    
                    element.vx += (dx / distance) * force;
                    element.vy += (dy / distance) * force;
                }
            }
        }
    }

    private getElementCenterX(element: PhysicsElement): number {
        return element.x + element.width / 2;
    }

    private getElementCenterY(element: PhysicsElement): number {
        return element.y + element.height / 2;
    }

    private constrainElementPosition(element: PhysicsElement) {
        const centerX = this.getElementCenterX(element);
        const centerY = this.getElementCenterY(element);
        
        if (centerX < element.collisionRadius) {
            element.x = element.collisionRadius - element.width / 2;
        } else if (centerX > this.canvas.width - element.collisionRadius) {
            element.x = this.canvas.width - element.collisionRadius - element.width / 2;
        }
        
        if (centerY < element.collisionRadius) {
            element.y = element.collisionRadius - element.height / 2;
        } else if (centerY > this.canvas.height - element.collisionRadius) {
            element.y = this.canvas.height - element.collisionRadius - element.height / 2;
        }
    }

    private updateRestState(element: PhysicsElement) {
        const speed = Math.sqrt(element.vx * element.vx + element.vy * element.vy);
        const isNearBottom = element.y >= this.canvas.height - element.height - 30;
        
        const massAdjustedThreshold = this.config.restThreshold * (1 + element.mass * 0.2);
        
        let hasOverlap = false;
        for (const otherElement of this.elements) {
            if (otherElement === element) continue;
            
            const dx = this.getElementCenterX(element) - this.getElementCenterX(otherElement);
            const dy = this.getElementCenterY(element) - this.getElementCenterY(otherElement);
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = element.collisionRadius + otherElement.collisionRadius + 1;
            
            if (distance < minDistance) {
                hasOverlap = true;
                break;
            }
        }
        
        if (speed < massAdjustedThreshold && 
            isNearBottom && 
            Math.abs(element.vx) < 0.02 && 
            Math.abs(element.vy) < 0.02 &&
            !hasOverlap) {
            
            element.restingTime++;
            
            if (element.restingTime > this.config.restTimeThreshold) {
                element.isResting = true;
            }
        } else {
            element.restingTime = 0;
            element.isResting = false;
        }
    }

    private checkBoundaryCollisions(element: PhysicsElement) {
        const centerX = this.getElementCenterX(element);
        const centerY = this.getElementCenterY(element);
        
        if (centerX <= element.collisionRadius) {
            element.x = element.collisionRadius - element.width / 2;
            element.vx = Math.abs(element.vx) * this.config.bounce * (1 / element.mass);
        } else if (centerX >= this.canvas.width - element.collisionRadius) {
            element.x = this.canvas.width - element.collisionRadius - element.width / 2;
            element.vx = -Math.abs(element.vx) * this.config.bounce * (1 / element.mass);
        }
        
        if (centerY <= element.collisionRadius) {
            element.y = element.collisionRadius - element.height / 2;
            element.vy = Math.abs(element.vy) * this.config.bounce * (1 / element.mass);
        } else if (centerY >= this.canvas.height - element.collisionRadius) {
            element.y = this.canvas.height - element.collisionRadius - element.height / 2;
            element.vy = -Math.abs(element.vy) * this.config.bounce * (1 / element.mass);
            
            if (Math.abs(element.vy) < this.config.restThreshold * 2) {
                element.vy = 0;
            }
        }
    }

    private drawElement(element: PhysicsElement) {
        this.ctx.save();
        
        const centerX = this.getElementCenterX(element);
        const centerY = this.getElementCenterY(element);
        
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(element.rotation);
        
        this.ctx.fillStyle = element.color;
        
        const massOpacity = Math.min(1, 0.6 + element.mass * 0.2);
        if (element.isResting) {
            this.ctx.globalAlpha = massOpacity * 0.8;
        } else {
            this.ctx.globalAlpha = massOpacity;
        }
        
        if (element.shape === 'blob') {
            this.drawBlob(element.visualRadius);
        } else if (element.shape === 'triangle') {
            this.drawTriangle(element.visualRadius);
        } else if (element.shape === 'circle') {
            this.drawCircle(element.visualRadius);
        } else if (element.shape === 'ring') {
            this.drawRing(element.visualRadius);
        }
        
        this.ctx.restore();
    }

    private drawBlob(size: number) {
        const scale = size / 20;
        
        this.ctx.beginPath();
        
        this.ctx.moveTo(10.1352 * scale - size, 5.20101 * scale - size);
        
        this.ctx.bezierCurveTo(
            17.1682 * scale - size, -1.09557 * scale - size,
            27.9739 * scale - size, -0.49861 * scale - size,
            34.2705 * scale - size, 6.53435 * scale - size
        );
        
        this.ctx.bezierCurveTo(
            40.5671 * scale - size, 13.5673 * scale - size,
            39.9701 * scale - size, 24.373 * scale - size,
            32.9371 * scale - size, 30.6696 * scale - size
        );
        
        this.ctx.lineTo(24.8078 * scale - size, 37.9478 * scale - size);
        
        this.ctx.bezierCurveTo(
            22.5954 * scale - size, 39.9285 * scale - size,
            19.1962 * scale - size, 39.7407 * scale - size,
            17.2155 * scale - size, 37.5284 * scale - size
        );
        
        this.ctx.lineTo(1.58642 * scale - size, 20.0714 * scale - size);
        
        this.ctx.bezierCurveTo(
            -0.394288 * scale - size, 17.8591 * scale - size,
            -0.206501 * scale - size, 14.4599 * scale - size,
            2.00585 * scale - size, 12.4792 * scale - size
        );
        
        this.ctx.closePath();
        this.ctx.fill();
    }

    private drawTriangle(size: number) {
        const scale = size / 16;
        
        this.ctx.beginPath();
        
        this.ctx.moveTo(4.59681 * scale - size, 3.14075 * scale - size);
        
        this.ctx.bezierCurveTo(
            4.95061 * scale - size, 1.36365 * scale - size,
            6.787 * scale - size, 0.303406 * scale - size,
            8.50291 * scale - size, 0.885558 * scale - size
        );
        
        this.ctx.lineTo(29.112 * scale - size, 7.87754 * scale - size);
        
        this.ctx.bezierCurveTo(
            31.5545 * scale - size, 8.70622 * scale - size,
            31.8819 * scale - size, 12.0269 * scale - size,
            29.6481 * scale - size, 13.3166 * scale - size
        );
        
        this.ctx.lineTo(4.78978 * scale - size, 27.6685 * scale - size);
        
        this.ctx.bezierCurveTo(
            2.55604 * scale - size, 28.9582 * scale - size,
            -0.156095 * scale - size, 27.0144 * scale - size,
            0.347524 * scale - size, 24.4847 * scale - size
        );
        
        this.ctx.lineTo(4.59681 * scale - size, 3.14075 * scale - size);
        
        this.ctx.closePath();
        this.ctx.fill();
    }

    private drawCircle(size: number) {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size, 0, Math.PI * 2);
        this.ctx.fill();
    }

    private drawRing(size: number) {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size * 0.466, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    private render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (const element of this.elements) {
            this.drawElement(element);
        }
    }

    private startAnimation() {
        const animate = () => {
            this.updatePhysics();
            this.render();
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }

    public updateConfig(newConfig: Partial<typeof this.config>) {
        this.config = { ...this.config, ...newConfig };
    }

    public updateColorDistribution(newDistribution: Record<string, number>) {
        const totalPercentage = Object.values(newDistribution).reduce((sum, percent) => sum + percent, 0);
        if (Math.abs(totalPercentage - 100) > 0.1) {
            console.warn(`Сумма процентов должна быть 100%, текущая: ${totalPercentage}%`);
        }
        
        this.config.colorDistribution = newDistribution;
        this.createElements();
    }

    public updateShapeDistribution(newDistribution: Record<'blob' | 'triangle' | 'circle' | 'ring', number>) {
        const totalPercentage = Object.values(newDistribution).reduce((sum, percent) => sum + percent, 0);
        if (Math.abs(totalPercentage - 100) > 0.1) {
            console.warn(`Сумма процентов должна быть 100%, текущая: ${totalPercentage}%`);
        }
        
        this.config.shapeDistribution = newDistribution;
        this.createElements();
    }

    public reset() {
        this.createElements();
    }

    public destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Инициализация
const canvasPhysics = new CanvasPhysics('scene');

// Настройки для максимально сильного расталкивания
canvasPhysics.updateConfig({
    gravity: 0.16,              
    fallSpeed: 0.4,            
    friction: 0.94,            
    bounce: 0.3,               
    mouseForce: 2500,          
    mouseRadius: 150,          
    mouseVelocityMultiplier: 25, 
    elementCount: 250,
    elementSize: 32,
    elementPadding: 8,         
    restThreshold: 0.01,       
    restTimeThreshold: 30,     
    separationForce: 150000,   
    rotationDamping: 0.95,     
    maxRotationSpeed: 0.3,     
    rotationIntensity: 0.8,    
    animationSpeed: 30.0       
});

// Настройка распределения цветов
canvasPhysics.updateColorDistribution({
    '#CFFF10': 8,
    '#D6E4EC': 17,
    '#A7AAC1': 17,
    '#2B2E3A': 15,
    '#0044FF': 5,
    '#BB2BFF': 2,
    '#FF383C': 5,
    '#1EFF5D': 1,
    '#CAD4DE': 25
});

// Настройка распределения форм
canvasPhysics.updateShapeDistribution({
    blob: 35,
    triangle: 25,
    circle: 25,
    ring: 15
});

(window as any).canvasPhysics = canvasPhysics;