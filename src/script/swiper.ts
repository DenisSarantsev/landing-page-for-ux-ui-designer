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
    swiperWorkplaces.reverse().forEach((slide) => {
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
const calculateSlidesPerView = (containerWidth: number, slideWidth: number): number => {
    const spaceBetween = 20; // фиксированное расстояние между карточками
    // Количество слайдов = (ширина контейнера + spaceBetween) / (ширина слайда + spaceBetween)
    const slides = (containerWidth + spaceBetween) / (slideWidth + spaceBetween);
    return slides;
};

// Функция для получения отступа в зависимости от ширины экрана
const getSpaceBetween = (width: number): number => {
    // Можно адаптивно уменьшить отступ на узких экранах
    return width < 480 ? 20 : 20;
};

const initSwiper = async () => {
    try {
        // Ждем загрузки слайдов
        await addCardsInMobileSlider();
        
        // Небольшая задержка для рендеринга
        setTimeout(() => {
            // Предполагаемая ширина одного слайда (нужно подставить реальную)
            const slideWidth = 290; // Замените на реальную ширину вашего слайда
            
            new Swiper('.swiper', {
                slidesPerView: (() => {
                    const container = document.querySelector<HTMLElement>('.swiper');
                    const w = container?.offsetWidth || window.innerWidth;
                    return w < 360 ? 1 : calculateSlidesPerView(w, slideWidth);
                })(),
                spaceBetween: (() => {
                    const container = document.querySelector<HTMLElement>('.swiper');
                    const w = container?.offsetWidth || window.innerWidth;
                    return w < 360 ? 0 : getSpaceBetween(w);
                })(),
                centeredSlides: (() => {
                    const container = document.querySelector<HTMLElement>('.swiper');
                    const w = container?.offsetWidth || window.innerWidth;
                    return w < 360;
                })(),
                slidesOffsetBefore: 0,
                slidesOffsetAfter: (() => {
                    const container = document.querySelector<HTMLElement>('.swiper');
                    const w = container?.offsetWidth || window.innerWidth;
                    if (w < 360) return 0;
                    const gap = getSpaceBetween(w);
                    const extraTail = 20; // дополнительный “хвост” после последнего слайда
                    return gap + extraTail;
                })(),
                on: {
                    resize(sw) {
                        const containerWidth = (sw as any).el.offsetWidth as number;
                        const gap = getSpaceBetween(containerWidth);
                        const newSlidesPerView = containerWidth < 360 ? 1 : calculateSlidesPerView(containerWidth, slideWidth);
                        const shouldCenter = containerWidth < 360;
                        (sw as any).params.slidesPerView = newSlidesPerView;
                        (sw as any).params.spaceBetween = shouldCenter ? 0 : gap;
                        (sw as any).params.centeredSlides = shouldCenter;
                        (sw as any).params.slidesOffsetBefore = 0;
                        (sw as any).params.slidesOffsetAfter = shouldCenter ? 0 : (gap + 20);
                        (sw as any).update && (sw as any).update();
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