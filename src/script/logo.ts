import { gsap } from "gsap";

document.addEventListener("DOMContentLoaded", () => {

	const letters = document.querySelectorAll('.header__logo-letter');

  // Настройки для каждой буквы: x, y, rotation (можно расширить)
  const targetPositions = [
    { x: 2, y: 8, rotation: -10 },
    { x: 7, y: -15, rotation: -20 },
    { x: 22,  y: 14, rotation: -4 },
    { x: 40,  y: -15, rotation: 0 },
		{ x: 50,  y: 12,  rotation: 0 },
		{ x: 57,  y: -17,  rotation: 20 },
		{ x: 73,  y: 11,  rotation: 8 },
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

  const logo = document.querySelector('.logotype');
	if ( logo ) {
		logo.addEventListener('mouseenter', explode);
  	logo.addEventListener('mouseleave', implode);
	}
	
})