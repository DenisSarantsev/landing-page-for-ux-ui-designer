import { gsap } from "gsap";

const cards = document.querySelectorAll<HTMLElement>(".start-block__card");

const settings = {
  radius: 250,
  strength: 230,
  maxOffset: 140,
  springEase: "elastic.out(1.9, 0.2)", // Пружинистый возврат
  pushDuration: 0.15,
  maxSpeedMultiplier: 3,
};

let prevMouseX = 0;
let prevMouseY = 0;
let lastTime = performance.now();

document.addEventListener("mousemove", (e) => {
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
});
