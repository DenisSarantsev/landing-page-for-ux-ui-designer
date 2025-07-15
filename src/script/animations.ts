import gsap from "gsap";

// Анимация поялвения текста
export const animateWordsByWord = (element: HTMLElement, delay: number) => {
	// Анимируем появление
	gsap.fromTo(element, {
		opacity: 0,
		scaleY: 0.5,
	},{
		opacity: 1,
		duration: 0.5,
		delay: delay,
		scaleY: 1,
		stagger: 0.08, // Задержка между словами
		ease: "elastic.out(1.5, 0.9)",
		transformOrigin: "bottom center",
	});
};

// Анимация поялвения элемента с увеличением
export const animateElementScale = (element: HTMLElement, delay: number, startY: number, startX: number) => {
	// Сначала анимируем появление
	gsap.fromTo(element, {
			opacity: 0,
			scale: 0.8,
			x: -60,
			transformOrigin: "center center",
	},{
			opacity: 1,
			duration: 0.8,
			delay: delay,
			scale: 1,
			ease: "elastic.out(1.2, 0.5)",
			x: 0,
			transformOrigin: "center center",
	});
}

	// Анимация поялвения элемента с увеличением
	export const animateElementSettingsScale = (element: HTMLElement, delay: number, startY: number, startX: number, startScale: number) => {
		// Сначала анимируем появление
		gsap.fromTo(element, {
				opacity: 0,
				scale: startScale,
				x: -60,
				transformOrigin: "center center",
		},{
				opacity: 1,
				duration: 0.8,
				delay: delay,
				scale: 1,
				ease: "elastic.out(1.2, 0.5)",
				x: 0,
				transformOrigin: "center center",
		});

	// Долгое покачивание (запускается параллельно)
	gsap.fromTo(element, {
		y: startY, // Движение вверх-вниз
		x: startX,
	}, {
		y: 0,
		x: 0,
		duration: 3,
		ease: "elastic.out(1.5, 0.2)", // Плавное покачивание
		transformOrigin: "center center",
		delay: delay, // Начинаем после появления
	});
};

// Анимация появления элемента снизу с небольшим увелечением
export const showScaleAndOpacityElement = (element: HTMLElement, delay: number) => {
	gsap.fromTo(element, {
		opacity: 0,
		y: 40
	}, {
		opacity: 1,
		duration: 0.4,
		y: 0,
		delay: delay
	})
}

export const showScaleAndOpacityElementWithDuration = (element: HTMLElement, delay: number, duration: number) => {
	gsap.fromTo(element, {
		opacity: 0,
		y: 40
	}, {
		opacity: 1,
		duration: duration,
		y: 0,
		delay: delay
	})
}