import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { loadWorkplaces } from "./common";
import { advancedScrollWatcher } from "./scroll-checker";
import { addActualWorkplaceDataToModalWindow } from "./common";

gsap.registerPlugin(Draggable);

// ------------------ Глобальные переменные
let isCardsMove: boolean = false;
let isDragging: boolean = false;
let dragStartTime: number = 0;
let dragDistance: number = 0;

// Дополнительные переменные для инерции
let velocityX: number = 0;
let lastMoveTime: number = 0;
let lastMoveX: number = 0;
const velocityHistory: Array<{x: number, time: number}> = [];
const maxVelocityHistory = 5;

// Добавляем карточки
const addDesktopWorkCards = async () => {
    const desktopWorkCardsWrapper = document.querySelector<HTMLElement>(".history__cards");
    if (desktopWorkCardsWrapper) {
        const jsonCards = await loadWorkplaces();
        jsonCards.forEach((card) => {
            desktopWorkCardsWrapper.insertAdjacentHTML("beforeend", `
                <div data-card-id=${card.id} class="history__card work-history-card desktop-workplace-card">
                    <div class="work-history-card__wrapper">
                        <div class="work-history-card__top">
                            <h3 class="work-history-card__title">${card.post}</h3>
                            <div class="work-history-card__subtitle">${card.formate}</div>
                        </div>
                        <div class="work-history-card__info">
                            <img src="/img/workplace/${card.id}/company-logo.png" alt="company logo" class="work-history-card__info_image">
                            <div class="work-history-card__info_data">
                                <div class="work-history-card__info_company-name">${card.company}</div>
                                <div class="work-history-card__info_address">${card["company-address"]}</div>
                            </div>
                        </div>
                        <div class="work-history-card__period">
                            <div class="work-history-card__period_title">From</div>
                            <div class="work-history-card__period_subtitle">${card.period.from}</div>
                        </div>
                        <div class="work-history-card__period">
                            <div class="work-history-card__period_title">To</div>
                            <div class="work-history-card__period_subtitle">${card.period.to}</div>
                        </div>
                    </div>
                </div>
            `);
        });

        // Делаем отступ виджета
        const widget = document.querySelector(".drag-widget");
        const cards = document.querySelectorAll(".desktop-workplace-card");
        if (cards && widget) {
            let cardMaxHeight = 0;
            [...cards].forEach((card) => {
                if (card instanceof HTMLElement && card.offsetHeight > cardMaxHeight) cardMaxHeight = card.offsetHeight;
            });
            (widget as HTMLElement).style.marginTop = `${cardMaxHeight + 220}px`;
        }
    }
};

// Создаем точки
const initializeDraggable = async () => {
    const draggableZone = document.querySelector<HTMLElement>(".history__draggable-points");
    const cards = document.querySelectorAll<HTMLElement>(".desktop-workplace-card");

    cards.forEach((card, index) => {
        let top = 26.1;
        let translateX = 0;
        const cardNumber = index + 1;

        top = top + cardNumber * 20;
        translateX = cardNumber * 420;

        draggableZone?.insertAdjacentHTML("beforeend", `
            <div 
                style="
                    position: absolute;
                    top: ${top}%;
                    right: -${translateX}px;
                "
                class="history__draggable-point">
            </div>
        `)

        draggableZone?.insertAdjacentHTML("afterbegin", `
            <div 
                style="
                    position: absolute;
                    top: ${top}%;
                    left: -${translateX}px;
                "
                class="history__draggable-point">
            </div>
        `)
    })
};

// Расставляем карточки по точкам
const addCards = async () => {
    const draggableZone = document.querySelector<HTMLElement>(".history__draggable-points");
    const cards = document.querySelectorAll<HTMLElement>(".desktop-workplace-card");
    const pointsElements = document.querySelectorAll(".history__draggable-point");

    if (draggableZone) {
        const containerRect = draggableZone?.getBoundingClientRect();
        const points = [...pointsElements].map((el) => {
            const rect = el.getBoundingClientRect();
            return {
                x: rect.left - containerRect.left + rect.width / 2,
                y: rect.top - containerRect.top + rect.height / 2
            };
        });

        cards.forEach((card, index) => {
            const x = points.reverse()[index].x;
            const y = points.reverse()[index].y;
            card.style.transform = `translateX(${x - card.offsetWidth / 2}px) translateY(${y}px)`;
        })
    }
}

// Тип для хранения смещений карточек
interface CardOffset {
    x: number;
    y: number;
}

const cardOffsets: CardOffset[] = [];

// Новая функция для добавления событий перетаскивания на весь блок с инерцией
const addDragEventsToBlock = async (): Promise<void> => {
    const draggableZone = document.querySelector<HTMLElement>(".history__wrapper");
    const cards = document.querySelectorAll<HTMLElement>(".desktop-workplace-card");
    
    if (!draggableZone || !cards.length) return;

    // Записываем координаты каждой карточки
    [...cards].forEach((card) => {
        const matrix = getComputedStyle(card).transform;
        let startTranslateX = 0;
        let startTranslateY = 0;
        if (matrix && matrix !== "none") {
            const match = matrix.match(/matrix.*\((.+)\)/);
            if (match) {
                const values = match[1].split(', ');
                startTranslateX = parseFloat(values[4]);
                startTranslateY = parseFloat(values[5]);
            }
        }
        cardOffsets.push({
            x: startTranslateX,
            y: startTranslateY
        })
    });

    // Обработчик mousedown на всём блоке .history__wrapper
    draggableZone.addEventListener("mousedown", (event: MouseEvent) => {
        // Проверяем, что клик не был на карточке (для клика по карточкам)
        const clickedCard = (event.target as HTMLElement).closest('.desktop-workplace-card');
        
        // Сброс флагов перетаскивания и инерции
        isDragging = false;
        dragDistance = 0;
        dragStartTime = Date.now();
        velocityX = 0;
        velocityHistory.length = 0;
        
        // Останавливаем все активные анимации на карточках
        gsap.killTweensOf(cards);
        
        // Добавляем класс для CSS на весь блок
        draggableZone.classList.add('dragging');
        
        // Сохраняем текущее положение карточек
        updateCardOffsetsFromCurrentPosition();

        const startX = event.clientX;
        const startY = event.clientY;
        lastMoveX = startX;
        lastMoveTime = Date.now();
        
        // Объявляем обработчик перемещения мыши
        const mouseMoveHandler = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;
            const currentTime = Date.now();
            
            // Вычисляем скорость
            const timeDelta = currentTime - lastMoveTime;
            if (timeDelta > 0) {
                const currentVelocityX = (moveEvent.clientX - lastMoveX) / timeDelta;
                
                // Добавляем в историю скоростей
                velocityHistory.push({
                    x: currentVelocityX,
                    time: currentTime
                });
                
                // Ограничиваем размер истории
                if (velocityHistory.length > maxVelocityHistory) {
                    velocityHistory.shift();
                }
                
                lastMoveX = moveEvent.clientX;
                lastMoveTime = currentTime;
            }
            
            // Вычисляем общее расстояние перетаскивания
            dragDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            // Если перетащили более чем на 5 пикселей, считаем это перетаскиванием
            if (dragDistance > 5) {
                isDragging = true;
                isCardsMove = true;
                moveCards(deltaX, "drag");
            }
        };
        
        // Обработчик поднятия мыши
        const mouseUpHandler = () => {
            document.removeEventListener("mousemove", mouseMoveHandler);
            document.removeEventListener("mouseup", mouseUpHandler);
            
            draggableZone.classList.remove('dragging');
            
            // Если было перетаскивание, применяем инерцию
            if (isDragging) {
                applyInertia();
            } else if (clickedCard) {
                // Если это был клик по карточке без перетаскивания, открываем модальное окно
                handleCardClick(clickedCard as HTMLElement);
            }
            
            // Сбрасываем флаг перетаскивания через небольшую задержку
            setTimeout(() => {
                isDragging = false;
                isCardsMove = false;
            }, 100);
        };
        
        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);
    });

    // Добавляем обработчики клика только для карточек
    [...cards].forEach((card) => {
        card.addEventListener("click", (event: MouseEvent) => {
            // Предотвращаем клик если было перетаскивание
            if (isDragging || dragDistance > 5) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            
            // Дополнительная проверка по времени
            if (Date.now() - dragStartTime < 200 && dragDistance > 3) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            
            // Обрабатываем клик
            handleCardClick(card);
        });
    });
};

// Функция для применения инерции
const applyInertia = () => {
    // Вычисляем среднюю скорость из последних движений
    if (velocityHistory.length === 0) {
        moveCardsToPoints();
        return;
    }
    
    // Фильтруем недавние движения (за последние 100мс)
    const currentTime = Date.now();
    const recentVelocities = velocityHistory.filter(v => currentTime - v.time < 100);
    
    if (recentVelocities.length === 0) {
        moveCardsToPoints();
        return;
    }
    
    // Вычисляем среднюю скорость
    const avgVelocity = recentVelocities.reduce((sum, v) => sum + v.x, 0) / recentVelocities.length;
    
    // Определяем силу инерции
    const minVelocity = 0.5; // Минимальная скорость для инерции
    const maxVelocity = 5; // Максимальная учитываемая скорость
    const clampedVelocity = Math.max(-maxVelocity, Math.min(maxVelocity, avgVelocity));
    
    if (Math.abs(clampedVelocity) < minVelocity) {
        moveCardsToPoints();
        return;
    }
    
    // Вычисляем расстояние инерции
    const slotSpacing = 420;
    const velocityMultiplier = 300; // Коэффициент для преобразования скорости в расстояние
    const inertiaDistance = clampedVelocity * velocityMultiplier;
    
    // Определяем количество карточек для пролистывания
    const cardsToSkip = Math.round(Math.abs(inertiaDistance) / slotSpacing);
    const maxCardsToSkip = 3; // Максимум карточек для пролистывания
    const finalCardsToSkip = Math.min(cardsToSkip, maxCardsToSkip);
    
    // Применяем инерцию
    applyInertiaMovement(inertiaDistance, finalCardsToSkip);
};

// Функция для применения движения с инерцией
const applyInertiaMovement = (inertiaDistance: number, cardsToSkip: number) => {
    const cards = document.querySelectorAll<HTMLElement>(".desktop-workplace-card");
    
    // Анимируем карточки с инерцией
    [...cards].forEach((card, index) => {
        const startTranslateX = cardOffsets[index].x || 0;
        const startTranslateY = cardOffsets[index].y || 0;
        
        // Рассчитываем промежуточное положение с инерцией
        const intermediateX = startTranslateX + inertiaDistance;
        const intermediateY = computeVerticalTranslate(intermediateX);
        const intermediateOpacity = computeOpacity(intermediateX);
        
        // Первая фаза: движение с инерцией
        gsap.to(card, {
            x: intermediateX,
            y: intermediateY,
            opacity: intermediateOpacity,
            duration: 0.6,
            ease: "power2.out",
            onComplete: () => {
                // Обновляем позиции после инерции
                updateCardOffsetsFromCurrentPosition();
                
                // Затем доводим до ближайших слотов
                setTimeout(() => {
                    moveCardsToPoints();
                }, 50);
            }
        });
    });
};

// Функция для обработки клика по карточке
const handleCardClick = (card: HTMLElement) => {
    const cardId = card.getAttribute("data-card-id");
    if (cardId) {
        const projectModal = document.querySelector<HTMLElement>(".project-modal");
        addActualWorkplaceDataToModalWindow(+cardId);
        const projectModalWrapper = projectModal?.firstElementChild;
        projectModal?.classList.remove("modal-hidden");
        gsap.fromTo(projectModal, {
            opacity: 0
        }, {
            duration: 0.3,
            opacity: 1,
        });
        if (projectModalWrapper) {
            gsap.fromTo(projectModalWrapper, {
                scale: 0.8,
                opacity: 0
            }, {
                delay: 0.15,
                duration: 0.3,
                opacity: 1,
                scale: 1,
                ease: "elastic(1, 1)",
            });
        }
    }
};

// Передвигаем карточки относительно стартового положения
const moveCards = (deltaX: number, listenerType: string) => {
    const cards = document.querySelectorAll<HTMLElement>(".desktop-workplace-card");
    [...cards].forEach((card, index) => {
        const startTranslateX = cardOffsets[index].x || 0;
        const startTranslateY = cardOffsets[index].y || 0;

        const currentTranslateX = startTranslateX + deltaX;
        const currentTranslateY = computeVerticalTranslate(currentTranslateX);
        const currentOpacity = computeOpacity(currentTranslateX);

        gsap.to(card, {
            x: currentTranslateX,
            y: currentTranslateY,
            opacity: currentOpacity,
            duration: listenerType === "scroll" ? 0.7 : 0.02,
            delay: 0.02
        });
    })
}

// Доработанная функция для доведения карточек до слотов
const moveCardsToPoints = () => {
    const cards = document.querySelectorAll<HTMLElement>(".desktop-workplace-card");
    const draggableZone = document.querySelector<HTMLElement>(".history__draggable-points");
    
    if (!draggableZone) return;
    
    const cardWidth = [...cards][0].offsetWidth;
    const centerX = draggableZone.offsetWidth / 2 - (cardWidth / 2);
    const slotSpacing = 420;
    
    const centerCardIndex = findClosestCardToCenter(cards, centerX);
    animateCardsToSlots(cards, centerCardIndex, centerX, slotSpacing);
    
    setTimeout(() => {
        updateCardOffsetsFromCurrentPosition();
        isCardsMove = false;
        isDragging = false;
        velocityX = 0;
        velocityHistory.length = 0;
    }, 800);
};

// Находим карточку, ближайшую к центру
const findClosestCardToCenter = (cards: NodeListOf<HTMLElement>, centerX: number): number => {
    let closestIndex = 0;
    let minDistance = Infinity;
    
    [...cards].forEach((card, index) => {
        const matrix = getComputedStyle(card).transform;
        let currentX = 0;
        
        if (matrix && matrix !== "none") {
            const match = matrix.match(/matrix.*\((.+)\)/);
            if (match) {
                const values = match[1].split(', ');
                currentX = parseFloat(values[4]);
            }
        }
        
        const distance = Math.abs(currentX - centerX);
        
        if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
        }
    });
    return closestIndex;
};

// Анимируем все карточки в слоты
const animateCardsToSlots = (
    cards: NodeListOf<HTMLElement>, 
    centerCardIndex: number, 
    centerX: number, 
    slotSpacing: number
) => {
    const cardsArray = [...cards].reverse();
    const reversedCenterCardIndex = cardsArray.length - 1 - centerCardIndex;
    
    gsap.killTweensOf(cardsArray);
    
    cardsArray.forEach((card, cardIndex) => {
        const slotOffset = (cardIndex - reversedCenterCardIndex) * slotSpacing;
        const targetX = centerX + slotOffset;
        const targetY = computeVerticalTranslate(targetX);
        const targetOpacity = computeOpacity(targetX);
        
        gsap.to(card, {
            x: targetX,
            y: targetY,
            opacity: targetOpacity,
            duration: 0.3,
            ease: "power2.out",
            onComplete: () => {
                if (cardIndex === 0) {
                    setTimeout(() => {
                        updateCardOffsetsFromCurrentPosition();
                        isCardsMove = false;
                    }, 50);
                }
            }
        });
    });
};

// Остальные функции остаются без изменений...
const computeVerticalTranslate = (x: number): number => {
    const draggableZone = document.querySelector<HTMLElement>(".history__draggable-points");
    const cards = document.querySelectorAll<HTMLElement>(".desktop-workplace-card");
    const cardWidth: number = [...cards][0].offsetWidth;
    const windowCenter = (draggableZone instanceof HTMLElement)
        ? draggableZone.offsetWidth / 2 - (cardWidth / 2)
        : 0;
    const gapByCenter = x - windowCenter;
    let currentY: number = 0;
    
    if (gapByCenter < 300 && gapByCenter > 0) {
        const currentPercent = gapByCenter / 300;
        currentY = ((Math.abs(gapByCenter) / 3) * 0.8) * currentPercent;
    } else if (gapByCenter <= 0) {
        currentY = ((Math.abs(gapByCenter) / 3) * 0.5);
    } else {
        currentY = (Math.abs(gapByCenter) / 3) * 0.8;
    }
    
    return currentY;
}

const moveCardsByScroll = async () => {
    const cards = document.querySelectorAll<HTMLElement>(".desktop-workplace-card");
    const firstCard = cards[[...cards].length - 1];
    const rect = firstCard.getBoundingClientRect();
    const center = window.innerWidth / 2;
    const initialDeltaX: number = rect.left - center + (rect.width / 2);
    let currentDeltaX: number = initialDeltaX;
    
    advancedScrollWatcher.watch({
        selector: '.history__draggable-zone',
        onScroll: (element, data) => {
            if (!isCardsMove && data.scrolledPercentage > 0) {
                let newDeltaX = -(initialDeltaX - calculateDeltaX(data.scrolledPercentage, initialDeltaX));
                const rectCard = firstCard.getBoundingClientRect();
                const leftToCenter = (rectCard.x + (rectCard.width / 2)) - center;
                
                if (leftToCenter < 20) {
                    moveCardsToPoints();
                } else if (newDeltaX < currentDeltaX) {
                    currentDeltaX = newDeltaX;
                    moveCards(newDeltaX, "scroll")
                }
            }
        }
    });
}

const calculateDeltaX = (scrolledPercentage: number, initialDeltaX: number): number => {
    const maxScrollPercentage = 25;
    
    if (scrolledPercentage >= maxScrollPercentage) {
        return 0;
    }
    
    const progress = scrolledPercentage / maxScrollPercentage;
    let currentDeltaX = initialDeltaX * (1 - progress);

    if (currentDeltaX < 10) currentDeltaX = 0;
    return currentDeltaX;
}

const updateCardOffsetsFromCurrentPosition = () => {
    const cards = document.querySelectorAll<HTMLElement>(".desktop-workplace-card");
    cardOffsets.length = 0;
    
    [...cards].forEach((card) => {
        const matrix = getComputedStyle(card).transform;
        let currentTranslateX = 0;
        let currentTranslateY = 0;
        
        if (matrix && matrix !== "none") {
            const match = matrix.match(/matrix.*\((.+)\)/);
            if (match) {
                const values = match[1].split(', ');
                currentTranslateX = parseFloat(values[4]);
                currentTranslateY = parseFloat(values[5]);
            }
        }
        
        cardOffsets.push({
            x: currentTranslateX,
            y: currentTranslateY
        });
    });
};

const computeOpacity = (x: number): number => {
    const draggableZone = document.querySelector<HTMLElement>(".history__draggable-points");
    const cards = document.querySelectorAll<HTMLElement>(".desktop-workplace-card");
    
    if (!draggableZone || !cards.length) return 1;

    const cardWidth: number = [...cards][0].offsetWidth;
    const windowCenter = draggableZone.offsetWidth / 2 - (cardWidth / 2);
    const gapByCenter = Math.abs(x - windowCenter);
    
    const slotSpacing = 420;
    const opaqueSlots = 3;
    const fadeStartDistance = slotSpacing * opaqueSlots;
    const maxDistance = 2000;
    const minOpacity = 0;
    const centerOpacity = 1;
    
    if (gapByCenter <= fadeStartDistance) {
        return centerOpacity;
    }
    
    const fadeDistance = gapByCenter - fadeStartDistance;
    const maxFadeDistance = maxDistance - fadeStartDistance;
    
    if (fadeDistance <= maxFadeDistance) {
        const distancePercent = fadeDistance / maxFadeDistance;
        const opacity = centerOpacity - (distancePercent * (centerOpacity - minOpacity));
        return Math.max(minOpacity, opacity);
    } else {
        return minOpacity;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    addDesktopWorkCards()
        .then(() => initializeDraggable())
        .then(() => addCards())
        .then(() => addDragEventsToBlock())
        .then(() => moveCardsByScroll())
})