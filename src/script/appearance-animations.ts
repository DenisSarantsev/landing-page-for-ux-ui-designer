// Чек прокрутки
import { advancedScrollWatcher } from "./scroll-checker";
import gsap from "gsap";
// Функции анимаций
import { animateWordsByWord, animateElementScale, showScaleAndOpacityElement, showScaleAndOpacityElementWithDuration } from "./animations";
import { changeSlides } from "./about-me-slider";
// Отслеживаем первое появление блока advantages
export const isCardsShow = [0]; // 0 - не показивалась, 1 - показивалась

document.addEventListener("DOMContentLoaded", () => {

// Убираем класс loading после загрузки DOM
document.body.classList.remove("loading");
document.body.classList.add("loaded");

// ---------- Стартовый блок
const startBlockTopTitle = document.querySelector<HTMLElement>('.start-block__main-title');
const startBlockBottomTitle = document.querySelector<HTMLElement>('.start-block__second-title');
const cardsWrapper = document.querySelector<HTMLElement>('.start-block__cards');
// Анимируем верхний заголовок
if ( startBlockTopTitle instanceof HTMLElement ) { 
	if ( startBlockTopTitle.firstElementChild instanceof HTMLElement ) animateWordsByWord(startBlockTopTitle.firstElementChild, 0.4);
	if ( startBlockTopTitle.lastElementChild instanceof HTMLElement ) animateWordsByWord(startBlockTopTitle.lastElementChild, 0.5);
};
// Анимируем нижний заголовок
if ( startBlockBottomTitle instanceof HTMLElement ) { 
	const startBlockBottomTitleChildrens = startBlockBottomTitle.children;
	if ( startBlockBottomTitleChildrens && [...startBlockBottomTitleChildrens].length > 0 ) {
		[...startBlockBottomTitleChildrens].forEach((item, index) => {
			if ( item instanceof HTMLElement ) {
				const delay = 0.6 + ((index + 1)/10);
				animateWordsByWord(item, delay);
			}
		})
	}
};
// Анимируем появление карточек
if ( cardsWrapper instanceof HTMLElement ) {
	const cards = cardsWrapper.children;
	if ( cards && [...cards].length > 0 ) {
		if ( cards[0] instanceof HTMLElement ) animateElementScale(cards[0], 0.8, -60, -50);
		if ( cards[1] instanceof HTMLElement ) animateElementScale(cards[1], 0.9, -40, 20);
		if ( cards[2] instanceof HTMLElement ) animateElementScale(cards[2], 1, -20, 40);
	}
};


// ---------- Блок с карточками проектов
/*
const worksBlock = document.querySelector<HTMLElement>(".works");
const worksBlockTitle = document.querySelector<HTMLElement>(".works__title");
const worksBlockSubtitle = document.querySelector<HTMLElement>(".works__subtitle");
advancedScrollWatcher.watch({
  selector: '.works',
  onScroll: (element, data) => {
		if ( data.scrolledPercentage > 10 && !worksBlock?.classList.contains("scrolled") ) {
			if ( worksBlock instanceof HTMLElement ) worksBlock.classList.add("scrolled");
			if ( worksBlockTitle instanceof HTMLElement ) animateWordsByWord(worksBlockTitle, 0.2);
			if ( worksBlockSubtitle instanceof HTMLElement ) animateWordsByWord(worksBlockSubtitle, 0.3);
		}
  }
});
*/


// ---------- Блок со слайдером
let sliderWorks: boolean = false;
const aboutBlock = document.querySelector<HTMLElement>(".about");
//const aboutBlockTitle = document.querySelector<HTMLElement>(".about__title");
//const aboutBlockSubtitle = document.querySelector<HTMLElement>(".about__subtitle");
const aboutSlider = document.querySelector<HTMLElement>(".about__slider");
advancedScrollWatcher.watch({
  selector: '.about',
  onScroll: (element, data) => {
		// Запускаем слайдер
		if ( data.scrolledPercentage > 25 && !sliderWorks ) {
			sliderWorks = true;
			changeSlides(5);
		}
		/*
		if ( !aboutBlock?.classList.contains("scrolled-title") && data.scrolledPercentage > 10 ) {
			if ( aboutBlockTitle instanceof HTMLElement ) animateWordsByWord(aboutBlockTitle, 0.1);
			if ( aboutBlockSubtitle instanceof HTMLElement ) animateWordsByWord(aboutBlockSubtitle, 0.2);
			if ( aboutBlock instanceof HTMLElement ) aboutBlock.classList.add("scrolled-title");
		}
			*/
		if ( !aboutBlock?.classList.contains("scrolled-block") && data.scrolledPercentage > 10 ) {
			if ( aboutSlider instanceof HTMLElement ) showScaleAndOpacityElementWithDuration(aboutSlider, 0, 0.7);
			if ( aboutBlock instanceof HTMLElement ) aboutBlock.classList.add("scrolled-block");
		}
	}
});


// ---------- Блок c маленькими карточками
const advantageBlock = document.querySelector<HTMLElement>(".advantages");
////const advantageTitle = document.querySelector<HTMLElement>(".advantages__title");
const advantagesCardsWrapper = document.querySelector<HTMLElement>(".advantages__cards");
const itemsCardsWrapper = document.querySelector<HTMLElement>(".advantages__items");
advancedScrollWatcher.watch({
  selector: '.advantages',
  onScroll: (element, data) => {
	if ( data.scrolledPercentage > 15 && !advantageBlock?.classList.contains("scrolled") ) {
		if ( advantageBlock instanceof HTMLElement ) advantageBlock.classList.add("scrolled");
		/*
		if ( advantageTitle instanceof HTMLElement ) { 
			const advantageBlockTitleChildrens = advantageTitle.children;
			if ( advantageBlockTitleChildrens && [...advantageBlockTitleChildrens].length > 0 ) {
				[...advantageBlockTitleChildrens].forEach((item, index) => {
					if ( item instanceof HTMLElement ) {
						const delay = 0.1 + ((index + 1)/30);
						animateWordsByWord(item, delay);
					}
				})
			}
		};
		*/
		}
		if ( data.scrolledPercentage > 15 && !advantagesCardsWrapper?.classList.contains("cards-scrolled") ) {
			isCardsShow[0] = 1;
			advantagesCardsWrapper?.classList.add("cards-scrolled");
			const cards = advantagesCardsWrapper?.children;
			if ( cards && [...cards].length > 0 ) {
				[...cards].forEach((card, index) => {
					const delay = 0.1 + ((index + 1)/35);
					if ( card instanceof HTMLElement ) showScaleAndOpacityElement(card, delay);
				});
			}
		}
		if ( data.scrolledPercentage > 20 && !itemsCardsWrapper?.classList.contains("items-scrolled") ) {
			itemsCardsWrapper?.classList.add("items-scrolled");
			const items = itemsCardsWrapper?.children;
			if ( items && [...items].length > 0 ) {
				[...items].forEach((item, index) => {
					const delay = 0.1 + ((index + 1)/12);
					if ( item instanceof HTMLElement ) showScaleAndOpacityElement(item, delay);
				});
			}
		}
	}
});



// ---------- Блок cо слайдером
//const sliderBlockTitle = document.querySelector<HTMLElement>(".history__title");
const sliderMobile = document.querySelector<HTMLElement>(".swiper");

advancedScrollWatcher.watch({
  selector: '.history',
  onScroll: (element, data) => {
		// Показываем заголовок
		/*
		if ( !sliderBlockTitle?.classList.contains("scrolled-title") && data.scrolledPercentage > 10 ) {
			if ( sliderBlockTitle instanceof HTMLElement ) animateWordsByWord(sliderBlockTitle, 0.1);
			if ( sliderBlockTitle instanceof HTMLElement ) sliderBlockTitle.classList.add("scrolled-title");
		}
			*/
		// Показываем слайдер на мобилке
		if ( !sliderMobile?.classList.contains("scrolled-block") && data.scrolledPercentage > 15 ) {
			if ( sliderMobile instanceof HTMLElement ) showScaleAndOpacityElement(sliderMobile, 0.5);
			if ( sliderMobile instanceof HTMLElement ) sliderMobile.classList.add("scrolled-block");
		}
	}
});



// ---------- Блок c текстом
//const textBlockTitle = document.querySelector<HTMLElement>(".product-thinking__left");
//const textBlockSubtitles = document.querySelector<HTMLElement>(".product-thinking__right");

advancedScrollWatcher.watch({
  selector: '.product-thinking',
  onScroll: (element, data) => {
		// Показываем заголовок
		/*
		if ( !textBlockTitle?.classList.contains("scrolled-title") && data.scrolledPercentage > 10 ) {
			if ( textBlockTitle instanceof HTMLElement ) textBlockTitle.classList.add("scrolled-title");
			const mainTitles = textBlockTitle?.children;
			if ( mainTitles && [...mainTitles].length > 0 ) {
				[...mainTitles].forEach((item, index) => {
					if ( item instanceof HTMLElement ) {
						const delay = 0.1 + ((index + 1)/30);
						animateWordsByWord(item, delay);
					}
				})
			};
			const firstSubtitle = textBlockSubtitles?.firstElementChild;
			if ( firstSubtitle instanceof HTMLElement ) showScaleAndOpacityElement(firstSubtitle, 0.7);
			const lastSubtitle = textBlockSubtitles?.lastElementChild;
			if ( lastSubtitle instanceof HTMLElement ) showScaleAndOpacityElement(lastSubtitle, 1);
		}
			*/
	}
});



// ---------- Футер
const footerBlock = document.querySelector<HTMLElement>(".footer");
const topFooterSubtitle = document.querySelector<HTMLElement>(".footer__subtitle");
const footerTitleWrapper = document.querySelector<HTMLElement>(".footer__title");
const footerContacts = document.querySelector<HTMLElement>(".footer__contacts");
const socialsWidget = document.querySelector<HTMLElement>(".start-block__socials-button-outer");

advancedScrollWatcher.watch({
  selector: '.footer',
  onScroll: (element, data) => {
		// Показываем заголовок
		if ( !footerBlock?.classList.contains("scrolled-title") && data.scrolledPercentage > 20 ) {
			if ( footerBlock instanceof HTMLElement ) footerBlock.classList.add("scrolled-title");
			if ( topFooterSubtitle instanceof HTMLElement ) animateWordsByWord(topFooterSubtitle, 0.5);
			const topTitle = footerTitleWrapper?.firstElementChild;
			const bottomTitle = footerTitleWrapper?.lastElementChild;
			if ( topTitle instanceof HTMLElement ) animateWordsByWord(topTitle, 0.6);
			if ( bottomTitle instanceof HTMLElement ) animateWordsByWord(bottomTitle, 0.7);
			const topContact = footerContacts?.firstElementChild;
			const bottomContact = footerContacts?.lastElementChild;
			if ( topContact instanceof HTMLElement ) animateWordsByWord(topContact, 0.8);
			if ( bottomContact instanceof HTMLElement ) animateWordsByWord(bottomContact, 0.9);
		};

		// Скрываем виджет
		if ( data.scrolledPercentage > 20 ) {
			if ( socialsWidget ) {
				socialsWidget.classList.add("widget-opacity");
				socialsWidget.classList.remove("widget-visible");
			}
		} else {
			if ( socialsWidget ) {
				socialsWidget.classList.remove("widget-opacity");
				socialsWidget.classList.add("widget-visible");
			}
		}
	}
});


})