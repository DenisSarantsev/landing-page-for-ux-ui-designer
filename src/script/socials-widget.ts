import { gsap } from "gsap";

const widget = document.querySelector<HTMLElement>('.socials-widget');
const dots = document.querySelector<HTMLElement>('.three-dots-button');


if (widget && dots) {
	// Hover эффект с увеличением и spring анимацией
	widget.addEventListener('mouseenter', () => {
			dots.style.display = 'none'; // Скрываем в конце
			gsap.to(widget, {
				duration: 0.6,
				scale: 1,
				ease: "elastic(0.7, 0.4)",
				transformOrigin: "center bottom",
			});
	});

	// Возврат к исходному размеру
	widget.addEventListener('mouseleave', () => {
			dots.style.display = 'flex'; // Скрываем в конце
			gsap.to(widget, {
				duration: 0.5,
				scale: 0.2,
				ease: "elastic(0.5, 0.8)",
			});
	});
}