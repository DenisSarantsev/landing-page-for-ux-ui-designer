import { gsap } from "gsap";

const widget = document.querySelector<HTMLElement>('.socials-widget');
const dots = document.querySelector<HTMLElement>('.three-dots-button');

window.addEventListener("resize", () => {
	initializeWidgetListeners();
});

// Инициализируем прослушиватели при загрузе страницы
window.addEventListener("DOMContentLoaded", () => {
	initializeWidgetListeners();
})

// Инициализируем прослушиватели
const initializeWidgetListeners = () => {
	if ( window.innerWidth > 992 ) {
		if ( widget instanceof HTMLElement ) {
			// Добавляем прослушиватели на движение мыши
			widget.addEventListener('mouseleave', widgetCloseListener);
			widget.addEventListener('mouseenter', widgetOpenListener);
			// Удаляем прослушиватель на клик
			widget.removeEventListener('click', widgetOpenListener);
			document.removeEventListener('click', widgetCloseListener);
		}
	} else {
		if ( widget instanceof HTMLElement ) { 
			// Удаляем прослушиватель на движение мыши
			widget.removeEventListener('mouseleave', widgetCloseListener);
			widget.removeEventListener('mouseenter', widgetCloseListener);
			// Добавляем прослушиатель на клик
			widget.addEventListener('click', widgetOpenListener);
			document.addEventListener('click', widgetCloseListener);
		}
	}
}

// Функции открытия/закрытия виджета
const widgetCloseListener = () => {
	if (widget && dots) {
		dots.style.display = 'flex'; // Скрываем в конце
		gsap.to(widget, {
			duration: 0.5,
			scale: 0.2,
			ease: "elastic(0.5, 0.8)",
		});
	}	
};
const widgetOpenListener = () => {
	if (widget && dots) { 
		dots.style.display = 'none'; // Скрываем в конце
		gsap.to(widget, {
			duration: 0.6,
			scale: 1,
			ease: "elastic(0.7, 0.4)",
			transformOrigin: "center bottom",
		});
	}
};
