import { gsap } from "gsap";
import { isMobileScreen } from "./resize";
import { isCardsShow } from "./appearance-animations";

// Контейнер для карточек
const smallCardsContainer = document.querySelector<HTMLElement>(".advantages__cards");
// Контейнер с кнопками
const buttonsContainer = document.querySelector<HTMLElement>(".advantages__items");


// Переключаем на нужные карточки
const showCurrentElement = (section: string, cardsCount: number): void => {
	if (smallCardsContainer) {
		const currentCards = [...smallCardsContainer.children];
		
		// Если есть текущие карточки - анимируем их исчезновение
		if (currentCards.length > 0) {
			gsap.to(currentCards, {
				duration: 0.03,
				opacity: 0,
				scale: 0.8,
				y: -15,
				stagger: 0.01,
				ease: "power2.in",
				onComplete: () => {
					// После исчезновения создаем новые карточки
					smallCardsContainer.innerHTML = "";
					
					// Вставляем нужные карточки
					for (let i = 1; i < cardsCount + 1; i++) {
						smallCardsContainer.insertAdjacentHTML("beforeend", `
							<div style="opacity: 0" class="advantages__card advantage-card">
								<img src="/img/small-cards/${section}-image-${i}.png" alt="project screenshot" class="advantage-card__image">
							</div>
						`)
					}
					
					// Анимируем появление новых карточек
					const allCards = smallCardsContainer.children;
					[...allCards].forEach((card, index) => {
						const centerIndex = (allCards.length - 1) / 2;
						const finalX = (index - centerIndex) * -33;
						
						// Устанавливаем начальное состояние
						gsap.set(card, {
							opacity: 0,
							x: finalX,
							y: 15,
							scale: 1
						});
						
						// Анимируем появление
						gsap.to(card, {
							duration: 0.15,
							delay: index * 0.02,
							opacity: isCardsShow[0],
							y: 0,
							scale: 1,
							ease: "back.out(1.7)"
						});
					});
				}
		});
} else {
		// Если карточек нет - сразу создаем новые
		smallCardsContainer.innerHTML = "";
		
		// Вставляем нужные карточки
		for (let i = 1; i < cardsCount + 1; i++) {
			smallCardsContainer.insertAdjacentHTML("beforeend", `
				<div style="opacity: 0" class="advantages__card advantage-card">
					<img src="/img/small-cards/${section}-image-${i}.png" alt="project screenshot" class="advantage-card__image">
				</div>
			`)
		}
		
		// Анимируем появление карточек
		const allCards = smallCardsContainer.children;
		[...allCards].forEach((card, index) => {
			const centerIndex = (allCards.length - 1) / 2;
			const finalX = (index - centerIndex) * -33;
			gsap.fromTo(card, {
				opacity: 0,
				x: finalX,
				y: 15,
				scale: 1
			}, {
				duration: 0.15,
				delay: index * 0.02,
				opacity: isCardsShow[0],
				y: 0,
				scale: 1,
				ease: "back.out(1.7)"
			});
		});
		}
	}
}


// Первично вызываем функцию и вставляем дефолтные карточки
if ( !isMobileScreen ) {
	showCurrentElement("default-set", 10);
} else {
	showCurrentElement("default-set", 7);
}
window.addEventListener("resize", () => {
	if ( !isMobileScreen ) {
		showCurrentElement("default-set", 10);
	} else {
		showCurrentElement("default-set", 7);
	}
})


// Навешиваем прослушиватель на каждую кнопку (для десктопа и мобайла)
if ( buttonsContainer )
[...buttonsContainer?.children].forEach((button) => {
	// Для десктопа
	button.addEventListener("mouseenter", () => {
		const section = button.getAttribute("id");
		if ( section ) {
			if ( !isMobileScreen ) {
				showCurrentElement(section, 10);
			}
		}
	});
	// Для тачскринов
	button.addEventListener("click", () => {
		const section = button.getAttribute("id");
		if ( section ) {
			if ( isMobileScreen ) {
				showCurrentElement(section, 7);
			}
		}
	})
})

// Анимация при наведении на карточки
smallCardsContainer?.addEventListener("mouseenter", () => {
	if ( !isMobileScreen ) {
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
	}
})
smallCardsContainer?.addEventListener("mouseleave", () => {
	if ( !isMobileScreen ) {
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
	}
})