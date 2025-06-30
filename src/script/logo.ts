import { gsap } from "gsap";
import { isMobileScreen } from "./resize";

document.addEventListener("DOMContentLoaded", () => {

	const letters = document.querySelectorAll('.header__logo-letter');

  // Настройки для каждой буквы: x, y, rotation (можно расширить)
	const targetPositions = [
		{ x: "5%", y: "30%", rotation: -10 },
		{ x: "20%", y: "-55%", rotation: -20 },
		{ x: "75%", y: "60%", rotation: -4 },
		{ x: "150%", y: "-50%", rotation: 0 },
		{ x: "230%", y: "30%", rotation: 0 },
		{ x: "200%", y: "-50%", rotation: 20 },
		{ x: "210%", y: "25%", rotation: 8 },
	];

  const springEase = "elastic.out(0.1, 0.1)";
  const duration = 0.5;

  let explodeTweens: gsap.core.Tween[] = [];
  let implodeTweens: gsap.core.Tween[] = [];

  const explode = () => {
    // Отменяем возвратную анимацию, если она еще идет
    implodeTweens.forEach(tween => tween.kill());
    implodeTweens = [];

    letters.forEach((letter, index) => {
      const { x, y, rotation } = targetPositions[index];
      const tween = gsap.to(letter, {
        x,
        y,
        rotation,
        duration,
        ease: springEase
      });
      explodeTweens.push(tween);
    });
  };

  const implode = () => {
    // Отменяем предыдущую анимацию взрыва, если она еще не закончилась
    explodeTweens.forEach(tween => tween.kill());
    explodeTweens = [];

    letters.forEach((letter) => {
      const tween = gsap.to(letter, {
        x: 0,
        y: 0,
        rotation: 0,
        duration,
        ease: springEase
      });
      implodeTweens.push(tween);
    });
  };

	// -------------------------------- Управление работой функционала в зависимости от размера экрана
	const logo = document.querySelector('.logotype');
	let eventsAttached = false; // Отслеживаем, прикреплены ли обработчики событий
	// Функция управления обработчиками событий
	const manageEventListeners = () => {
		if (!logo) return;

		if (!isMobileScreen && !eventsAttached) {
			// Включаем обработчики на десктопе
			logo.addEventListener('mouseenter', explode);
			logo.addEventListener('mouseleave', implode);
			eventsAttached = true;
		} else if (isMobileScreen && eventsAttached) {
			// Отключаем обработчики на мобильных
			logo.removeEventListener('mouseenter', explode);
			logo.removeEventListener('mouseleave', implode);
			eventsAttached = false;
			
			// Возвращаем буквы в исходное положение
			implode();
		}
	};

	// Инициализация при загрузке
	manageEventListeners();

	// Слушаем изменения размера экрана
	window.addEventListener('resize', () => {
		manageEventListeners();
	});
	
})