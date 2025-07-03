import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { loadWorkplaces } from "./common";

gsap.registerPlugin(Draggable);

// Контейнер для карточек на десктопе
const desktopWorkCardsWrapper = document.querySelector<HTMLElement>(".history__cards");
// Если контейнера нет, значит код не выполняем, потому что мы на другой странице
if ( desktopWorkCardsWrapper ) {
// Вставляем нужное количество карточек
const jsonCards = await loadWorkplaces();
// Выводим карточки в контейнере
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
	`)
})

const draggableZone = document.querySelector<HTMLElement>(".history__draggable-points");
const cards = document.querySelectorAll<HTMLElement>(".desktop-workplace-card");

// Создаем начальные 5 точек
for ( let i = 0; i <= 2; i++ ) {
	let top = 10;
	let translateX = 50;

	// Определем координаты
	top = top + i * 20;
	translateX = translateX + ( i * 25 );

	// Добавляем точку в конец массива (справа)
	draggableZone?.insertAdjacentHTML("beforeend", `
		<div 
			style="
				position: absolute;
				top: ${top}%;
				left: ${translateX}%;
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
					top: ${top}%;
					right: ${translateX}%;
					background-color: red;
				"
				class="history__draggable-point">
							${i}
			</div>
		`)
	}
}

// Создаем нужное количество точек с обеих сторон ( в зависимости от карточек )
cards.forEach((card, index) => {
	let top = 50;
	let translateX = 0;
	const cardNumber = index + 1;

	// Определем координаты
	top = top + cardNumber * 20;
	translateX = cardNumber * 30;

	// Добавляем точку в конец массива (справа)
	draggableZone?.insertAdjacentHTML("beforeend", `
		<div 
			style="
				position: absolute;
				top: ${top}%;
				right: -${translateX}%;
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
				left: -${translateX}%;
			"
			class="history__draggable-point">
		</div>
	`)
})

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


// -------- Механика перетаскивания карточек
// Тип для хранения смещений карточек
interface CardOffset {
    x: number;
    y: number;
}
// Глобально храним смещения для каждой карточки
const cardOffsets: CardOffset[] = [];
// Навешиваем прослушиватели на карточки
const addEventsToCards = (): void => {
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
						const startX = event.clientX;
						// Получаем текущее смещение (translateX) карточки
						
						// Объявляем обработчик как отдельную переменную
						const mouseMoveHandler = (moveEvent: MouseEvent) => {
							// Текущий сдвиг по горизонтали
							const deltaX: number = moveEvent.clientX - startX;
							moveCards(deltaX)
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
addEventsToCards();

// Передвигаем карточки относительно стартового положения
const moveCards = (deltaX: number) => {
	[...cards].forEach((card, index) => {
		// Стартовые точки
		const startTranslateX = cardOffsets[index].x || 0;
		const startTranslateY = cardOffsets[index].y || 0;

		// Текущее смещение по горизонтали
		const currentTranslateX = startTranslateX + deltaX;
		const currentTranslateY = computeVerticalTranslate(currentTranslateX);

		card.style.transform = `
			translateX(${currentTranslateX}px) translateY(${currentTranslateY}px)
		`;
	})

}

// Доводим карточки до точек при отпускании
const moveCardsToPoints = () => {
	// Очищаем старые координаты
	cardOffsets.length = 0;
	// Записываем новые координаты
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
};

// Смещаем карточки по вертикали в зависимости от смещения по горизонтали
const computeVerticalTranslate = (x: number): number => {
	// Находим центр вьюпорта
	const cardWidth: number = [...cards][0].offsetWidth;
	const windowCenter = (draggableZone instanceof HTMLElement)
  ? draggableZone.offsetWidth / 2 - ( cardWidth / 2 )
  : 0;
	// Расстояние карточки от центра
	const gapByCenter = x - windowCenter;
	// Считаем смещение вверх
	const currentY = (Math.abs(gapByCenter) / 3) * 1.6;
	// Возвращаем
	return currentY
}
}