/*
	Определяем ширину окна, чтобы регулировать выполнение скриптов
*/

// Глобальная переменная, которая отвечает за переключение событий тачскрина и мыши
export let isMobileScreen: boolean = false;

const checkViewport = () => {
	if ( window.innerWidth <= 992 ) {
		isMobileScreen = true
	} else {
		isMobileScreen = false
	}
}

// Слушаем изменения ширины экрана
window.addEventListener('resize', checkViewport);

// Определяем ширину в первый раз
checkViewport()