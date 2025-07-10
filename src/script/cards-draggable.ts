import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { loadWorkplaces } from "./common";
import { advancedScrollWatcher } from "./scroll-checker";
import { addActualWorkplaceDataToModalWindow } from "./common";

gsap.registerPlugin(Draggable);

// ------------------ Глобальные переменные
// Начал ли пользователь перетаскивать карточки
let isCardsMove: boolean = false;


// Добавляем карточки
const addDesktopWorkCards = async () => {
	// Контейнер для карточек на десктопе
	const desktopWorkCardsWrapper = document.querySelector<HTMLElement>(".history__cards");
	// Если контейнера нет, значит код не выполняем, потому что мы на другой странице
	if ( desktopWorkCardsWrapper ) {
	// Вставляем нужное количество карточек
	const jsonCards = await loadWorkplaces();
	// Выводим карточки в контейнере
	jsonCards.reverse().forEach((card) => {
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

	// Получаем карточки
	const cards = document.querySelectorAll(".desktop-workplace-card");

	// Делаем отступ видежета в зависимости от высоты карточки
	const widget = document.querySelector(".drag-widget");
	if (cards && widget) {
		let cardMaxHeight = 0;
		[...cards].forEach((card) => {
			if ( card instanceof HTMLElement && card.offsetHeight > cardMaxHeight ) cardMaxHeight = card.offsetHeight;
		});
		(widget as HTMLElement).style.marginTop = `${cardMaxHeight + 220}px`;
	};

	// Навешиваем прослушиватели на каждую карточку
	const projectModal = document.querySelector<HTMLElement>(".project-modal");
	[...cards].forEach((card) => {
		if ( card instanceof HTMLElement ) {
			const cardId = card.getAttribute("data-card-id");
			if ( cardId ){
				card.addEventListener("click", () => {
					addActualWorkplaceDataToModalWindow(+cardId);
					const projectModalWrapper = projectModal?.firstElementChild;
					projectModal?.classList.remove("modal-hidden");
					gsap.fromTo(projectModal, {
						opacity: 0
					}, {
						duration: 0.3,
						opacity: 1,
					});
					if ( projectModalWrapper )
					gsap.fromTo(projectModalWrapper, {
						scale: 0.8,
						opacity: 0
					}, {
						delay: 0.15,
						duration: 0.3,
						opacity: 1,
						scale: 1,
						ease: "elastic(1, 1)",
					})
				})
			}
		}
	})

}};

// Создаем точки
const initializeDraggable = async () => {
	const draggableZone = document.querySelector<HTMLElement>(".history__draggable-points");
	const cards = document.querySelectorAll<HTMLElement>(".desktop-workplace-card");

	// Создаем начальные 5 точек
	/*
	for ( let i = 0; i <= 2; i++ ) {
		let top = 10;
		let translateX = 50;

		// Определем координаты
		// Справа
		const translateXRight = translateX + ( i * 25 );
		const translateYRight = top + i * 20;
		// Слева
		const translateXLeft = translateX + ( i * 25 );
		const translateYLeft = top + i * 20;

		console.log(translateXLeft)

		// Добавляем точку в конец массива (справа)
		draggableZone?.insertAdjacentHTML("beforeend", `
			<div 
				style="
					position: absolute;
					top: ${translateYRight}px;
					left: ${translateXRight}px;
					background-color: white;
				"
				class="history__draggable-point ${ i === 0 ? 'center-point' : '' }">
				${i}
			</div>
		`)

		if ( i > 0 ) {
			// Добавляем точку в начало массива (слева)
			draggableZone?.insertAdjacentHTML("afterbegin", `
				<div 
					style="
						position: absolute;
						top: ${translateYLeft}px;
						right: ${translateXLeft}xp;
						background-color: red;
					"
					class="history__draggable-point">
					${i}
				</div>
			`)
		}
	}
	*/

	// Создаем нужное количество точек с обеих сторон ( в зависимости от карточек )
	cards.forEach((card, index) => {
		let top = 26.1;
		let translateX = 0;
		const cardNumber = index + 1;

		// Определем координаты
		top = top + cardNumber * 20;
		translateX = cardNumber * 420;

		// Добавляем точку в конец массива (справа)
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

		// Добавляем точку в начало массива (слева)
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
	// Toчки
	const pointsElements = document.querySelectorAll(".history__draggable-point");
	// ---------------- Расставляем карточки
	// Получаем точки
	if ( draggableZone ) {
		const containerRect = draggableZone?.getBoundingClientRect();
		// Получаем координаты каждой точки
		const points = [...pointsElements].map((el) => {
				const rect = el.getBoundingClientRect();
				return {
						x: rect.left - containerRect.left + rect.width / 2,
						y: rect.top - containerRect.top + rect.height / 2
				};
		});
		// Пробегаемся по карточкам и расставляем их по точкам
		cards.forEach((card, index) => {
			const x = points.reverse()[index].x;
			const y = points.reverse()[index].y;
			card.style.transform = `translateX(${x - card.offsetWidth / 2}px) translateY(${y}px)`;
		})
	}
}

// ------ Механика перетаскивания карточек
// Тип для хранения смещений карточек
interface CardOffset {
    x: number;
    y: number;
}
// Глобально храним смещения для каждой карточки
const cardOffsets: CardOffset[] = [];
// Навешиваем прослушиватели на карточки
const addEventsToCards = async (): Promise<void> => {
		const cards = document.querySelectorAll<HTMLElement>(".desktop-workplace-card");
    if (cards) {
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
					// Запоминаем координаты всех карточек
					cardOffsets.push({
						x: startTranslateX,
						y: startTranslateY
					})
			});
			[...cards].forEach((card) => {
				card.addEventListener("mousedown", (event: MouseEvent) => {
						// Останавливаем все активные анимации на карточках
						gsap.killTweensOf(cards);
						
						// Добавляем класс для CSS
						card.classList.add('dragging');
						// Сохраняем текущее положение карточек
						updateCardOffsetsFromCurrentPosition()

						const startX = event.clientX;
						// Объявляем обработчик как отдельную переменную
						const mouseMoveHandler = (moveEvent: MouseEvent) => {
							isCardsMove = true;
							// Текущий сдвиг по горизонтали
							const deltaX: number = moveEvent.clientX - startX;
							moveCards(deltaX, "drag")
						};
						// Поднятие мышки
						const mouseUpHandler = () => {
							document.removeEventListener("mousemove", mouseMoveHandler);
							document.removeEventListener("mouseup", mouseUpHandler);
							moveCardsToPoints();
						};
						document.addEventListener("mousemove", mouseMoveHandler);
						document.addEventListener("mouseup", mouseUpHandler);
				});
			});
		}
};

// Передвигаем карточки относительно стартового положения
const moveCards = (deltaX: number, listenerType: string) => {
	const cards = document.querySelectorAll<HTMLElement>(".desktop-workplace-card");
	[...cards].forEach((card, index) => {
		// Стартовые точки
		const startTranslateX = cardOffsets[index].x || 0;
		const startTranslateY = cardOffsets[index].y || 0;

		// Текущее смещение по горизонтали
		const currentTranslateX = startTranslateX + deltaX;
		const currentTranslateY = computeVerticalTranslate(currentTranslateX);

		// Вычисляем прозрачность
		const currentOpacity = computeOpacity(currentTranslateX);

		gsap.to(card, {
			x: currentTranslateX,
			y: currentTranslateY,
			opacity: currentOpacity,
			duration: listenerType === "scroll" ? 0.7 : 0.02,
			delay: 0.1
		});


	})
}

// Доводим карточки до слотов при отпускании
const moveCardsToPoints = () => {
	const cards = document.querySelectorAll<HTMLElement>(".desktop-workplace-card");
	const draggableZone = document.querySelector<HTMLElement>(".history__draggable-points");
	
	if (!draggableZone) return;
	
	// Параметры
	const cardWidth = [...cards][0].offsetWidth;
	const centerX = draggableZone.offsetWidth / 2 - (cardWidth / 2);
	const slotSpacing = 420; // Расстояние между слотами
	
	// Находим ближайшую карточку к центру
	const centerCardIndex = findClosestCardToCenter(cards, centerX);
	
	// Анимируем все карточки в их новые позиции
	animateCardsToSlots(cards, centerCardIndex, centerX, slotSpacing);
	
	// Обновляем координаты после анимации
	setTimeout(() => {
		updateCardOffsetsFromCurrentPosition();
		isCardsMove = false;
	}, 800); // Время анимации + буфер
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
		
		// Расстояние от центра карточки до центра экрана
		const distance = Math.abs(currentX - centerX);
		
		if (distance < minDistance) {
			minDistance = distance;
			closestIndex = index;
		}
	});
	return closestIndex;
};

// Анимируем все карточки в слоты с защитой от дергания
const animateCardsToSlots = (
	cards: NodeListOf<HTMLElement>, 
	centerCardIndex: number, 
	centerX: number, 
	slotSpacing: number
) => {
	const cardsArray = [...cards].reverse();
	const reversedCenterCardIndex = cardsArray.length - 1 - centerCardIndex;
	
	// Останавливаем все активные анимации
	gsap.killTweensOf(cardsArray);
	
	cardsArray.forEach((card, cardIndex) => {
		const slotOffset = (cardIndex - reversedCenterCardIndex) * slotSpacing;
		const targetX = centerX + slotOffset;
		const targetY = computeVerticalTranslate(targetX);
		const targetOpacity = computeOpacity(targetX); // Вычисляем финальную прозрачность
		
		// Простая анимация без onUpdate
		gsap.to(card, {
			x: targetX,
			y: targetY,
			opacity: targetOpacity,
			duration: 0.3,
			ease: "power2.out", // Более плавный easing
			onComplete: () => {
				// Обновляем cardOffsets только после завершения анимации
				if (cardIndex === 0) { // Обновляем только один раз
					setTimeout(() => {
						updateCardOffsetsFromCurrentPosition();
						isCardsMove = false;
					}, 50);
				}
			}
		});
	});
};

// Смещаем карточки по вертикали в зависимости от смещения по горизонтали
const computeVerticalTranslate = (x: number): number => {
	const draggableZone = document.querySelector<HTMLElement>(".history__draggable-points");
	const cards = document.querySelectorAll<HTMLElement>(".desktop-workplace-card");
	// Находим центр вьюпорта
	const cardWidth: number = [...cards][0].offsetWidth;
	const windowCenter = (draggableZone instanceof HTMLElement)
  ? draggableZone.offsetWidth / 2 - ( cardWidth / 2 )
  : 0;
	// Расстояние карточки от центра
	const gapByCenter = x - windowCenter;
	// Считаем смещение вверх
	let currentY: number = 0;
	if ( gapByCenter < 300 && gapByCenter > 0 ) {
		// Процент смещения до центра (в десятых от единицы)
		const currentPercent = gapByCenter / 300;
		currentY = ((Math.abs(gapByCenter) / 3) * 0.8) * currentPercent;
	} else if ( gapByCenter <= 0 ) {
		currentY = ((Math.abs(gapByCenter) / 3) * 0.5);
	} else {
		currentY = (Math.abs(gapByCenter) / 3) * 0.8;
	}
	// Возвращаем
	return currentY
}

// Движение карточек при помощи скролла
const moveCardsByScroll = async () => {
	const cards = document.querySelectorAll<HTMLElement>(".desktop-workplace-card");
	// Получаем первую карточку
	const firstCard = cards[[...cards].length - 1];
	// Получаем расстояние от центра карточки до центра вьюпорта
	const rect = firstCard.getBoundingClientRect();
	// Получаем середину вьюпорта
	const center = window.innerWidth / 2;
	// Стартовая дельта
  const initialDeltaX: number = rect.left - center + (rect.width / 2); 
	// Текущая дельта (для сравнения, чтобы карточки не двигались назад при обратном скролле)
	let currentDeltaX: number = initialDeltaX;
	// Прослушиватель
	advancedScrollWatcher.watch({
		selector: '.history__draggable-zone',
		onScroll: (element, data) => {
			if ( !isCardsMove && data.scrolledPercentage > 0 ) {
				let newDeltaX = -(initialDeltaX - calculateDeltaX(data.scrolledPercentage, initialDeltaX));
				console.log(newDeltaX, currentDeltaX)
				if ( newDeltaX < currentDeltaX ) {
					console.log("OK")
					currentDeltaX = newDeltaX;
					moveCards(newDeltaX, "scroll")
				}
			}
		}
	});
}

// Функция для вычисления deltaX в зависимости от процента прокрутки
const calculateDeltaX = (scrolledPercentage: number, initialDeltaX: number): number => {
	// Максимальный процент прокрутки для достижения deltaX = 0
	const maxScrollPercentage = 35;
	
	if (scrolledPercentage >= maxScrollPercentage) {
		// При прокрутке 40% и выше deltaX = 0
		return 0;
	}
	
	// Линейное уменьшение от initialDeltaX до 0
	const progress = scrolledPercentage / maxScrollPercentage; // 0 to 1
	const currentDeltaX = initialDeltaX * (1 - progress);
	
	return currentDeltaX;
}


// Обновляем координаты из текущего положения карточек
const updateCardOffsetsFromCurrentPosition = () => {
	const cards = document.querySelectorAll<HTMLElement>(".desktop-workplace-card");
	cardOffsets.length = 0; // Очищаем массив
	
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

// Вычисляем прозрачность карточки в зависимости от расстояния до центра
const computeOpacity = (x: number): number => {
	const draggableZone = document.querySelector<HTMLElement>(".history__draggable-points");
	const cards = document.querySelectorAll<HTMLElement>(".desktop-workplace-card");
	
	if (!draggableZone || !cards.length) return 1;

	// Находим центр вьюпорта
	const cardWidth: number = [...cards][0].offsetWidth;
	const windowCenter = draggableZone.offsetWidth / 2 - (cardWidth / 2);
	// Расстояние карточки от центра (абсолютное)
	const gapByCenter = Math.abs(x - windowCenter);
	
	// Параметры прозрачности
	const slotSpacing = 420; // Расстояние между карточками
	const opaqueSlots = 3; // Количество полностью видимых карточек от центра (включая центральную)
	const fadeStartDistance = slotSpacing * opaqueSlots; // Расстояние, с которого начинается затухание
	const maxDistance = 2000; // Максимальное расстояние затухания
	const minOpacity = 0; // Минимальная прозрачность
	const centerOpacity = 1; // Прозрачность в центре
	
	// Если карточка в зоне полной видимости (центр + 2 карточки в каждую сторону)
	if (gapByCenter <= fadeStartDistance) {
		return centerOpacity; // Полностью видимая
	}
	
	// Вычисляем прозрачность для карточек за пределами зоны полной видимости
	const fadeDistance = gapByCenter - fadeStartDistance; // Расстояние от начала зоны затухания
	const maxFadeDistance = maxDistance - fadeStartDistance; // Максимальное расстояние затухания
	
	if (fadeDistance <= maxFadeDistance) {
		// Линейное уменьшение от полной видимости до минимальной
		const distancePercent = fadeDistance / maxFadeDistance; // 0 to 1
		const opacity = centerOpacity - (distancePercent * (centerOpacity - minOpacity));
		return Math.max(minOpacity, opacity);
	} else {
		// За пределами максимального расстояния - минимальная прозрачность
		return minOpacity;
	}
};

// Функция для выполнения события клика


document.addEventListener("DOMContentLoaded", () => {
addDesktopWorkCards()
.then(() => initializeDraggable()
.then(() => addCards()
.then(() => addEventsToCards()
.then(() => moveCardsByScroll()
))))
})

