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
    });

    // навешиваем прослушиватели на все мобильные карточки
    const allSwiperCards = document.querySelectorAll<HTMLElement>('.work-history-card');
    const projectModal = document.querySelector<HTMLElement>(".project-modal");
    if ( allSwiperCards && allSwiperCards.length > 0 ) {
        [...allSwiperCards].forEach((card) => {
            if ( card instanceof HTMLElement ) {
                const cardId = card.getAttribute("data-workplace-swiper-slide-id");
                if ( cardId ){
                    card.addEventListener("click", () => {
                        addActualWorkplaceDataToModalWindow(+cardId);
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
                }
            }
        })
    }
};

// Функция для расчета slidesPerView на основе ширины экрана
const calculateSlidesPerView = (containerWidth: number, slideWidth: number, spaceBetween: number): number => {
    // Рассчитываем сколько полных слайдов помещается
    const fullSlidesCount = Math.floor(containerWidth / (slideWidth + spaceBetween));
    
    // Рассчитываем оставшееся место
    const remainingSpace = containerWidth - (fullSlidesCount * (slideWidth + spaceBetween));
    
    // Рассчитываем какую часть следующего слайда можно показать
    const partialSlideRatio = remainingSpace / slideWidth;
    
    // Возвращаем количество полных слайдов + часть следующего
    return fullSlidesCount + Math.min(partialSlideRatio, 0.8); // Максимум 80% от следующего слайда
};

// Функция для получения отступа в зависимости от ширины экрана
const getSpaceBetween = (screenWidth: number): number => {
    if (screenWidth < 560) return 15;
    if (screenWidth < 640) return 15; // Теперь и в промежутке 560-640 тоже 15px
    return 15;
};

const initSwiper = async () => {
    try {
        // Ждем загрузки слайдов
        await addCardsInMobileSlider();
        
        // Небольшая задержка для рендеринга
        setTimeout(() => {
            // Предполагаемая ширина одного слайда (нужно подставить реальную)
            const slideWidth = 300; // Замените на реальную ширину вашего слайда
            
            const swiper = new Swiper('.swiper', {
                slidesPerView: 'auto',
                spaceBetween: getSpaceBetween(window.innerWidth),
                
                // Адаптивные настройки с автоматическим расчетом
                breakpoints: {
                    0: {
                        slidesPerView: 1,
                        spaceBetween: 0,
                        centeredSlides: true,
                    },
                    360: {
                        slidesPerView: 1,
                        spaceBetween: 0,
                        centeredSlides: true,
                    },
                    400: {
                        slidesPerView: calculateSlidesPerView(400, slideWidth, getSpaceBetween(400)),
                        spaceBetween: getSpaceBetween(400),
                        centeredSlides: false,
                    },
                    450: {
                        slidesPerView: calculateSlidesPerView(450, slideWidth, getSpaceBetween(450)),
                        spaceBetween: getSpaceBetween(450),
                        centeredSlides: false,
                    },
                    500: {
                        slidesPerView: calculateSlidesPerView(500, slideWidth, getSpaceBetween(500)),
                        spaceBetween: getSpaceBetween(500),
                        centeredSlides: false,
                    },
                    550: {
                        slidesPerView: calculateSlidesPerView(550, slideWidth, getSpaceBetween(550)),
                        spaceBetween: getSpaceBetween(550),
                        centeredSlides: false,
                    },
                    600: {
                        slidesPerView: calculateSlidesPerView(600, slideWidth, getSpaceBetween(600)),
                        spaceBetween: getSpaceBetween(600),
                        centeredSlides: false,
                    },
                    640: {
                        slidesPerView: calculateSlidesPerView(640, slideWidth, getSpaceBetween(640)),
                        spaceBetween: getSpaceBetween(640),
                        centeredSlides: false,
                    },
                    670: {
                        slidesPerView: calculateSlidesPerView(670, slideWidth, getSpaceBetween(670)),
                        spaceBetween: getSpaceBetween(670),
                        centeredSlides: false,
                    },
                },
                
                // Обновляем при изменении размера
                on: {
                    resize: function() {
                        const containerWidth = this.el.offsetWidth;
                        const currentSpaceBetween = getSpaceBetween(containerWidth);
                        const newSlidesPerView = calculateSlidesPerView(containerWidth, slideWidth, currentSpaceBetween);
                        
                        // Определяем нужно ли центрирование
                        const shouldCenter = containerWidth < 400;
                        
                        this.params.slidesPerView = shouldCenter ? 1 : newSlidesPerView;
                        this.params.spaceBetween = shouldCenter ? 0 : currentSpaceBetween;
                        this.params.centeredSlides = shouldCenter;
                        this.update();
                    }
                }
            });
        }, 100);
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