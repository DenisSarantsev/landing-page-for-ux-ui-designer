interface PhysicsElement {
    x: number;
    y: number;
    vx: number;
    vy: number;
    width: number;
    height: number;
    color: string;
		shape: 'blob' | 'triangle' | 'circle' | 'ring' | 'star' | 'square' | 'hexagon' | 'ellipse' | 'rectangle' | 'polygon' | 'diamond';
    padding: number;
    mass: number;
    isResting: boolean;
    restingTime: number;
    collisionRadius: number;
    visualRadius: number;
    rotation: number;
    rotationSpeed: number;
    initialY: number;

		inertiaVx?: number;
    inertiaVy?: number;
    inertiaTime?: number;
		protectedRadius?: number;
    // Плавное отображаемое положение центра (для мягкого снапа к half‑pixel)
    drawX?: number;
    drawY?: number;
}

class CanvasPhysics {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private elements: PhysicsElement[] = [];
    private mouse = { x: 0, y: 0 };
    private prevMouse = { x: 0, y: 0 };
    private animationId: number | null = null;
    private isAnimationStarted = false;
    private scrollListener: (() => void) | null = null;
    private globalMouseListener: ((e: MouseEvent) => void) | null = null;
		private dynamicCursorRadius: number = 50;
		private mouseDirection: { x: number, y: number } = { x: 0, y: 0 };
		private mouseSpeed: number = 0;
		private mouseIdleTimeout: number | null = null;
		private pixelRatio = window.devicePixelRatio || 1;
    private get logicalWidth() { return this.canvas.width / this.pixelRatio; }
    private get logicalHeight() { return this.canvas.height / this.pixelRatio; }
    
    private config = {
        gravity: 0.1,
        friction: 0.15,
        bounce: 0.008,
        mouseForce: 10000,
        mouseRadius: 30,
        mouseVelocityMultiplier: 25,
        elementCount: 250,
        elementSize: 32,
        elementPadding: 20,
        restThreshold: 0.01,
        restTimeThreshold: 30,
        damping: 0.99,
        separationForce: 6,
        rotationDamping: 0.95,
        maxRotationSpeed: 0.3,
        rotationIntensity: 0.8,
        fallSpeed: 0.5,
        animationSpeed: 7,
        footerVisibilityThreshold: 60,
				collisionDamping: 0.2, // сильное демпфирование

				cursorEffectRadius: 20,          // радиус действия курсора
				cursorRepelStrength: 3,        // сила расталкивания
				cursorAttractStrength: 0.001,  // сила притягивания элементов за курсором
				cursorBaseForce: 25,           // базовая сила воздействия
				cursorSpeedMultiplier: 2,      // коэффициент умножения силы от скорости
				cursorFarEffect: 0.01,           // сила покачивания для дальних элементов
				cursorFarFalloff: 120,           // скорость затухания силы по расстоянию
				inertiaMultiplier: 1.6,
				minElementDistance: 4, // Минимальная дистанция между элементами
        defaultMinElementDistance: 4, // базовое значение для сброса вне мобилки
                protectedRadius: 5, // базовый защищённый радиус (добавочный буфер)
                defaultProtectedRadius: 5,
                collisionScale: 1, // множитель для расчетного collisionRadius ( <1 позволит ближе )
                defaultCollisionScale: 1,
        
        // АДАПТИВНЫЕ НАСТРОЙКИ
        adaptiveSettings: {
            mobile: {
                maxWidth: 480,
                elementCount: 80,
                elementSize: 28, // +50% к прежним 28
                mouseRadius: 80,
                mouseForce: 1500,
                elementPadding: 10,
                minElementDistance: 1, // еще меньше
                protectedRadius: 2, // убираем дополнительный буфер
                collisionScale: 0.95 // уменьшаем физический радиус для плотности (визуально почти соприкасаются)
            },
            tablet: {
                maxWidth: 768,
                elementCount: 100,
                elementSize: 35,
                mouseRadius: 100,
                mouseForce: 2000,
								elementPadding: 0,
								minElementDistance: 1, // еще меньше
                protectedRadius: 2, // убираем дополнительный буфер
                collisionScale: 0.95 
            },
            laptop: {
                maxWidth: 1024,
                elementCount: 130,
                elementSize: 35,
                mouseRadius: 120,
                mouseForce: 2200,
								protectedRadius: 2,
            },
            desktop: {
                maxWidth: 1440,
                elementCount: 170,
                elementSize: 38,
                mouseRadius: 150,
                mouseForce: 2500,
								protectedRadius: 2,
            },
            large: {
                maxWidth: Infinity,
                elementCount: 220,
                elementSize: 40,
                mouseRadius: 180,
                mouseForce: 3000,
								protectedRadius: 2,
            }
        },
        
        // Настройки масс для разных форм
        massConfig: {
					blob: { min: 0.6, max: 0.65 },
					triangle: { min: 0.5, max: 0.55 },
					circle: { min: 0.4, max: 0.55 },
					ring: { min: 0.4, max: 0.45 },
					star: { min: 0.45, max: 0.5 },
					square: { min: 0.55, max: 0.6 },
					hexagon: { min: 0.5, max: 0.55 },
					ellipse: { min: 0.4, max: 0.5 },
					rectangle: { min: 0.6, max: 0.7 },
					polygon: { min: 0.5, max: 0.6 },
					diamond: { min: 0.45, max: 0.55 }
        },
        
        // Распределение форм (в процентах)
        shapeDistribution: {
					blob: 14,        // Уменьшено 
					triangle: 11,    // Уменьшено
					circle: 11,      // Уменьшено
					ring: 11,        // Уменьшено
					star: 11,        // Уменьшено
					square: 7,       // Уменьшено
					hexagon: 7,      // Уменьшено
					ellipse: 6,      // Уменьшено
					rectangle: 6,    // Уменьшено
					polygon: 6,      // Уменьшено
					diamond: 10      // Новая фигура
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
			shapes: ['blob', 'triangle', 'circle', 'ring', 'star', 'square', 'hexagon', 'ellipse', 'rectangle', 'polygon', 'diamond'] as const
    };

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!this.canvas) {
            throw new Error(`Canvas with id "${canvasId}" not found`);
        }
        
        this.ctx = this.canvas.getContext('2d')!;
        this.setupCanvas();
        this.setupEventListeners();
        this.setupScrollListener();
        
        this.applyAdaptiveSettings();
        this.createElements();
        this.startAnimation();
    }

    private getAdaptiveSettings() {
        const screenWidth = window.innerWidth;
        const settings = this.config.adaptiveSettings;
        
        if (screenWidth <= settings.mobile.maxWidth) {
            return settings.mobile;
        } else if (screenWidth <= settings.tablet.maxWidth) {
            return settings.tablet;
        } else if (screenWidth <= settings.laptop.maxWidth) {
            return settings.laptop;
        } else if (screenWidth <= settings.desktop.maxWidth) {
            return settings.desktop;
        } else {
            return settings.large;
        }
    }

    private applyAdaptiveSettings() {
        const adaptiveSettings = this.getAdaptiveSettings();
        
        this.config.elementCount = adaptiveSettings.elementCount;
        this.config.elementSize = adaptiveSettings.elementSize;
        this.config.mouseRadius = adaptiveSettings.mouseRadius;
        this.config.mouseForce = adaptiveSettings.mouseForce;
        // Применяем уменьшенную дистанцию и отступы только для мобилки
    const a: any = adaptiveSettings;
    this.config.minElementDistance = a.minElementDistance !== undefined ? a.minElementDistance : this.config.defaultMinElementDistance;
    if (a.elementPadding !== undefined) this.config.elementPadding = a.elementPadding;
    this.config.protectedRadius = a.protectedRadius !== undefined ? a.protectedRadius : this.config.defaultProtectedRadius;
    this.config.collisionScale = a.collisionScale !== undefined ? a.collisionScale : this.config.defaultCollisionScale;
    }

    private setupScrollListener() {
        this.scrollListener = () => {
            const footer = document.querySelector('footer');
            if (!footer || this.isAnimationStarted) return;

            const footerRect = footer.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            const visibleHeight = Math.max(0, Math.min(footerRect.height, windowHeight - footerRect.top));
            const visibilityPercentage = (visibleHeight / footerRect.height) * 100;
            
            if (visibilityPercentage >= this.config.footerVisibilityThreshold) {
                this.startElementsFalling();
            }
        };

        window.addEventListener('scroll', this.scrollListener);
        
        setTimeout(() => {
            if (this.scrollListener) {
                this.scrollListener();
            }
        }, 100);
    }

    private startElementsFalling() {
        if (this.isAnimationStarted) return;
        
        this.isAnimationStarted = true;
        
        this.elements.forEach((element) => {
            element.y = element.initialY;
            element.vx = (Math.random() - 0.5) * 1;
            element.vy = 0;
            element.isResting = false;
            element.restingTime = 0;
            // Синхронизируем сглаженные координаты
            element.drawX = element.x + element.width / 2;
            element.drawY = element.y + element.height / 2;
        });

        if (this.scrollListener) {
            window.removeEventListener('scroll', this.scrollListener);
            this.scrollListener = null;
        }
    }

		private setupCanvas() {
    const resizeCanvas = () => {
        const vv = (window as any).visualViewport;
        // Ширина без полосы прокрутки
        const cssW = vv ? vv.width : document.documentElement.clientWidth;
        const cssH = vv ? vv.height : window.innerHeight;

        this.pixelRatio = window.devicePixelRatio || 1;

        this.canvas.width  = Math.round(cssW * this.pixelRatio);
        this.canvas.height = Math.round(cssH * this.pixelRatio);

        // CSS размеры (не 100vw — чтобы не захватить скроллбар)
        this.canvas.style.width  = cssW + 'px';
        this.canvas.style.height = cssH + 'px';

        this.ctx.setTransform(1,0,0,1,0,0);
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
        this.ctx.imageSmoothingEnabled = true;

        const prevCount = this.config.elementCount;
        this.applyAdaptiveSettings();
        if (prevCount !== this.config.elementCount || this.elements.length === 0) {
            this.createElements();
        }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('orientationchange', resizeCanvas, { passive: true });
    const vv = (window as any).visualViewport;
    if (vv) {
        vv.addEventListener('resize', resizeCanvas, { passive: true });
        vv.addEventListener('scroll', resizeCanvas, { passive: true }); // iOS адресная строка
    }
}

    private setupEventListeners() {
        // Единый обработчик движения
        const updateMouse = (e: MouseEvent) => {
            const rect = this.canvas.getBoundingClientRect();
            this.prevMouse.x = this.mouse.x;
            this.prevMouse.y = this.mouse.y;
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            const dx = this.mouse.x - this.prevMouse.x;
            const dy = this.mouse.y - this.prevMouse.y;
            const len = Math.hypot(dx, dy);
            if (len > 0) {
                this.mouseDirection.x = dx / len;
                this.mouseDirection.y = dy / len;
            }
            this.mouseSpeed = len;
            if (this.mouseIdleTimeout) clearTimeout(this.mouseIdleTimeout);
            this.mouseIdleTimeout = window.setTimeout(() => { this.mouseSpeed = 0; }, 100);
            this.dynamicCursorRadius = this.mouseSpeed * 2;
        };

        this.globalMouseListener = updateMouse;
        document.addEventListener('mousemove', updateMouse, { passive: true });

        const resetMouse = () => {
            this.mouse.x = this.mouse.y = -1000;
            this.prevMouse.x = this.prevMouse.y = -1000;
            this.mouseSpeed = 0;
        };
        document.addEventListener('mouseleave', resetMouse, { passive: true });
        document.addEventListener('mouseenter', updateMouse, { passive: true });
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

    private createShapeArray(): ('blob' | 'triangle' | 'circle' | 'ring' | 'star' | 'square' | 'hexagon' | 'ellipse' | 'rectangle' | 'polygon' | 'diamond')[] {
        const shapes: ('blob' | 'triangle' | 'circle' | 'ring' | 'star' | 'square' | 'hexagon' | 'ellipse' | 'rectangle' | 'polygon' | 'diamond')[] = [];
        const totalElements = this.config.elementCount;
        
        Object.entries(this.config.shapeDistribution).forEach(([shape, percentage]) => {
            const count = Math.round((percentage / 100) * totalElements);
            for (let i = 0; i < count; i++) {
                shapes.push(shape as 'blob' | 'triangle' | 'circle' | 'ring' | 'star' | 'square' | 'hexagon' | 'ellipse' | 'rectangle' | 'polygon' | 'diamond');
            }
        });
        
        while (shapes.length < totalElements) {
            const shapeKeys = Object.keys(this.config.shapeDistribution) as ('blob' | 'triangle' | 'circle' | 'ring' | 'star' | 'square' | 'hexagon' | 'ellipse' | 'rectangle' | 'polygon' | 'diamond')[];
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
            
            const lw = this.logicalWidth;
            const centerX = lw / 2;
            const spreadRadius = Math.min(150, lw / 8);
            
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * spreadRadius;
            const x = centerX + Math.cos(angle) * distance - this.config.elementSize / 2;
            
            const baseOffset = Math.min(400, this.canvas.height / 3);
            const elementOffset = Math.min(25, this.config.elementSize);
            const initialY = Math.random() * -baseOffset - i * (elementOffset / 4);
            
            const element: PhysicsElement = {
                x: Math.max(0, Math.min(x, lw - this.config.elementSize)),
                y: initialY,
                initialY: initialY,
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
                collisionRadius: (baseRadius + this.config.elementPadding) * (this.config.collisionScale || 1),
                visualRadius: baseRadius,
                rotation: Math.random() * 0.2 - 0.1,
                rotationSpeed: 0
            };

            element.protectedRadius = this.config.protectedRadius ?? 5;
            // Инициализируем сглаженные координаты центров
            element.drawX = element.x + element.width / 2;
            element.drawY = element.y + element.height / 2;
            
            this.elements.push(element);
        }
    }

private updatePhysics() {
    if (!this.isAnimationStarted) return;

    this.applyMouseForcesToAllElements();
    const inertiaDuration = 100;

    for (let i = 0; i < this.elements.length; i++) {
        const element = this.elements[i];

        // Инерция
        if (element.inertiaTime) {
            const elapsed = Date.now() - element.inertiaTime;
            if (elapsed < inertiaDuration) {
                const fade = 1 - (elapsed / inertiaDuration);
                element.vx = (element.inertiaVx || 0) * fade;
                element.vy = (element.inertiaVy || 0) * fade;
            } else {
                element.inertiaVx = 0;
                element.inertiaVy = 0;
                element.inertiaTime = undefined;
            }
        }

        // (Было ДВА раза обновление позиции — оставляем один)
        element.x += element.vx * this.config.animationSpeed;
        element.y += element.vy * this.config.animationSpeed;

        this.checkBoundaryCollisions(element);

        if (!element.isResting) {
            const g = this.config.gravity * element.mass;
            element.vy += g;

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
        if (Math.abs(element.rotationSpeed) < 0.002) element.rotationSpeed = 0;
        if (element.rotationSpeed) {
            element.rotation += element.rotationSpeed;
            if (Math.abs(element.rotationSpeed) > this.config.maxRotationSpeed) {
                element.rotationSpeed = Math.sign(element.rotationSpeed) * this.config.maxRotationSpeed;
            }
        }

        // Замедление внизу
    const bottomEdge = this.logicalHeight - element.collisionRadius - 10;
        const centerY = this.getElementCenterY(element);
        if (centerY > bottomEdge) {
            element.vx = 0;
            element.vy = 0;
            element.y = Math.min(element.y, this.logicalHeight - element.height - 10);
        }

        // Ограничение скорости
        const maxSpeed = 0.8;
        const speed = Math.hypot(element.vx, element.vy);
        if (speed > maxSpeed) {
            const f = maxSpeed / speed;
            element.vx *= f;
            element.vy *= f;
        }
    }

    let iteration = 0;
    while (this.separateAllElements() && iteration++ < 12) {}

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

private applyMouseForceAtPosition(
    element: PhysicsElement,
    mouseX: number,
    mouseY: number,
    interpolationStep: number
) {
    const dx = this.getElementCenterX(element) - mouseX;
    const dy = this.getElementCenterY(element) - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Используем динамический радиус
    const radius = this.dynamicCursorRadius;

    // Вектор от курсора к элементу
    const dirToElement = { x: dx / (distance || 1), y: dy / (distance || 1) };
    // Вектор направления движения мыши
    const mouseDir = this.mouseDirection;

    // Косинус угла между движением мыши и направлением к элементу
    const directionDot = dirToElement.x * mouseDir.x + dirToElement.y * mouseDir.y;

    // Сила воздействия по расстоянию
		const minSpeed = 0;
		const maxSpeed2 = 60; // подбери под себя
		const normalizedSpeed = Math.max(minSpeed, Math.min(this.mouseSpeed, maxSpeed2));
		const speedFactor = normalizedSpeed / maxSpeed2; // от 0 до 1

		// Пропорционально увеличиваем силу
		let force = 0;
		if (distance <= radius) {
				force = ((radius - distance) / radius) * speedFactor;
		} else if (distance <= radius * 2) {
				force = 0.5 * (1 - (distance - radius) / radius) * speedFactor;
		} else {
				force = 0.1 * (1 - (distance - radius * 2) / (radius * 2)) * speedFactor;
				force = Math.max(0, force);
		}

    // --- МЕХАНИКА ОТТАЛКИВАНИЯ И ПРИТЯЖЕНИЯ ---
    // Если элемент "впереди" движения курсора (directionDot > 0) — отталкиваем в сторону движения
    // Если "позади" (directionDot < 0) — притягиваем к курсору
    let forceX = 0;
    let forceY = 0;
    if (directionDot > 0) {
        // Отталкивание: толкаем по направлению движения мыши
        forceX = mouseDir.x * force * this.config.cursorBaseForce / (element.mass || 1);
        forceY = mouseDir.y * force * this.config.cursorBaseForce / (element.mass || 1);
    } else if (directionDot < 0) {
        // Притяжение: притягиваем к курсору
        forceX = -dirToElement.x * force * this.config.cursorBaseForce * this.config.cursorAttractStrength / (element.mass || 1);
        forceY = -dirToElement.y * force * this.config.cursorBaseForce * this.config.cursorAttractStrength / (element.mass || 1);
			}

    // Применяем силу к скорости
    if (Math.abs(forceX) > 0.001 || Math.abs(forceY) > 0.001) {
        element.vx += forceX / this.config.animationSpeed * interpolationStep;
        element.vy += forceY / this.config.animationSpeed * interpolationStep;

				// Сохраняем инерцию с множителем
				element.inertiaVx = element.vx * this.config.inertiaMultiplier;
				element.inertiaVy = element.vy * this.config.inertiaMultiplier;
				element.inertiaTime = Date.now();
    }

    // Ограничение максимальной скорости для плавности
    const maxSpeed = (35 / Math.sqrt(element.mass)) / this.config.animationSpeed;
    const currentSpeed = Math.sqrt(element.vx * element.vx + element.vy * element.vy);
    if (currentSpeed > maxSpeed) {
        element.vx = (element.vx / currentSpeed) * maxSpeed;
        element.vy = (element.vy / currentSpeed) * maxSpeed;
    }

    // Убираем дребезжание
    if (Math.abs(element.vx) < 0.01) element.vx = 0;
    if (Math.abs(element.vy) < 0.01) element.vy = 0;
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

    // Минимальное расстояние между элементами
    const minDistance = (element1.collisionRadius + (element1.protectedRadius || 0)) +
                        (element2.collisionRadius + (element2.protectedRadius || 0)) +
                        (this.config.minElementDistance || 0);

    if (distance < minDistance) {
        // Волновое демпфирование
        const damping = 0.8;
        const avgVx = (element1.vx + element2.vx) / 2;
        const avgVy = (element1.vy + element2.vy) / 2;
        element1.vx = avgVx + (element1.vx - avgVx) * damping;
        element1.vy = avgVy + (element1.vy - avgVy) * damping;
        element2.vx = avgVx + (element2.vx - avgVx) * damping;
        element2.vy = avgVy + (element2.vy - avgVy) * damping;

        // Усиливаем разделение у стенки
        let separationMultiplier = 1;
        const edgeBoost = 1.1;

        // --- Новый блок: если вокруг много элементов, уменьшаем separationMultiplier ---
        let crowdCount = 0;
        for (const other of this.elements) {
            if (other === element1 || other === element2) continue;
            const d1 = Math.sqrt(
                Math.pow(this.getElementCenterX(element1) - this.getElementCenterX(other), 2) +
                Math.pow(this.getElementCenterY(element1) - this.getElementCenterY(other), 2)
            );
            const d2 = Math.sqrt(
                Math.pow(this.getElementCenterX(element2) - this.getElementCenterX(other), 2) +
                Math.pow(this.getElementCenterY(element2) - this.getElementCenterY(other), 2)
            );
            if (d1 < minDistance * 1.2 || d2 < minDistance * 1.2) crowdCount++;
        }
        if (crowdCount > 4) separationMultiplier *= 0.7; // толпа — меньше толкаемся

        // Усиливаем у края
        const centerX1 = this.getElementCenterX(element1);
        const centerY1 = this.getElementCenterY(element1);
        const centerX2 = this.getElementCenterX(element2);
        const centerY2 = this.getElementCenterY(element2);

        if (
            centerX1 < element1.collisionRadius + 2 ||
            centerX1 > this.logicalWidth - element1.collisionRadius - 2 ||
            centerY1 < element1.collisionRadius + 2 ||
            centerY1 > this.canvas.height - element1.collisionRadius - 2 ||
            centerX2 < element2.collisionRadius + 2 ||
            centerX2 > this.logicalWidth - element2.collisionRadius - 2 ||
            centerY2 < element2.collisionRadius + 2 ||
            centerY2 > this.canvas.height - element2.collisionRadius - 2
        ) {
            separationMultiplier *= edgeBoost;
        }

        // Ограничиваем максимальный overlap для плавности
        const maxOverlap = minDistance * 0.7;
        const overlap = Math.min(minDistance - distance, maxOverlap);

        // Передача импульса (волна)
        const totalMass = element1.mass + element2.mass;
        const massRatio1 = element2.mass / totalMass;
        const massRatio2 = element1.mass / totalMass;
        const separationX = (dx / (distance || 1)) * overlap * 0.6 * separationMultiplier;
        const separationY = (dy / (distance || 1)) * overlap * 0.6 * separationMultiplier;
        element1.x += separationX * massRatio1;
        element1.y += separationY * massRatio1;
        element2.x -= separationX * massRatio2;
        element2.y -= separationY * massRatio2;

        // Не сбрасывай restingTime, если скорость мала
        if (Math.abs(element1.vx) > 0.02 || Math.abs(element1.vy) > 0.02) {
            element1.restingTime = 0;
            element1.isResting = false;
        }
        if (Math.abs(element2.vx) > 0.02 || Math.abs(element2.vy) > 0.02) {
            element2.restingTime = 0;
            element2.isResting = false;
        }

        this.constrainElementPosition(element1);
        this.constrainElementPosition(element2);

        // --- Дополнительная обработка для очень сильного перекрытия ---
        if (distance < 0.1) {
            const angle = Math.random() * Math.PI * 2;
            const separationDistance = minDistance * 0.6;

            element1.x += Math.cos(angle) * separationDistance * massRatio1;
            element1.y += Math.sin(angle) * separationDistance * massRatio1;
            element2.x -= Math.cos(angle) * separationDistance * massRatio2;
            element2.y -= Math.sin(angle) * separationDistance * massRatio2;
        }

        this.constrainElementPosition(element1);
        this.constrainElementPosition(element2);

        // --- Отскок (bounce) ---
        if (distance > 0.1) {
            const relativeVx = element1.vx - element2.vx;
            const relativeVy = element1.vy - element2.vy;
            const normalDotProduct = relativeVx * (dx / distance) + relativeVy * (dy / distance);

            if (normalDotProduct > 0) {
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


    private getElementCenterX(element: PhysicsElement): number {
        return element.x + element.width / 2;
    }

    private getElementCenterY(element: PhysicsElement): number {
        return element.y + element.height / 2;
    }

    private constrainElementPosition(element: PhysicsElement) {
        const centerX = this.getElementCenterX(element);
        const centerY = this.getElementCenterY(element);

				const bottomEdge = this.canvas.height - element.collisionRadius - 10;
				if (centerY > bottomEdge) {
						const maxOffset = 10;
						element.y = Math.max(this.canvas.height - element.height - maxOffset, Math.min(element.y, this.canvas.height - element.height));
						return;
				}
        
				// Ограничиваем по X
				if (centerX < element.collisionRadius) {
						element.x = element.collisionRadius - element.width / 2;
                } else if (centerX > this.logicalWidth - element.collisionRadius) {
                        element.x = this.logicalWidth - element.collisionRadius - element.width / 2;
				}

				// Ограничиваем по Y
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
        } else if (centerX >= this.logicalWidth - element.collisionRadius) {
            element.x = this.logicalWidth - element.collisionRadius - element.width / 2;
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
        // --- Новый алгоритм half‑pixel: снап ТОЛЬКО при близости, без «ползунка» ---
        const rawX = this.getElementCenterX(element);
        const rawY = this.getElementCenterY(element);
        const speed = Math.hypot(element.vx, element.vy);

        const snapX = Math.round(rawX) + 0.5;
        const snapY = Math.round(rawY) + 0.5;

        // Окно в котором разрешаем подтягивание к half‑pixel
        const snapWindow = 0.22; // чем меньше — тем реже снап, меньше заметность
        const speedThreshold = 0.5; // снапим только когда уже почти остановились

        // Инициализация сглаженных координат
        if (element.drawX === undefined) element.drawX = rawX;
        if (element.drawY === undefined) element.drawY = rawY;

        let targetX = rawX;
        let targetY = rawY;

        if (speed < speedThreshold) {
            const dxSnap = snapX - rawX;
            const dySnap = snapY - rawY;
            const ax = Math.abs(dxSnap);
            const ay = Math.abs(dySnap);

            if (ax < snapWindow) {
                // Чем ближе — тем сильнее тянем (квадратичное усиление ближе к центру)
                const influence = 1 - ax / snapWindow; // 0..1
                targetX = rawX + dxSnap * influence * influence;
            }
            if (ay < snapWindow) {
                const influence = 1 - ay / snapWindow;
                targetY = rawY + dySnap * influence * influence;
            }

            // Маленький «щёлк» только в самом конце — когда совсем близко (< 0.04)
            if (ax < 0.04) targetX = snapX;
            if (ay < 0.04) targetY = snapY;
        }

        // Базовое сглаживание (фиксированное — без накопления дрейфа к half‑pixel)
        const lerpFactor = 0.4; // чуть быстрее прежнего среднего
        element.drawX += (targetX - element.drawX) * lerpFactor;
        element.drawY += (targetY - element.drawY) * lerpFactor;

        this.ctx.translate(element.drawX, element.drawY);
        this.ctx.rotate(element.rotation);
        
        this.ctx.fillStyle = element.color;
        this.ctx.globalAlpha = 1.0;
        
    if (element.shape === 'blob') {
        this.drawBlob(element.visualRadius);
    } else if (element.shape === 'triangle') {
        this.drawTriangle(element.visualRadius);
    } else if (element.shape === 'circle') {
        this.drawCircle(element.visualRadius);
    } else if (element.shape === 'ring') {
        this.drawRing(element.visualRadius);
    } else if (element.shape === 'star') {
        this.drawStar(element.visualRadius);
    } else if (element.shape === 'square') {
        this.drawSquare(element.visualRadius);
    } else if (element.shape === 'hexagon') {
        this.drawHexagon(element.visualRadius);
    } else if (element.shape === 'ellipse') {
        this.drawEllipse(element.visualRadius);
    } else if (element.shape === 'rectangle') {
        this.drawRectangle(element.visualRadius);
    } else if (element.shape === 'polygon') {
        this.drawPolygon(element.visualRadius);
    } else if (element.shape === 'diamond') {
    this.drawDiamond(element.visualRadius);
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

    private drawStar(size: number) {
        const scaleX = (size * 2) / 36;
        const scaleY = (size * 2) / 40;
        
        this.ctx.beginPath();
        this.ctx.moveTo((26.9221 * scaleX) - size, (39.7182 * scaleY) - size);
        this.ctx.lineTo((2.3038 * scaleX) - size, (34.2924 * scaleY) - size);
        this.ctx.bezierCurveTo(
            (0.846368 * scaleX) - size, (33.9712 * scaleY) - size,
            (0.296576 * scaleX) - size, (32.1828 * scaleY) - size,
            (1.32186 * scaleX) - size, (31.0983 * scaleY) - size
        );
        this.ctx.lineTo((12.1304 * scaleX) - size, (19.6658 * scaleY) - size);
        this.ctx.bezierCurveTo(
            (12.6175 * scaleX) - size, (19.1506 * scaleY) - size,
            (12.781 * scaleX) - size, (18.4088 * scaleY) - size,
            (12.5556 * scaleX) - size, (17.7365 * scaleY) - size
        );
        this.ctx.lineTo((7.55447 * scaleX) - size, (2.81956 * scaleY) - size);
        this.ctx.bezierCurveTo(
            (7.08007 * scaleX) - size, (1.40456 * scaleY) - size,
            (8.33071 * scaleX) - size, (0.0130201 * scaleY) - size,
            (9.78813 * scaleX) - size, (0.334236 * scaleY) - size
        );
        this.ctx.lineTo((34.4064 * scaleX) - size, (5.76008 * scaleY) - size);
        this.ctx.bezierCurveTo(
            (35.8638 * scaleX) - size, (6.08129 * scaleY) - size,
            (36.4136 * scaleX) - size, (7.86964 * scaleY) - size,
            (35.3883 * scaleX) - size, (8.95411 * scaleY) - size
        );
        this.ctx.lineTo((24.5798 * scaleX) - size, (20.3866 * scaleY) - size);
        this.ctx.bezierCurveTo(
            (24.0927 * scaleX) - size, (20.9019 * scaleY) - size,
            (23.9292 * scaleX) - size, (21.6437 * scaleY) - size,
            (24.1546 * scaleX) - size, (22.316 * scaleY) - size
        );
        this.ctx.lineTo((29.1557 * scaleX) - size, (37.2329 * scaleY) - size);
        this.ctx.bezierCurveTo(
            (29.6301 * scaleX) - size, (38.6479 * scaleY) - size,
            (28.3795 * scaleX) - size, (40.0394 * scaleY) - size,
            (26.9221 * scaleX) - size, (39.7182 * scaleY) - size
        );
        this.ctx.closePath();
        this.ctx.fill();
    }

    // НОВЫЕ МЕТОДЫ ДЛЯ РИСОВАНИЯ SQUARE И HEXAGON
    private drawSquare(size: number) {
        // Масштабируем координаты из SVG (28x28) к размеру элемента
        const scaleX = (size * 2) / 28;
        const scaleY = (size * 2) / 28;
        
        this.ctx.beginPath();
        
        // Начальная точка (23.0996, 0.299805)
        this.ctx.moveTo((23.0996 * scaleX) - size, (0.299805 * scaleY) - size);
        
        // Кривая к (27.0996, 4.2998)
        this.ctx.bezierCurveTo(
            (25.3087 * scaleX) - size, (0.299805 * scaleY) - size,
            (27.0996 * scaleX) - size, (2.09067 * scaleY) - size,
            (27.0996 * scaleX) - size, (4.2998 * scaleY) - size
        );
        
        // Линия к (27.0996, 23.2998)
        this.ctx.lineTo((27.0996 * scaleX) - size, (23.2998 * scaleY) - size);
        
        // Кривая к (23.0996, 27.2998)
        this.ctx.bezierCurveTo(
            (27.0996 * scaleX) - size, (25.5089 * scaleY) - size,
            (25.3087 * scaleX) - size, (27.2998 * scaleY) - size,
            (23.0996 * scaleX) - size, (27.2998 * scaleY) - size
        );
        
        // Линия к (20.5635, 27.2998)
        this.ctx.lineTo((20.5635 * scaleX) - size, (27.2998 * scaleY) - size);
        
        // Кривая к (16.5635, 23.2998)
        this.ctx.bezierCurveTo(
            (18.3543 * scaleX) - size, (27.2998 * scaleY) - size,
            (16.5635 * scaleX) - size, (25.5089 * scaleY) - size,
            (16.5635 * scaleX) - size, (23.2998 * scaleY) - size
        );
        
        // Линия к (16.5635, 14.8359)
        this.ctx.lineTo((16.5635 * scaleX) - size, (14.8359 * scaleY) - size);
        
        // Кривая к (12.5635, 10.8359)
        this.ctx.bezierCurveTo(
            (16.5635 * scaleX) - size, (12.6268 * scaleY) - size,
            (14.7726 * scaleX) - size, (10.8359 * scaleY) - size,
            (12.5635 * scaleX) - size, (10.8359 * scaleY) - size
        );
        
        // Линия к (4.09961, 10.8359)
        this.ctx.lineTo((4.09961 * scaleX) - size, (10.8359 * scaleY) - size);
        
        // Кривая к (0.0996094, 6.83594)
        this.ctx.bezierCurveTo(
            (1.89047 * scaleX) - size, (10.8359 * scaleY) - size,
            (0.0996094 * scaleX) - size, (9.04508 * scaleY) - size,
            (0.0996094 * scaleX) - size, (6.83594 * scaleY) - size
        );
        
        // Линия к (0.0996094, 4.2998)
        this.ctx.lineTo((0.0996094 * scaleX) - size, (4.2998 * scaleY) - size);
        
        // Кривая к (4.09961, 0.299805)
        this.ctx.bezierCurveTo(
            (0.0996094 * scaleX) - size, (2.09067 * scaleY) - size,
            (1.89047 * scaleX) - size, (0.299805 * scaleY) - size,
            (4.09961 * scaleX) - size, (0.299805 * scaleY) - size
        );
        
        // Линия обратно к начальной точке
        this.ctx.lineTo((23.0996 * scaleX) - size, (0.299805 * scaleY) - size);
        
        this.ctx.closePath();
        this.ctx.fill();
    }

    private drawHexagon(size: number) {
        // Масштабируем координаты из SVG (37x36) к размеру элемента
        const scaleX = (size * 2) / 37;
        const scaleY = (size * 2) / 36;
        
        this.ctx.beginPath();
        
        // Начальная точка (35.2692, 14.9625)
        this.ctx.moveTo((35.2692 * scaleX) - size, (14.9625 * scaleY) - size);
        
        // Кривая к (35.5616, 18.5359)
        this.ctx.bezierCurveTo(
            (36.146 * scaleX) - size, (15.958 * scaleY) - size,
            (36.2649 * scaleX) - size, (17.4111 * scaleY) - size,
            (35.5616 * scaleX) - size, (18.5359 * scaleY) - size
        );
        
        // Линия к (30.7519, 26.2275)
        this.ctx.lineTo((30.7519 * scaleX) - size, (26.2275 * scaleY) - size);
        
        // Линия к (25.6792, 33.9794)
        this.ctx.lineTo((25.6792 * scaleX) - size, (33.9794 * scaleY) - size);
        
        // Кривая к (22.5458, 35.2712)
        this.ctx.bezierCurveTo(
            (25.0013 * scaleX) - size, (35.0153 * scaleY) - size,
            (23.7568 * scaleX) - size, (35.5284 * scaleY) - size,
            (22.5458 * scaleX) - size, (35.2712 * scaleY) - size
        );
        
        // Линия к (13.1956, 33.2859)
        this.ctx.lineTo((13.1956 * scaleX) - size, (33.2859 * scaleY) - size);
        
        // Линия к (3.99941, 31.1442)
        this.ctx.lineTo((3.99941 * scaleX) - size, (31.1442 * scaleY) - size);
        
        // Кривая к (1.69266, 28.4988)
        this.ctx.bezierCurveTo(
            (2.74109 * scaleX) - size, (30.8511 * scaleY) - size,
            (1.81173 * scaleX) - size, (29.7853 * scaleY) - size,
            (1.69266 * scaleX) - size, (28.4988 * scaleY) - size
        );
        
        // Линия к (0.86676, 19.5755)
        this.ctx.lineTo((0.86676 * scaleX) - size, (19.5755 * scaleY) - size);
        
        // Линия к (0.231412, 10.6365)
        this.ctx.lineTo((0.231412 * scaleX) - size, (10.6365 * scaleY) - size);
        
        // Кривая к (2.07757, 7.65147)
        this.ctx.bezierCurveTo(
            (0.139813 * scaleX) - size, (9.34777 * scaleY) - size,
            (0.883605 * scaleX) - size, (8.14514 * scaleY) - size,
            (2.07757 * scaleX) - size, (7.65147 * scaleY) - size
        );
        
        // Линия к (10.8034, 4.04359)
        this.ctx.lineTo((10.8034 * scaleX) - size, (4.04359 * scaleY) - size);
        
        // Линия к (19.7066, 0.565015)
        this.ctx.lineTo((19.7066 * scaleX) - size, (0.565015 * scaleY) - size);
        
        // Кривая к (23.0083, 1.33046)
        this.ctx.bezierCurveTo(
            (20.8597 * scaleX) - size, (0.114496 * scaleY) - size,
            (22.1711 * scaleX) - size, (0.418524 * scaleY) - size,
            (23.0083 * scaleX) - size, (1.33046 * scaleY) - size
        );
        
        // Линия к (29.2735, 8.15479)
        this.ctx.lineTo((29.2735 * scaleX) - size, (8.15479 * scaleY) - size);
        
        // Линия обратно к начальной точке
        this.ctx.lineTo((35.2692 * scaleX) - size, (14.9625 * scaleY) - size);
        
        this.ctx.closePath();
        this.ctx.fill();
    }

		// Метод для рисования ellipse
		private drawEllipse(size: number) {
				const scaleX = (size * 2) / 38;
				const scaleY = (size * 2) / 25;
				
				this.ctx.save();
				this.ctx.translate(0, 0);
				this.ctx.rotate(22.3416 * Math.PI / 180); // поворот из SVG
				this.ctx.scale(scaleX, scaleY);
				
				this.ctx.beginPath();
				this.ctx.ellipse(0, 0, 19.6314, 9.9, 0, 0, Math.PI * 2);
				this.ctx.fill();
				
				this.ctx.restore();
		}

		// Метод для рисования rectangle
		private drawRectangle(size: number) {
				const scaleX = (size * 2) / 33;
				const scaleY = (size * 2) / 41;
				
				this.ctx.save();
				this.ctx.translate(0, 0);
				this.ctx.rotate(-57.1373 * Math.PI / 180); // поворот из SVG
				
				this.ctx.beginPath();
				this.ctx.roundRect(
						(-41.4 / 2) * scaleX, 
						(-14.4 / 2) * scaleY, 
						41.4 * scaleX, 
						14.4 * scaleY, 
						4 * Math.min(scaleX, scaleY)
				);
				this.ctx.fill();
				
				this.ctx.restore();
		}

		// Метод для рисования polygon (стрелка)
		private drawPolygon(size: number) {
				const scaleX = (size * 2) / 32;
				const scaleY = (size * 2) / 30;
				
				// Вычисляем правильный центр стрелки
				// Центр по X: примерно в середине между минимальной и максимальной X координатами
				// Центр по Y: примерно в середине между минимальной и максимальной Y координатами
				const centerX = 19; // (0.239001 + 37.5665) / 2 ≈ 19
				const centerY = 14.7; // (-0.0551034 + 29.6951) / 2 ≈ 14.7
				
				this.ctx.beginPath();
				
				// Переводим SVG path в Canvas API с правильным центрированием
				this.ctx.moveTo(((26.9573 - centerX) * scaleX), ((5.89926 - centerY) * scaleY));
				this.ctx.bezierCurveTo(
						((27.6755 - centerX) * scaleX), ((4.65538 - centerY) * scaleY),
						((29.5128 - centerX) * scaleX), ((4.79286 - centerY) * scaleY),
						((30.0381 - centerX) * scaleX), ((6.12968 - centerY) * scaleY)
				);
				this.ctx.lineTo(((37.1636 - centerX) * scaleX), ((24.2624 - centerY) * scaleY));
				this.ctx.bezierCurveTo(
						((37.5665 - centerX) * scaleX), ((25.2877 - centerY) * scaleY),
						((36.9117 - centerX) * scaleX), ((26.4219 - centerY) * scaleY),
						((35.8223 - centerX) * scaleX), ((26.5856 - centerY) * scaleY)
				);
				this.ctx.lineTo(((16.5556 - centerX) * scaleX), ((29.4819 - centerY) * scaleY));
				this.ctx.bezierCurveTo(
						((15.1355 - centerX) * scaleX), ((29.6951 - centerY) * scaleY),
						((14.0981 - centerX) * scaleX), ((28.1721 - centerY) * scaleY),
						((14.8162 - centerX) * scaleX), ((26.9283 - centerY) * scaleY)
				);
				this.ctx.lineTo(((16.7273 - centerX) * scaleX), ((23.6181 - centerY) * scaleY));
				this.ctx.lineTo(((1.88989 - centerX) * scaleX), ((15.0517 - centerY) * scaleY));
				this.ctx.bezierCurveTo(
						((0.659916 - centerX) * scaleX), ((14.3413 - centerY) * scaleY),
						((0.239001 - centerX) * scaleX), ((12.7685 - centerY) * scaleY),
						((0.949218 - centerX) * scaleX), ((11.5384 - centerY) * scaleY)
				);
				this.ctx.lineTo(((6.68896 - centerX) * scaleX), ((1.59687 - centerY) * scaleY));
				this.ctx.bezierCurveTo(
						((7.3992 - centerX) * scaleX), ((0.366801 - centerY) * scaleY),
						((8.97172 - centerX) * scaleX), ((-0.0551034 - centerY) * scaleY),
						((10.2019 - centerX) * scaleX), ((0.654871 - centerY) * scaleY)
				);
				this.ctx.lineTo(((25.0393 - centerX) * scaleX), ((9.22128 - centerY) * scaleY));
				this.ctx.lineTo(((26.9573 - centerX) * scaleX), ((5.89926 - centerY) * scaleY));
				
				this.ctx.closePath();
				this.ctx.fill();
		}

		// Метод для рисования diamond
		private drawDiamond(size: number) {
				const scaleX = (size * 2) / 36;
				const scaleY = (size * 2) / 37;
				
				// Вычисляем центр фигуры
				const centerX = 18; // (0 + 36) / 2
				const centerY = 18.5; // (0 + 37) / 2
				
				this.ctx.beginPath();
				
				// Переводим SVG path в Canvas API с центрированием
				this.ctx.moveTo(((35.4224 - centerX) * scaleX), ((13.7385 - centerY) * scaleY));
				this.ctx.bezierCurveTo(
						((36.2714 - centerX) * scaleX), ((15.2071 - centerY) * scaleY),
						((36.1018 - centerX) * scaleX), ((17.0515 - centerY) * scaleY),
						((34.9991 - centerX) * scaleX), ((18.3406 - centerY) * scaleY)
				);
				this.ctx.lineTo(((20.6041 - centerX) * scaleX), ((35.1693 - centerY) * scaleY));
				this.ctx.bezierCurveTo(
						((19.1943 - centerX) * scaleX), ((36.8175 - centerY) * scaleY),
						((16.7278 - centerX) * scaleX), ((37.0418 - centerY) * scaleY),
						((15.0437 - centerX) * scaleX), ((35.6751 - centerY) * scaleY)
				);
				this.ctx.lineTo(((1.9041 - centerX) * scaleX), ((25.0108 - centerY) * scaleY));
				this.ctx.bezierCurveTo(
						((-0.0607217 - centerX) * scaleX), ((23.4161 - centerY) * scaleY),
						((-0.0696371 - centerX) * scaleX), ((20.4206 - centerY) * scaleY),
						((1.88566 - centerX) * scaleX), ((18.8142 - centerY) * scaleY)
				);
				this.ctx.lineTo(((22.97 - centerX) * scaleX), ((1.49259 - centerY) * scaleY));
				this.ctx.bezierCurveTo(
						((24.8779 - centerX) * scaleX), ((-0.0748266 - centerY) * scaleY),
						((27.7363 - centerX) * scaleX), ((0.443658 - centerY) * scaleY),
						((28.9721 - centerX) * scaleX), ((2.58131 - centerY) * scaleY)
				);
				this.ctx.lineTo(((35.4224 - centerX) * scaleX), ((13.7385 - centerY) * scaleY));
				
				this.ctx.closePath();
				this.ctx.fill();
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

    public updateShapeDistribution(newDistribution: Record<'blob' | 'triangle' | 'circle' | 'ring' | 'star' | 'square' | 'hexagon' | 'ellipse' | 'rectangle' | 'polygon' | 'diamond', number>) {
        const totalPercentage = Object.values(newDistribution).reduce((sum, percent) => sum + percent, 0);
        if (Math.abs(totalPercentage - 100) > 0.1) {
            console.warn(`Сумма процентов должна быть 100%, текущая: ${totalPercentage}%`);
        }
        
        this.config.shapeDistribution = newDistribution;
        this.createElements();
    }

    public updateAdaptiveSettings() {
        this.applyAdaptiveSettings();
        this.createElements();
    }

    public getCurrentSettings() {
        return {
            screenWidth: window.innerWidth,
            adaptiveSettings: this.getAdaptiveSettings(),
            currentConfig: {
                elementCount: this.config.elementCount,
                elementSize: this.config.elementSize,
                mouseRadius: this.config.mouseRadius,
                mouseForce: this.config.mouseForce
            }
        };
    }

    public reset() {
        this.isAnimationStarted = false;
        this.createElements();
        this.setupScrollListener();
    }

    public destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.scrollListener) {
            window.removeEventListener('scroll', this.scrollListener);
        }
        if (this.globalMouseListener) {
            document.removeEventListener('mousemove', this.globalMouseListener);
        }
    }

    public forceStart() {
        this.startElementsFalling();
    }
}

// Инициализация
const canvasPhysics = new CanvasPhysics('scene');

canvasPhysics.updateConfig({
    gravity: 0.1,              
    fallSpeed: 1,            
    friction: 0.94,            
    bounce: 0.3,               
    mouseVelocityMultiplier: 25, 
    elementPadding: 5,         
    restThreshold: 0.01,       
    restTimeThreshold: 30,     
    separationForce: 150000,   
    rotationDamping: 0.95,     
    maxRotationSpeed: 0.3,     
    rotationIntensity: 0.8,    
    animationSpeed: 40,
    footerVisibilityThreshold: 60      
});

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

// Обновленное распределение форм с новыми фигурами
canvasPhysics.updateShapeDistribution({
    blob: 14,
    triangle: 11,
    circle: 11,
    ring: 11,
    star: 11,
    square: 7,
    hexagon: 7,
    ellipse: 6,
    rectangle: 6,
    polygon: 6,
    diamond: 10      // Новая фигура
});

console.log('Current adaptive settings:', canvasPhysics.getCurrentSettings());

(window as any).canvasPhysics = canvasPhysics;

/*

Основные узкие места сейчас:

O(n^2) коллизии + внутри separateElements дополнительный цикл по всем элементам (crowdCount) => фактически O(n^3) в худшем случае.
Много sqrt (distance) там, где хватит сравнения квадратов.
Частое изменение fillStyle (каждый элемент).
Сложные пути фигур строятся заново каждый кадр (можно кэшировать Path2D).
Высокое animationSpeed=40 увеличивает число пересечений.
Все элементы обрабатываются каждый кадр, даже когда “лежат”.
Множественные интерполяционные шаги мыши (steps) — дорого при быстрых движениях.
Отрисовка продолжается при невидимом footer (нет паузы через IntersectionObserver).
Нет снижение качества при низком FPS (DPR / count).
Много лишних Math.hypot / sqrt в нескольких местах подряд.

*/