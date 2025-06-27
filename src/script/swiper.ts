/*
import Swiper from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-creative';


const swiper = new Swiper('.swiper', {
	slidesPerView: 5, // Показывать 3 слайда одновременно
  spaceBetween: 50,
});

const slidesWrapper = document.querySelector<HTMLElement>(".swiper-wrapper");
const allSlides = document.querySelectorAll(".swiper-slide");

console.log(allSlides)

if (slidesWrapper) {
	// Середина контейнера со слайдерами
	const centerOfWrapper = slidesWrapper?.offsetWidth / 2;
}


swiper.on('sliderMove', () => {
  // Эта функция будет вызываться во время перетаскивания/движения слайда
  console.log('Слайд двигается!');
	checkCardsMove();
});

swiper.on('transitionEnd', () => {  
	console.log('Переход завершён');
});

swiper.on('transitionStart', () => {
	console.log('Начался переход между слайдами');
});


// Отслеживание расположения всех карточек и смещение
const checkCardsMove = (): void => {
	if ( allSlides ) {
		// Пробегаемся по всем слайдам
		allSlides.forEach((slide, index) => {
			// Получаем расположение слайда
			const rect = slide.getBoundingClientRect(); 
			const left = rect.left; // расстояние от левого края viewport до элемента
			const right = rect.right; // расстояние от левого края viewport до правого края элемента
			const width = rect.width; // ширина элемента
			// 
			if ( index === 0 ) {
				console.log(left)
			}
		})
	}
}



*/