import { gsap } from "gsap";
import { advancedScrollWatcher } from "./scroll-checker";

// Получаем все слайды
const allSlides = document.querySelectorAll<HTMLElement>(".about__slide");
let oldIndex: number = 0;
let newIndex: number = 1;

// Анимации скрытия/показа слайда
function showSlide(oldIndex: number, newIndex: number) {
	const newSlide = allSlides[newIndex];
	const oldSlide = allSlides[oldIndex];

	if (!newSlide || !oldSlide) {
		return;
	}

	// Сначала анимируем исчезновение старого
	gsap.to(oldSlide, {
		duration: 0.15,
		opacity: 0,
		onComplete: () => {
			// Скрываем старый слайд
			oldSlide.style.display = "none";
		}
	})

	// Делаем новый слайд видимым и полностью непрозрачным
	newSlide.style.display = "flex";
	newSlide.style.opacity = "1";
	newSlide.classList.remove("hidden-slide");
	// Проверка на наличие дочерних элементов
	if ( !newSlide.firstElementChild ) return 
	// Показываем текст
	gsap.fromTo(
		".about__text span",
		{ clipPath: "inset(0 100% 0 0)" }, // Сначала полностью скрыто справа
		{ 
			clipPath: "inset(0 0% 0 0)",     // Полностью видно
			duration: 1,
			ease: "power2.out"
		}
	);
	// Показываем градиент
	gsap.fromTo(
		".about__slide-gradient",
		{ opacity: 0 }, // Сначала полностью скрыто справа
		{ 
			opacity: 1,
			duration: 1
		}
	);
	if ( newSlide.firstElementChild.children.length === 1 ) {
		gsap.fromTo(newSlide, { 
				opacity: 0,
				scale: 0.9 
			}, 
			{ 
				opacity: 1,
				duration: 0.3,
				scale: 1.001,
				ease: "elastic.out(1.2, 0.8)", // Пружинистый возврат
			});
		} else {
			[...newSlide.firstElementChild.children].forEach((item, index) => {
					if ( index === 1 ) {
						// Среднюю картинку показываем чуть быстрее
						gsap.fromTo(item, { 
						opacity: 0,
						scale: 0.9 
					}, 
					{ 
						opacity: 1,
						duration: 0.3,
						scale: 1.001,
						ease: "elastic.out(1.2, 0.8)", // Пружинистый возврат
					});
				} else {
					// Боковые картинки показываем чуть медленее
					gsap.fromTo(item, { 
						opacity: 0,
						scale: 0.9 
					}, 
					{ 
						opacity: 1,
						duration: 0.4,
						scale: 1.001,
						delay: 0.03,
						ease: "elastic.out(1.2, 0.8)", // Пружинистый возврат
					});
				}
			})
		}
}

// Интервал для смены слайдов
export const changeSlides = (maxSlides: number) => {
	setInterval(() => {
		// Показываем слайд
		showSlide(oldIndex, newIndex)
		// Включаем следующий слайд
		oldIndex = newIndex;
		if ( newIndex >= maxSlides ) {
			newIndex = 0
		} else {
			newIndex++
		}
	}, 5000)
}
