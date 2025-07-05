
import Swiper from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-creative';
import gsap from 'gsap';
import { loadWorkplaces } from './common';
import { addActualWorkplaceDataToModalWindow } from './common';


// Получаем контейнер для слайдов
const slidesWrapper = document.querySelector<HTMLElement>(".swiper-wrapper");

const addCardsInMobileSlider = async () => {
	// Получаем данные из json
	const swiperWorkplaces = await loadWorkplaces();
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
};
addCardsInMobileSlider()


const initSwiper = async () => {
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
				550: {
					slidesPerView: 1.7
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

// Карточки для мобилки и для десктопа
const allWorkplaceCards = document.querySelectorAll<HTMLElement>(".work-history-card");
const projectModal = document.querySelector<HTMLElement>(".project-modal");
if ( allWorkplaceCards && [...allWorkplaceCards].length > 0 ) {
	[...allWorkplaceCards].forEach((card) => {
		card.addEventListener("click", () => {
			const currentId = card.getAttribute("data-workplace-swiper-slide-id");
			if ( currentId ) {
				addActualWorkplaceDataToModalWindow(+currentId)
			}
			const projectModalWrapper = projectModal?.firstElementChild;
			projectModal?.classList.remove("modal-hidden");
			gsap.fromTo(projectModal, {
				opacity: 0
			}, {
				duration: 0.3,
				opacity: 1,
			});
			if ( projectModalWrapper )
			gsap.fromTo(projectModalWrapper, {
				scale: 0.8,
				opacity: 0
			}, {
				delay: 0.15,
				duration: 0.3,
				opacity: 1,
				scale: 1,
				ease: "elastic(1, 1)",
			})
		})
	})
}