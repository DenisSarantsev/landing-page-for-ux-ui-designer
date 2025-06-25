import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

const draggableZone = document.querySelector(".history__draggable-points");
const cards = document.querySelectorAll<HTMLElement>(".work-history-card");

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
			class="history__draggable-point">
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
	translateX = cardNumber * 25;

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


// ---------------- Расставляем карточки
// Получаем точки
const pointsElements = document.querySelectorAll(".history__draggable-point");
const containerRect = draggableZone.getBoundingClientRect();

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
	card.style.top = `${y}px`;
	card.style.left = `${x}px`;
})



// -------- Механика перетаскивания карточек
cards.forEach(card => {
	let startX = 0;
	let isDragging = false;

	card.addEventListener('mousedown', (e) => {
		startX = e.clientX;
		isDragging = true;
	});

	document.addEventListener('mousemove', (e) => {
		if (!isDragging) return;

		const deltaX = e.clientX - startX;
		// Отслеживаем движение влево
		if (deltaX) {
			if ( deltaX <= 0 ) {
				moveCards("left", deltaX, cards[0])
			} else {
				moveCards("right", deltaX, cards[cards.length - 1])
			}
		}
	});

	document.addEventListener('mouseup', () => {
		isDragging = false;
	});
});

const moveCards = (direction: string, delta: number) => {
	console.log(delta, direction)
	const cards = document.querySelectorAll<HTMLElement>('.work-history-card');
	const points = document.querySelectorAll<HTMLElement>('.history__draggable-point');

	[...cards].forEach((card, index) => {
		
	})
}