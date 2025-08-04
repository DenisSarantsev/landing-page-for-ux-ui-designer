import { gsap } from "gsap";
import { isMobileScreen } from "./resize";
import { loadProjects } from "./common";
import type { Project } from "../types/project.type"
import { addActualProjectDataToModalWindow } from "./common";

// --- Анимация карточек при скролле ---
let allFeaturedWorksCards: NodeListOf<HTMLElement>;
let hoverEventsAttached = false; // Флаг для hover-обработчиков

interface Settings {
    "project-items-on-home-page": number, 
    "about-me-slider-interval": number
}
const loadCount = async (): Promise<Settings | null> => {
    try {
        const response = await fetch('/data/settings.json');
        const data: Settings = await response.json();
        return data;
    } catch (error) {
        return null;
    }
};

const createProjectCards = (projects: Project[], count: number) => {
    let workCardsContainer;
    const container = document.querySelector(".main-works");
    if (container) {
        workCardsContainer = document.querySelector<HTMLElement>(".works__cards");
    } else {
        workCardsContainer = document.querySelector<HTMLElement>(".projects-page__cards");
        count = projects.length;
    }
    if (!workCardsContainer) return;

    workCardsContainer.innerHTML = ''; // Очищаем контейнер

    projects.forEach((project, index) => {
        if (index + 1 <= count) {
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
            return;
        }
    });
};

// --- Hover-эффекты ---
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

const hoverCardEffect = (card: HTMLElement): void => {
    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);
};

const removeHoverCardEffect = (card: HTMLElement): void => {
    card.removeEventListener("mouseenter", handleMouseEnter);
    card.removeEventListener("mouseleave", handleMouseLeave);
    gsap.to(card, {
        duration: 0.5,
        scale: 1,
        ease: "power2.out",
        transformOrigin: "center center",
    });
};

const manageHoverListeners = () => {
    if (!isMobileScreen && !hoverEventsAttached) {
        [...allFeaturedWorksCards].forEach((card) => {
            hoverCardEffect(card);
        });
        hoverEventsAttached = true;
    } else if (isMobileScreen && hoverEventsAttached) {
        [...allFeaturedWorksCards].forEach((card) => {
            removeHoverCardEffect(card);
        });
        hoverEventsAttached = false;
    }
};

// --- Эффекты при нажатиях (кликах) ---
const activeCardEffect = (card: HTMLElement): void => {
    card.addEventListener("mousedown", () => {
        gsap.to(card, {
            duration: 0.2,
            scale: 1,
            ease: "elastic(0.1, 0.3)",
            transformOrigin: "center center",
        });
    });
    card.addEventListener("mouseup", () => {
        gsap.to(card, {
            duration: 0.2,
            scale: 1.05,
            ease: "elastic(0.7, 0.4)",
            transformOrigin: "center center",
        });
    });
};
const manageActiveCardEffect = () => {
	if (window.innerWidth >= 992) {
		[...allFeaturedWorksCards].forEach(card => {
			activeCardEffect(card);
		});
	} else {
		[...allFeaturedWorksCards].forEach(card => {
			card.removeEventListener("mousedown", handleMouseEnter);
			card.removeEventListener("mouseup", handleMouseLeave);
		});
	}
};


// --- Анимация карточек при скролле (каждый пиксель) ---
const handleScroll = () => {
    const windowHeight = window.innerHeight;
    if (!allFeaturedWorksCards || allFeaturedWorksCards.length === 0) return;
    [...allFeaturedWorksCards].forEach(card => {
        const rect = card.getBoundingClientRect();
        const isEntering = rect.top < windowHeight * 0.99 && rect.bottom > windowHeight * 0.1;
        const isExiting = rect.bottom <= windowHeight * 0.05 || rect.top >= windowHeight * 0.9;

        if (isEntering) {
            gsap.to(card, {
                duration: 0.15,
                scale: 1,
                ease: "power1.out",
                transformOrigin: "center center",
                overwrite: true
            });
        } else if (isExiting) {
            gsap.to(card, {
                duration: 0.12,
                scale: 0.9,
                ease: "power1.out",
                transformOrigin: "center center",
                overwrite: true
            });
        }
    });
};

// --- Троттлинг ---
let scrollTimeout: number | undefined;
const throttledScroll = () => {
    if (scrollTimeout) return;
    scrollTimeout = window.setTimeout(() => {
        handleScroll();
        scrollTimeout = undefined;
    }, 16); // ~60fps
};

// --- Инициализация ---
document.addEventListener("DOMContentLoaded", async () => {
    const projects = await loadProjects();
    const settings = await loadCount();
    let itemsCount = settings?.["project-items-on-home-page"] ?? 9;

    if (projects.length > 0) {
        createProjectCards(projects, itemsCount);
        allFeaturedWorksCards = document.querySelectorAll<HTMLElement>(".work-card__card");
        [...allFeaturedWorksCards].forEach(card => gsap.set(card, { scale: 0.9 }));
        handleScroll();
        manageHoverListeners();
				manageActiveCardEffect();
    }

    // Открытие модалки по клику на карточку
    const allProjectCards = document.querySelectorAll<HTMLElement>(".work-card");
    const projectModal = document.querySelector<HTMLElement>(".project-modal");
    if (allProjectCards && [...allProjectCards].length > 0) {
        [...allProjectCards].forEach((card) => {
            card.addEventListener("click", () => {
                const currentId = card.getAttribute("data-project-id");
                if (currentId) {
                    addActualProjectDataToModalWindow(+currentId);
                    const projectModalWrapper = projectModal?.firstElementChild;
                    projectModal?.classList.remove("modal-hidden");
                    gsap.fromTo(projectModal, {
                        opacity: 0
                    }, {
                        duration: 0.3,
                        opacity: 1,
                    });
                    if (projectModalWrapper)
                        gsap.fromTo(projectModalWrapper, {
                            scale: 0.6,
                            opacity: 0
                        }, {
                            delay: 0.1,
                            duration: 0.4,
                            opacity: 1,
                            scale: 1,
                            ease: "elastic(1, 0.8)",
                        });
                }
            });
        });
    }
});

// Слушаем скролл и resize
window.addEventListener("scroll", throttledScroll, { passive: true });
window.addEventListener("resize", throttledScroll, { passive: true });
window.addEventListener("resize", () => {
    manageHoverListeners();
		manageActiveCardEffect();
});