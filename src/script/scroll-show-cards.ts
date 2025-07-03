import { gsap } from "gsap";
import { isMobileScreen } from "./resize";

interface Project {
	"id": number,
	"project-name": string,
	"description": string
}
interface ProjectsData {
  projects: Project[];
}
interface Settings {
	"project-items-on-home-page": number, 
	"about-me-slider-interval": number
}

// Функция загрузки JSON
const loadProjects = async (): Promise<Project[]> => {
  try {
    const response = await fetch('/data/projects.json');
    const data: ProjectsData = await response.json();
    return data.projects;
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
};

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

// Эффекты при скролле
const checkScroll = () => {
	window.addEventListener("scroll", () => {
		const currentScrollY = window.scrollY;
    const isScrollingDown = currentScrollY > lastScrollY;
    lastScrollY = currentScrollY;
		// Расстояние от верха вьюпорта до верха докумнета
		const scrollFromTop = window.scrollY;
		// Расстояие от низа вьюпорта до верха документа
		const scrollFromBottom = window.scrollY + window.innerHeight;
		// Пробегаемся по всем элементам и отслеживаем их положение
		[...allFeaturedWorksCards].forEach((card) => {
			// Получаем положение карточки в пространстве
			const rect = card.getBoundingClientRect();
			// Расстояние от верха документа до верха карточки
			const cardTop = rect.top + scrollFromTop;
			// Расстояние от верха документа до низа карточки
			const cardBottom = cardTop + rect.height;
			// Увеличиваем карточки при входе в вьюпорт (скролл снизу вверх)
			if ( cardTop - (rect.height * 1) < scrollFromBottom && cardBottom - (rect.height * 0.5) <= scrollFromTop ) {
				gsap.to(card, {
					duration: 0.7,
					scale: 1,
					ease: "elastic(1, 0.4)",
					transformOrigin: "center bottom",
				});
			}
			// Увеличиваем карточки при входе в вьюпорт (скролл сверху вниз)
			if ( cardTop - (rect.height * 1) < scrollFromBottom + 400 && isScrollingDown ) {
				gsap.to(card, {
					duration: 0.7,
					scale: 1,
					ease: "elastic(1, 0.4)",
					transformOrigin: "center bottom",
				});
			}
			// Уменьшаем карточки при выходе из вьюпорта
			if ( cardTop + rect.height < scrollFromTop || cardTop > scrollFromBottom ) {
				gsap.to(card, {
					duration: 0.2,
					scale: 0.7,
					ease: "elastic(1, 0.4)",
					transformOrigin: "center bottom",
				});
			} 

		})
	})
}

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
    
    // Применяем эффекты к созданным карточкам
    [...allFeaturedWorksCards].forEach((card) => {
      activeCardEffect(card);
    });
    
    // Управляем hover-эффектами
    manageHoverListeners();
  }
  
  // Запускаем scroll-эффекты
  checkScroll();
});

// Слушаем изменения размера экрана
window.addEventListener("resize", () => {
  manageHoverListeners();
});