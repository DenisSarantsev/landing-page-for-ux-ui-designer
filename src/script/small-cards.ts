import { gsap } from "gsap";

// Контейнер для карточек
const smallCardsContainer = document.querySelector<HTMLElement>(".advantages__cards");
// Контейнер с кнопками
const buttonsContainer = document.querySelector<HTMLElement>(".advantages__items");

// Переключаем на нужные карточки
const showCurrentElement = (section: string, cardsCount: number): void => {
	if ( smallCardsContainer ) {
		// Очищаем контейнер
		smallCardsContainer.innerHTML = "";
		// Вставляем нужные карточки
		for ( let i = 1; i < cardsCount + 1; i++  ) {
			/// landing-page-for-ux-ui-designer/dist
			smallCardsContainer.insertAdjacentHTML("beforeend", `
				<div class="advantages__card advantage-card">
					<img src="/landing-page-for-ux-ui-designer/dist/img/small-cards/${section}-image-${i}.png" alt="project screenshot" class="advantage-card__image">
				</div>
			`)
		};
		// Анимируем появление карточек
		const allCards = smallCardsContainer.children;
		[...allCards].forEach((card, index) => {
			// Сторона карточки
			const centerIndex = (allCards.length - 1) / 2;
			gsap.fromTo(card, {
				opacity: 0,
				x: (index - centerIndex) * -33,
			},
			{
				duration: 1.2,
				delay: 0,
				opacity: 1,
				x: (index - centerIndex) * -33,
				ease: "elastic.out(2, 0.7)",
			})
		})
	}
}
// Первично вызываем функцию и вставляем дефолтные карточки
showCurrentElement("default-set", 10);

// Навешиваем прослушиватель на каждую кнопку
if ( buttonsContainer )
[...buttonsContainer?.children].forEach((button) => {
	button.addEventListener("mouseenter", () => {
		const section = button.getAttribute("id");
		if ( section )
		showCurrentElement(section, 10);
	})
})

// Анимация при наведении на карточки
smallCardsContainer?.addEventListener("mouseenter", () => {
	const allCards = smallCardsContainer.children;
		[...allCards].forEach((card, index) => {
			// Сторона карточки
			const centerIndex = (allCards.length - 1) / 2;
			gsap.to(card, {
				duration: 1,
				delay: 0,
				opacity: 1,
				x: (index - centerIndex) * -50,
				ease: "elastic.out(2, 0.7)",
			})
		})
})
smallCardsContainer?.addEventListener("mouseleave", () => {
	const allCards = smallCardsContainer.children;
		[...allCards].forEach((card, index) => {
			// Сторона карточки
			const centerIndex = (allCards.length - 1) / 2;
			gsap.to(card, {
				duration: 1,
				delay: 0,
				opacity: 1,
				x: (index - centerIndex) * -33,
				ease: "elastic.out(2, 0.7)",
			})
		})
})