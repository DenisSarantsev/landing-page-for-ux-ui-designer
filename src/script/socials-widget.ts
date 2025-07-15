import { gsap } from "gsap";

const widget = document.querySelector<HTMLElement>('.socials-widget');
const dots = document.querySelector<HTMLElement>('.three-dots-button');

// Переменная для отслеживания состояния виджета
let isWidgetOpen = false;

window.addEventListener("resize", () => {
    initializeWidgetListeners();
});

// Инициализируем прослушиватели при загрузе страницы
window.addEventListener("DOMContentLoaded", () => {
    initializeWidgetListeners();
})

// Инициализируем прослушиватели
const initializeWidgetListeners = () => {
    if (!widget) return;
    
    // Удаляем все существующие прослушиватели
    widget.removeEventListener('mouseleave', widgetCloseListener);
    widget.removeEventListener('mouseenter', widgetOpenListener);
    widget.removeEventListener('click', widgetClickListener);
    document.removeEventListener('click', documentClickListener);
    
    if (window.innerWidth > 992) {
        // Десктоп: работа по наведению
        widget.addEventListener('mouseenter', widgetOpenListener);
        widget.addEventListener('mouseleave', widgetCloseListener);
    } else {
        // Мобильные устройства: работа по клику
        widget.addEventListener('click', widgetClickListener);
        document.addEventListener('click', documentClickListener);
    }
}

// Функции для десктопа (наведение)
const widgetOpenListener = () => {
    if (widget && dots) {
        isWidgetOpen = true;
        dots.style.display = 'none';
        gsap.to(widget, {
            duration: 0.6,
            scale: 1,
            ease: "elastic(0.7, 0.4)",
            transformOrigin: "center bottom",
        });
    }
};

const widgetCloseListener = () => {
    if (widget && dots) {
        isWidgetOpen = false;
        dots.style.display = 'flex';
        gsap.to(widget, {
            duration: 0.5,
            scale: 0.2,
            ease: "elastic(0.5, 0.8)",
        });
    }
};

// Функции для мобильных устройств (клик)
const widgetClickListener = (event: Event) => {
    event.stopPropagation(); // Предотвращаем всплытие события
    
    if (widget && dots) {
        if (isWidgetOpen) {
            // Закрываем виджет
            isWidgetOpen = false;
            dots.style.display = 'flex';
            gsap.to(widget, {
                duration: 0.5,
                scale: 0.2,
                ease: "elastic(0.5, 0.8)",
            });
        } else {
            // Открываем виджет
            isWidgetOpen = true;
            dots.style.display = 'none';
            gsap.to(widget, {
                duration: 0.6,
                scale: 1,
                ease: "elastic(0.7, 0.4)",
                transformOrigin: "center bottom",
            });
        }
    }
};

// Закрытие виджета при клике вне его (только для мобильных)
const documentClickListener = (event: Event) => {
    if (widget && !widget.contains(event.target as Node) && isWidgetOpen) {
        isWidgetOpen = false;
				if ( dots ) dots.style.display = 'flex';
        gsap.to(widget, {
            duration: 0.5,
            scale: 0.2,
            ease: "elastic(0.5, 0.8)",
        });
    }
};