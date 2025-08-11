import { gsap } from "gsap";
import { isMobileScreen } from "./resize";

const cards = document.querySelectorAll<HTMLElement>(".start-block__card");

const settings = {
  radius: 250,
  strength: 350,
  maxOffset: 250,
  springEase: "elastic.out(1.5, 0.3)", // Более плавный пружинистый возврат
  pushDuration: 0.15, // Уменьшили для быстрой реакции
  maxSpeedMultiplier: 3.5, // Уменьшили для более плавного движения
  minSpeedMultiplier: 0.4, // Увеличили минимальную скорость для плавности
  
  // Пороги скорости для переключения между режимами
  slowSpeedThreshold: 1.2, // Немного увеличили для более плавного переключения
  verySlowSpeedThreshold: 0.3, // Новый порог для очень медленного движения
  
  // Настройки для медленного движения
  slowMoveDuration: 0.25, // Уменьшили для более быстрой реакции
  slowMoveEase: "power1.out", // Плавное easing
  slowReturnDuration: 1.0, // Уменьшили для более быстрого возврата
  slowReturnEase: "elastic.out(2, 0.4)", // Более плавный возврат
  
  // Настройки для очень медленного движения
  verySlowMoveDuration: 0.7, // Уменьшили для более быстрой реакции
  verySlowMoveEase: "power1.out", // Очень плавное easing
  verySlowForceMultiplier: 0.2, // Уменьшенная сила для очень медленного движения
  
  // Настройки задержек для разных скоростей
  fastSpeedReturnDelay: 0, // Нет задержки для быстрого движения
  slowSpeedReturnDelay: 35, // Минимальная задержка для медленного движения
  verySlowSpeedReturnDelay: 90, // Больше задержки для очень медленного движения
};

let prevMouseX = 0;
let prevMouseY = 0;
let lastTime = performance.now();
let eventsAttached = false; // Флаг состояния обработчиков

// Сглаживание скорости
let smoothedVelocity = 0;
const velocitySmoothingFactor = 0.2;

// Объект для отслеживания карточек в режиме медленного движения
const slowModeCards = new Map<HTMLElement, {
  isInSlowMode: boolean;
  returnTimeout?: NodeJS.Timeout;
  initialRotation: number; // Сохраняем начальный поворот
  lastSpeedCategory?: 'fast' | 'slow' | 'verySlow'; // Последняя категория скорости
}>();

// Функция для получения rotation в зависимости от breakpoint
const getCardRotations = () => {
  const width = window.innerWidth;
  
  if (width <= 768) {
    // Mobile
    return [
      { rotation: -10 }, // Карточка 1
      { rotation: -8 },  // Карточка 2
      { rotation: 6 }    // Карточка 3
    ];
  } else {
    // Desktop и Tablet
    return [
      { rotation: 3.21 }, // Карточка 1
      { rotation: -2 },   // Карточка 2
      { rotation: 4.75 }  // Карточка 3
    ];
  }
};

// Функция для применения rotation стилей
const applyCardRotations = () => {
  const rotations = getCardRotations();
  
  cards.forEach((card, index) => {
    if (index >= rotations.length) return;
    
    const rotation = rotations[index].rotation;
    
    // Применяем rotation через CSS transform
    card.style.transform = `rotate(${rotation}deg)`;
    
    // Сохраняем начальный поворот
    if (slowModeCards.has(card)) {
      const cardState = slowModeCards.get(card)!;
      cardState.initialRotation = rotation;
    } else {
      slowModeCards.set(card, {
        isInSlowMode: false,
        initialRotation: rotation,
        lastSpeedCategory: 'fast'
      });
    }
  });
};

// Функция для получения задержки возврата в зависимости от скорости
const getReturnDelay = (velocity: number): number => {
  if (velocity < settings.verySlowSpeedThreshold) {
    return settings.verySlowSpeedReturnDelay; // 75ms для очень медленного
  } else if (velocity < settings.slowSpeedThreshold) {
    return settings.slowSpeedReturnDelay; // 25ms для медленного
  } else {
    return settings.fastSpeedReturnDelay; // 0ms для быстрого
  }
};

// Обработчик движения мыши
const handleMouseMove = (e: MouseEvent) => {
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  const currentTime = performance.now();
  const deltaTime = Math.max(currentTime - lastTime, 1); // Избегаем деления на 0
  lastTime = currentTime;

  const deltaX = mouseX - prevMouseX;
  const deltaY = mouseY - prevMouseY;

  // Рассчитываем мгновенную скорость
  const instantVelocity = Math.sqrt(deltaX ** 2 + deltaY ** 2) / deltaTime;
  
  // Сглаживаем скорость для устранения дерганий
  smoothedVelocity = smoothedVelocity * (1 - velocitySmoothingFactor) + instantVelocity * velocitySmoothingFactor;
  
  // Используем сглаженную скорость для расчетов
  const velocity = smoothedVelocity;
  
  const speedMultiplier = Math.max(
    Math.min(velocity * 0.25, settings.maxSpeedMultiplier), // Уменьшили множитель для плавности
    settings.minSpeedMultiplier
  );

  // Определяем режим движения
  const isVerySlowMovement = velocity < settings.verySlowSpeedThreshold;
  const isSlowMovement = velocity < settings.slowSpeedThreshold;

  prevMouseX = mouseX;
  prevMouseY = mouseY;

  cards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = centerX - mouseX;
    const dy = centerY - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Инициализируем карточку в Map если её там нет
    if (!slowModeCards.has(card)) {
      const rotations = getCardRotations();
      const cardIndex = Array.from(cards).indexOf(card);
      const rotation = rotations[cardIndex]?.rotation || 0;
      
      slowModeCards.set(card, {
        isInSlowMode: false,
        initialRotation: rotation,
        lastSpeedCategory: 'fast'
      });
    }

    const cardState = slowModeCards.get(card)!;

    if (distance < settings.radius) {
      // Курсор в зоне действия карточки
      
      if (isVerySlowMovement) {
        // ОЧЕНЬ МЕДЛЕННОЕ ДВИЖЕНИЕ - минимальная реакция
        cardState.isInSlowMode = true;
        cardState.lastSpeedCategory = 'verySlow';
        
        // Отменяем возврат, если он был запланирован
        if (cardState.returnTimeout) {
          clearTimeout(cardState.returnTimeout);
          cardState.returnTimeout = undefined;
        }

        // Угол направления движения мыши (карточки тянутся ЗА мышью)
        const angle = Math.atan2(deltaY, deltaX);
        const baseForce = (1 - distance / settings.radius) * settings.strength;
        const force = baseForce * speedMultiplier * settings.verySlowForceMultiplier; // Уменьшенная сила

        const offsetX = Math.cos(angle) * force;
        const offsetY = Math.sin(angle) * force;

        // Дополнительно ограничиваем смещение для очень медленного движения
        const verySlowMaxOffset = settings.maxOffset * 0.5; // Максимум 50% от обычного смещения
        const clampedX = Math.max(-verySlowMaxOffset, Math.min(verySlowMaxOffset, offsetX));
        const clampedY = Math.max(-verySlowMaxOffset, Math.min(verySlowMaxOffset, offsetY));

        // Очень плавная анимация для очень медленного движения
        gsap.to(card, {
          x: clampedX,
          y: clampedY,
          rotation: cardState.initialRotation,
          duration: settings.verySlowMoveDuration,
          ease: settings.verySlowMoveEase,
          overwrite: "auto",
        });

      } else if (isSlowMovement) {
        // МЕДЛЕННОЕ ДВИЖЕНИЕ - карточка плавно тянется за курсором
        cardState.isInSlowMode = true;
        cardState.lastSpeedCategory = 'slow';
        
        // Отменяем возврат, если он был запланирован
        if (cardState.returnTimeout) {
          clearTimeout(cardState.returnTimeout);
          cardState.returnTimeout = undefined;
        }

        // Угол направления движения мыши (карточки тянутся ЗА мышью)
        const angle = Math.atan2(deltaY, deltaX);
        const baseForce = (1 - distance / settings.radius) * settings.strength;
        const force = baseForce * speedMultiplier;

        const offsetX = Math.cos(angle) * force;
        const offsetY = Math.sin(angle) * force;

        const clampedX = Math.max(-settings.maxOffset, Math.min(settings.maxOffset, offsetX));
        const clampedY = Math.max(-settings.maxOffset, Math.min(settings.maxOffset, offsetY));

        // Плавно следуем за курсором без возврата, сохраняя начальный поворот
        gsap.to(card, {
          x: clampedX,
          y: clampedY,
          rotation: cardState.initialRotation, // Сохраняем изначальный поворот
          duration: settings.slowMoveDuration,
          ease: settings.slowMoveEase,
          overwrite: "auto",
        });

      } else {
        // БЫСТРОЕ ДВИЖЕНИЕ - оставляем прежнюю логику
        cardState.isInSlowMode = false;
        cardState.lastSpeedCategory = 'fast';
        
        // Отменяем возврат, если он был запланирован
        if (cardState.returnTimeout) {
          clearTimeout(cardState.returnTimeout);
          cardState.returnTimeout = undefined;
        }

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
          rotation: cardState.initialRotation, // Сохраняем изначальный поворот
          duration: settings.pushDuration,
          ease: "power1.out", // Более плавный easing
          overwrite: "auto",
          onComplete: () => {
            // Пружинистый возврат для быстрого движения
            gsap.to(card, {
              x: 0,
              y: 0,
              rotation: cardState.initialRotation, // Возвращаем с изначальным поворотом
              duration: 1.4, // Немного уменьшили для более быстрого возврата
              ease: settings.springEase,
              overwrite: "auto",
            });
          },
        });
      }
    } else {
      // Курсор вне зоны действия карточки
      
      if (cardState.isInSlowMode) {
        // Карточка была в режиме медленного движения - планируем плавный возврат
        cardState.isInSlowMode = false;
        
        // Отменяем предыдущий запланированный возврат
        if (cardState.returnTimeout) {
          clearTimeout(cardState.returnTimeout);
        }
        
        // Получаем задержку в зависимости от последней скорости
        const returnDelay = getReturnDelay(velocity);
        
        // Планируем плавный возврат с динамической задержкой
        cardState.returnTimeout = setTimeout(() => {
          gsap.to(card, {
            x: 0,
            y: 0,
            rotation: cardState.initialRotation, // Возвращаем с изначальным поворотом
            duration: settings.slowReturnDuration,
            ease: settings.slowReturnEase,
            overwrite: "auto",
          });
          cardState.returnTimeout = undefined;
        }, returnDelay);
      }
    }
  });
};

// Сброс позиций всех карточек
const resetCardsPosition = () => {
  cards.forEach((card) => {
    const cardState = slowModeCards.get(card);
    if (cardState?.returnTimeout) {
      clearTimeout(cardState.returnTimeout);
    }
    
    const rotation = cardState?.initialRotation || 0;
    
    gsap.to(card, {
      x: 0,
      y: 0,
      rotation: rotation, // Возвращаем с изначальным поворотом
      duration: 0.6, // Немного увеличили для плавности
      ease: "power1.out", // Более плавный easing
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

// Функция для настройки параметров (можно вызывать из других файлов)
export const updateSettings = (newSettings: Partial<typeof settings>) => {
  Object.assign(settings, newSettings);
};

// Функция для вывода текущих настроек задержек
export const getDelaySettings = () => {
  return {
    fastSpeedReturnDelay: settings.fastSpeedReturnDelay,
    slowSpeedReturnDelay: settings.slowSpeedReturnDelay,
    verySlowSpeedReturnDelay: settings.verySlowSpeedReturnDelay
  };
};

// Инициализация при загрузке
document.addEventListener("DOMContentLoaded", () => {
  // Сначала применяем rotation стили
  applyCardRotations();
  // Затем инициализируем интерактивность
  manageEventListeners();
  // Выводим настройки задержек
  getDelaySettings();
});

// Слушаем изменения размера экрана
window.addEventListener("resize", () => {
  // Обновляем rotation при изменении размера экрана
  applyCardRotations();
  manageEventListeners();
});