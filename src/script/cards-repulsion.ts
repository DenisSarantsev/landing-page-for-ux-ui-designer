import { gsap } from "gsap";
import { isMobileScreen } from "./resize";


const cards = document.querySelectorAll<HTMLElement>(".start-block__card");

const settings = {
  radius: 250,
  strength: 280,
  maxOffset: 190,
  springEase: "elastic.out(5, 0.3)", // Пружинистый возврат
  pushDuration: 0.1,
  maxSpeedMultiplier: 3,
};

let prevMouseX = 0;
let prevMouseY = 0;
let lastTime = performance.now();
let eventsAttached = false; // Флаг состояния обработчиков

// Обработчик движения мыши
const handleMouseMove = (e: MouseEvent) => {
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  const currentTime = performance.now();
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  const deltaX = mouseX - prevMouseX;
  const deltaY = mouseY - prevMouseY;

  const velocity = Math.sqrt(deltaX ** 2 + deltaY ** 2) / (deltaTime || 1);
  const speedMultiplier = Math.min(velocity * 0.3, settings.maxSpeedMultiplier);

  prevMouseX = mouseX;
  prevMouseY = mouseY;

  cards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = centerX - mouseX;
    const dy = centerY - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < settings.radius) {
      const angle = Math.atan2(deltaY, deltaX);

      const baseForce = (1 - distance / settings.radius) * settings.strength;
      const force = baseForce * speedMultiplier;

      const offsetX = Math.cos(angle) * force;
      const offsetY = Math.sin(angle) * force;

      const clampedX = Math.max(-settings.maxOffset, Math.min(settings.maxOffset, offsetX));
      const clampedY = Math.max(-settings.maxOffset, Math.min(settings.maxOffset, offsetY));

      gsap.to(card, {
        x: clampedX,
        y: clampedY,
        duration: settings.pushDuration,
        ease: "power2.out",
        overwrite: "auto",
        onComplete: () => {
          gsap.to(card, {
            x: 0,
            y: 0,
            duration: 1.6,
            ease: settings.springEase,
            overwrite: "auto",
          });
        },
      });
    }
  });
};



// Сброс позиций всех карточек
const resetCardsPosition = () => {
  cards.forEach((card) => {
    gsap.to(card, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto",
    });
  });
};

// Функция управления обработчиками событий
const manageEventListeners = () => {
  if (!isMobileScreen && !eventsAttached) {
    // Включаем обработчики на больших экранах
    document.addEventListener("mousemove", handleMouseMove);
    eventsAttached = true;
  } else if (isMobileScreen && eventsAttached) {
    // Отключаем обработчики на маленьких экранах
    document.removeEventListener("mousemove", handleMouseMove);
    eventsAttached = false;
    
    // Возвращаем карточки в исходное положение
    resetCardsPosition();
  }
};

// Инициализация при загрузке
document.addEventListener("DOMContentLoaded", () => {
  manageEventListeners();
});

// Слушаем изменения размера экрана
window.addEventListener("resize", () => {
  manageEventListeners();
});
