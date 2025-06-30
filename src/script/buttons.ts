import { gsap } from "gsap";

	// ------------- Кнопка в шапке сайта
	const button = document.querySelector(".header__button");
	const word = document.querySelectorAll('.header__button_text');

  // Настройки для каждой буквы: x, y, rotation (можно расширить)
  const targetPositions = [
    { x: 24, y: 0, rotation: 0 },
  ];

  const springEase = "elastic.out(1, 1)";
  const duration = 0.35;

  let explodeTweens: gsap.core.Tween[] = [];
  let implodeTweens: gsap.core.Tween[] = [];

  const explode = () => {
    // Отменяем возвратную анимацию, если она еще идет
    implodeTweens.forEach(tween => tween.kill());
    implodeTweens = [];

      const { x, y, rotation } = targetPositions[0];
      const tween = gsap.to(word, {
        x,
        y,
        rotation,
        duration,
        ease: springEase
      });
      explodeTweens.push(tween);
  };

  const implode = () => {
    // Отменяем предыдущую анимацию взрыва, если она еще не закончилась
    explodeTweens.forEach(tween => tween.kill());
    explodeTweens = [];

      const tween = gsap.to(word, {
        x: 0,
        y: 0,
        rotation: 0,
        duration,
        ease: springEase
      });
      implodeTweens.push(tween);
  };

  if (button) {
    button.addEventListener('mouseenter', explode);
    button.addEventListener('mouseleave', implode);
  }


	// ------------- Кнопка в блоке featured works
	const worksButton = document.querySelector<HTMLElement>(".works-button");
	const worksButtonWord = document.querySelector<HTMLElement>(".works-button__text");

	// Настройки для каждой буквы: x, y, rotation (можно расширить)
  const workButtonTargetPositions = [
    { x: -20, y: 0, rotation: 0 },
  ];

	const workButtonSpringEase = "elastic.out(1, 1)";
  const workButtonDuration = 0.35;

  let workButtonExplodeTweens: gsap.core.Tween[] = [];
  let workButtonImplodeTweens: gsap.core.Tween[] = [];

	const workButtonExplode = () => {
    // Отменяем возвратную анимацию, если она еще идет
    workButtonImplodeTweens.forEach(tween => tween.kill());
    workButtonImplodeTweens = [];

      const { x, y, rotation } = workButtonTargetPositions[0];
      const tween = gsap.to(worksButtonWord, {
        x,
        y,
        rotation,
        workButtonDuration,
        ease: springEase
      });
      workButtonExplodeTweens.push(tween);
  };

  const workButtonImplode = () => {
    // Отменяем предыдущую анимацию взрыва, если она еще не закончилась
    workButtonExplodeTweens.forEach(tween => tween.kill());
    workButtonExplodeTweens = [];

      const tween = gsap.to(worksButtonWord, {
        x: 0,
        y: 0,
        rotation: 0,
        workButtonDuration,
        ease: springEase
      });
      workButtonImplodeTweens.push(tween);
  };

  if (worksButton) {
    worksButton.addEventListener('mouseenter', workButtonExplode);
    worksButton.addEventListener('mouseleave', workButtonImplode);
  }


