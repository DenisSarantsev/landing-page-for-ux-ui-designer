import { gsap } from "gsap";
import { isMobileScreen } from "./resize";
import { loadProjects } from "./common";
import type { Project } from "../types/project.type"
import { addActualProjectDataToModalWindow } from "./common";

interface Settings {
    "project-items-on-home-page": number, 
    "about-me-slider-interval": number
}

// Функция загрузки JSON
const loadCount = async (): Promise<Settings | null> => {
    try {
        const response = await fetch('/data/settings.json');
        const data: Settings = await response.json();
        return data;
    } catch (error) {
        return null;
    }
};

// Функция создания карточек
const createProjectCards = (projects: Project[], count: number) => {
  let workCardsContainer;
    // Этот проверочный селевтор есть только на главной
    const container = document.querySelector(".main-works");

    if ( container ) {
         workCardsContainer = document.querySelector<HTMLElement>(".works__cards");
    } else {
        workCardsContainer = document.querySelector<HTMLElement>(".projects-page__cards");
        count = projects.length
    }
  if (!workCardsContainer) return;

  workCardsContainer.innerHTML = ''; // Очищаем контейнер

  projects.forEach((project, index) => {
        if ( index + 1 <= count ) {

            const imagePath = `/img/project/${project.id}/miniature.png`;

            const cardHTML = `
                <div data-project-id="${project.id}" class="works__card work-card">
                    <div class="work-card__card">
                        <img src="${imagePath}" alt="${project['project-name']}">
                    </div>
                    <div class="work-card__text">${project['project-name']}</div>
                </div>
            `;
            workCardsContainer.insertAdjacentHTML('beforeend', cardHTML);
        } else {
            return
        }
  });
};

// Переменная для хранения карточек (обновляется после создания)
let allFeaturedWorksCards: NodeListOf<HTMLElement>;

// Проверка направления скролла
let lastScrollY = window.scrollY;
let hoverEventsAttached = false; // Флаг для hover-обработчиков

// Простая и надежная функция проверки скролла
// Простая и надежная функция проверки скролла
const checkScroll = () => {
    let ticking = false;
    
    const handleScroll = () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                const isScrollingDown = currentScrollY > lastScrollY;
                lastScrollY = currentScrollY;
                
                const windowHeight = window.innerHeight;
                
                // Проверяем каждую карточку
                [...allFeaturedWorksCards].forEach((card, index) => {
                    const rect = card.getBoundingClientRect();
                    
                    // Очень маленький запас - карточка увеличивается только когда почти во вьюпорте
                    const margin = 20;
                    
                    // Проверка: карточка действительно видна пользователю
                    const isVisible = (
                        rect.top < windowHeight - margin &&
                        rect.bottom > margin
                    );
                    
                    const currentScale = gsap.getProperty(card, "scale") as number;
                    
                    // Логируем для отладки
                    //console.log(`Card ${index}: visible=${isVisible}, scale=${currentScale.toFixed(2)}, top=${rect.top.toFixed(0)}, bottom=${rect.bottom.toFixed(0)}, windowHeight=${windowHeight}`);
                    
                    if (isVisible && currentScale < 0.99) {
                        // Карточка видима и маленькая - увеличиваем
                        gsap.to(card, {
                            duration: 0.3,
                            scale: 1,
                            ease: "back.out(1.2)",
                            transformOrigin: "center center",
                            overwrite: true
                        });
                    } else if (!isVisible && currentScale > 0.81) {
                        // Карточка не видима и большая - уменьшаем
                        gsap.to(card, {
                            duration: 0.4,
                            scale: 0.9,
                            ease: "power2.out",
                            transformOrigin: "center center",
                            overwrite: true
                        });
                    }
                });
                
                ticking = false;
            });
        }
        ticking = true;
    };
    
    // Вызываем сразу для инициализации
    handleScroll();
    
    // Слушаем скролл
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Также проверяем при изменении размера окна
    window.addEventListener("resize", handleScroll, { passive: true });
};

// Эффекты при ховерах
// Обработчики hover-эффектов (вынесены отдельно)
const handleMouseEnter = (e: Event) => {
    const card = e.currentTarget as HTMLElement;
    gsap.to(card, {
        duration: 0.4,
        scale: 1.05,
        ease: "elastic(1, 1)",
        transformOrigin: "center center",
    });
};

const handleMouseLeave = (e: Event) => {
    const card = e.currentTarget as HTMLElement;
    gsap.to(card, {
        duration: 0.5,
        scale: 1,
        ease: "elastic(0.7, 0.4)",
        transformOrigin: "center center",
    });
};

// Эффекты при ховерах (теперь управляемые)
const hoverCardEffect = (card: HTMLElement): void => {
    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);
};

// Удаление hover-эффектов
const removeHoverCardEffect = (card: HTMLElement): void => {
    card.removeEventListener("mouseenter", handleMouseEnter);
    card.removeEventListener("mouseleave", handleMouseLeave);
    
    // Возвращаем карточку в базовое состояние
    gsap.to(card, {
        duration: 0.5,
        scale: 1,
        ease: "power2.out",
        transformOrigin: "center center",
    });
};

// Функция управления hover-обработчиками
const manageHoverListeners = () => {
    if (!isMobileScreen && !hoverEventsAttached) {
        // Включаем hover-эффекты на больших экранах
        [...allFeaturedWorksCards].forEach((card) => {
            hoverCardEffect(card);
        });
        hoverEventsAttached = true;
    } else if (isMobileScreen && hoverEventsAttached) {
        // Отключаем hover-эффекты на маленьких экранах
        [...allFeaturedWorksCards].forEach((card) => {
            removeHoverCardEffect(card);
        });
        hoverEventsAttached = false;
    }
};

// Эффекты при нажатиях (кликах)
const activeCardEffect = (card: HTMLElement): void => {
    card.addEventListener("mousedown", () => {
        gsap.to(card, {
            duration: 0.2,
            scale: 1,
            ease: "elastic(0.1, 0.3)",
            transformOrigin: "center center",
        });
    })
    card.addEventListener("mouseup", () => {
        gsap.to(card, {
            duration: 0.2,
            scale: 1.05,
            ease: "elastic(0.7, 0.4)",
            transformOrigin: "center center",
        });
    })
}

// Инициализация
document.addEventListener("DOMContentLoaded", async () => {
  // Загружаем проекты и создаем карточки
  const projects = await loadProjects();
    const settings = await loadCount();
    console.log(settings)
    let itemsCount = settings?.["project-items-on-home-page"] ?? 9;

  if (projects.length > 0) {
    createProjectCards(projects, itemsCount);
    
    // Обновляем ссылку на карточки после их создания
    allFeaturedWorksCards = document.querySelectorAll<HTMLElement>(".work-card__card");
    
    // Устанавливаем начальный масштаб для всех карточек
    [...allFeaturedWorksCards].forEach((card) => {
      gsap.set(card, { scale: 0.8 }); // Начальный масштаб
      activeCardEffect(card);
    });
    
    // Управляем hover-эффектами
    manageHoverListeners();
    
    // Запускаем проверку скролла
    checkScroll();
  }

    // Получаем все карточки проектов на странице
    const allProjectCards = document.querySelectorAll<HTMLElement>(".work-card");
    const projectModal = document.querySelector<HTMLElement>(".project-modal");
    if ( allProjectCards && [...allProjectCards].length > 0 ) {
        [...allProjectCards].forEach((card) => {
            console.log("add")
            card.addEventListener("click", () => {
                const currentId = card.getAttribute("data-project-id");
                if ( currentId ) {
                    addActualProjectDataToModalWindow(+currentId)
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
                        scale: 0.6,
                        opacity: 0
                    }, {
                        delay: 0.1,
                        duration: 0.4,
                        opacity: 1,
                        scale: 1,
                        ease: "elastic(1, 0.8)",
                    })
                }
            })
        })
    }
});

// Слушаем изменения размера экрана
window.addEventListener("resize", () => {
  manageHoverListeners();
});