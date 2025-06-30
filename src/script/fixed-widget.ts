import { advancedScrollWatcher } from "./scroll-checker";
import { gsap } from "gsap";

/*
// Получаем элемент виджета
const widgetButton = document.querySelector<HTMLElement>(".start-block__socials-button");
let fixedWidgetStatus: boolean = false;
let isAnimating: boolean = false; // Флаг анимации

// Отслеживание прокрутки вниз и фиксирование виджета
advancedScrollWatcher.watch({
	selector: '.start-block__socials-button-outer',
	onScroll: (_element, data) => {
		console.log( data.scrolledPercentage )
		if (isAnimating) return;
		// Фиксируем элемент внизу
		console.log(data.scrolledPercentage)
		if ( data.scrolledPercentage > 20 && !fixedWidgetStatus ) {

			isAnimating = false;
			fixedWidgetStatus = true;
			gsap.to(widgetButton, {
				opacity: 0,
				duration: 0.3,
				onComplete: () => {
					widgetButton?.classList.add("button-fixed");
				}
			})
			gsap.to(widgetButton, {
				opacity: 1,
				delay: 0.3,
				duration: 0.3
			})
		} else if ( data.scrolledPercentage <= 20 && fixedWidgetStatus ) {
			// Возвращаем элемент на место
			console.log("RETURN", fixedWidgetStatus)
			isAnimating = false;
			fixedWidgetStatus = false;
			gsap.to(widgetButton, {
				opacity: 0,
				duration: 0.3,
				onComplete: () => {
					widgetButton?.classList.remove("button-fixed");
				}
			})
			gsap.to(widgetButton, {
				opacity: 1,
				delay: 0.3,
				duration: 0.3
			})
		}
	}
});


// Статус запуска слайдера
let sliderWorks: boolean = false;
// Отслеживание прокрутки
advancedScrollWatcher.watch({
	selector: '.start-block__socials-button',
	onScroll: (_element, data) => {
		console.log(data.scrolledFromTop)
		if ( data.scrolledPercentage > 30 && !sliderWorks ) {
			sliderWorks = true;
			
		}
	}
});

*/