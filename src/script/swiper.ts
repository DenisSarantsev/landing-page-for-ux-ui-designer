
import Swiper from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-creative';
import { loadWorkplaces } from './common';

// Получаем данные из json
const swiperWorkplaces = await loadWorkplaces();
// Получаем контейнер для слайдов
const slidesWrapper = document.querySelector<HTMLElement>(".swiper-wrapper");
// Вставляем слайды в контейнер
if ( swiperWorkplaces && swiperWorkplaces.length > 0 )
swiperWorkplaces.forEach((slide) => {
	slidesWrapper?.insertAdjacentHTML("beforeend", `
		<div class="swiper-slide">
			<div data-workplace-swiper-slide-id=${slide.id} class="work-history-card">
				<div class="work-history-card__wrapper">
					<div class="work-history-card__top">
						<h3 class="work-history-card__title">${slide.post}</h3>
						<div class="work-history-card__subtitle">${slide.formate}</div>
					</div>
					<div class="work-history-card__info">
						<img src="/img/workplace/${slide.id}/company-logo.png" alt="company logo" class="work-history-card__info_image">
						<div class="work-history-card__info_data">
							<div class="work-history-card__info_company-name">${slide.company}</div>
							<div class="work-history-card__info_address">${slide['company-address']}</div>
						</div>
					</div>
					<div class="work-history-card__period">
						<div class="work-history-card__period_title">From</div>
						<div class="work-history-card__period_subtitle">${slide.period.from}</div>
					</div>
					<div class="work-history-card__period">
						<div class="work-history-card__period_title">To</div>
						<div class="work-history-card__period_subtitle">${slide.period.to}</div>
					</div>
				</div>
			</div>
		</div>
	`)
})
console.log("1")


const initSwiper = async () => {
	console.log("2")
	try {
		const swiper = new Swiper('.swiper', {
			slidesPerView: 'auto', // Показывать 3 слайда одновременно
			spaceBetween: 20,

			// Адаптивные настройки
			breakpoints: {
				0: {
					slidesPerView: 1,
					spaceBetween: 0,
				},
				360: {
					slidesPerView: 1.2,
					spaceBetween: 20,
				},
				400: {
					slidesPerView: 1.3,
					spaceBetween: 20,
				},
				450: {
					slidesPerView: 1.4
				},
				500: {
					slidesPerView: 1.5
				},
				600: {
					slidesPerView: 2
				},
				670: {
					slidesPerView: 2.2,
				},
			}
		});		
	}
	catch (err) {
		console.log(err)
	}
}
// Вызываем функцию
initSwiper();


