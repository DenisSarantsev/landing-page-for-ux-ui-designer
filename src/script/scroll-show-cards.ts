import { gsap } from "gsap";

const allFeaturedWorksCards = document.querySelectorAll<HTMLElement>(".work-card__card");

// Проверка направления скролла
let lastScrollY = window.scrollY;

// Эффекты при скролле
const checkScroll = () => {
	window.addEventListener("scroll", () => {
		const currentScrollY = window.scrollY;
    const isScrollingDown = currentScrollY > lastScrollY;
    lastScrollY = currentScrollY;
		// Расстояние от верха вьюпорта до верха докумнета
		const scrollFromTop = window.scrollY;
		// Расстояие от низа вьюпорта до верха документа
		const scrollFromBottom = window.scrollY + window.innerHeight;
		// Пробегаемся по всем элементам и отслеживаем их положение
		[...allFeaturedWorksCards].forEach((card) => {
			// Получаем положение карточки в пространстве
			const rect = card.getBoundingClientRect();
			// Расстояние от верха документа до верха карточки
			const cardTop = rect.top + scrollFromTop;
			// Расстояние от верха документа до низа карточки
			const cardBottom = cardTop + rect.height;
			// Увеличиваем карточки при входе в вьюпорт (скролл снизу вверх)
			if ( cardTop - (rect.height * 1) < scrollFromBottom && cardBottom - (rect.height * 0.5) <= scrollFromTop ) {
				gsap.to(card, {
					duration: 1,
					scale: 1,
					ease: "elastic(0.7, 0.4)",
					transformOrigin: "center bottom",
				});
			}
			// Увеличиваем карточки при входе в вьюпорт (скролл сверху вниз)
			if ( cardTop - (rect.height * 1) < scrollFromBottom + 400 && isScrollingDown ) {
				gsap.to(card, {
					duration: 1,
					scale: 1,
					ease: "elastic(0.7, 0.4)",
					transformOrigin: "center bottom",
				});
			}
			// Уменьшаем карточки при выходе из вьюпорта
			if ( cardTop + rect.height < scrollFromTop || cardTop > scrollFromBottom ) {
				gsap.to(card, {
					duration: 0.5,
					scale: 0.5,
					ease: "power2.out",
					transformOrigin: "center bottom",
				});
			} 

		})
	})
}

// Эффекты при ховерах
const hoverCardEffect = (card: HTMLElement): void => {
	card.addEventListener("mouseenter", () => {
		gsap.to(card, {
			duration: 0.6,
			scale: 1.05,
			ease: "elastic(0.3, 0.1)",
			transformOrigin: "center center",
		});
	})
	card.addEventListener("mouseleave", () => {
		gsap.to(card, {
			duration: 1,
			scale: 1,
			ease: "elastic(0.7, 0.4)",
			transformOrigin: "center center",
		});
	})
}

// Эффекты при нажатиях (кликах)
const activeCardEffect = (card: HTMLElement): void => {
	card.addEventListener("mousedown", () => {
		gsap.to(card, {
			duration: 0.4,
			scale: 1,
			ease: "elastic(0.1, 0.3)",
			transformOrigin: "center center",
		});
	})
	card.addEventListener("mouseup", () => {
		gsap.to(card, {
			duration: 1,
			scale: 1.05,
			ease: "elastic(0.7, 0.4)",
			transformOrigin: "center center",
		});
	})
}


// Первично уменьшаем все элементы
[...allFeaturedWorksCards].forEach((card) => {
	// gsap.to(card, {
	// 	duration: 0.6,
	// 	scale: 0.3,
	// 	ease: "elastic(0.7, 0.4)",
	// 	transformOrigin: "center bottom",
	// });
	hoverCardEffect(card);
	activeCardEffect(card)
})

checkScroll();