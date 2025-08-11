import type { Workplace, WorkplacesData } from "../types/workplace.type";
import type { Project, ProjectsData } from "../types/project.type";
import { animateWordsByWord, showScaleAndOpacityElement } from "./animations";

// Контейнер со скроллом
const scrollWrapper = document.querySelector<HTMLElement>(".project-modal__content-wrapper");

// ----------- Загрузка воркплейсов
// Функция загрузки JSON
export const loadWorkplaces = async (): Promise<Workplace[]> => {
  try {
    const response = await fetch('/data/workplaces.json');
    const data: WorkplacesData = await response.json();
    return data.workplaces;
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
};

// ------------ Загрузка проектов
// Функция загрузки JSON
export const loadProjects = async (): Promise<Project[]> => {
  try {
    const response = await fetch('/data/projects.json');
    const data: ProjectsData = await response.json();
    return data.projects;
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
};


// Функция для вставки данных проекта в модальное окно
export const addActualProjectDataToModalWindow = async (id: number): Promise<void> => {
	//blockBodyScroll()
	// Получаем модалку
	const projectModal = document.querySelector<HTMLElement>(".project-modal");
	const projects: Project[] = await loadProjects();
	if ( projects && projects.length > 0 ) {
		const project = projects.find(p => p.id === id);
		if ( project && projectModal ) {
			const modalContentWrapper = projectModal.querySelector<HTMLElement>(".project-modal__content-wrapper");
			if ( modalContentWrapper ) {
				modalContentWrapper.innerHTML = "";
				modalContentWrapper.insertAdjacentHTML("beforeend", `
					<div class="project-modal__titles titles-gap">
						<h1 style="opacity: 0;" class="project-modal__title secondary-title">${project["project-name"]}</h1>
						<div class="project-modal__subtitle subtitle">${project.description}</div>
					</div>
					<div class="project-modal__images-wrapper"></div>
				`)
			};
			// Формируем структуру картинок
			const projectStructure = project?.structure.split(",");
			let imageCounter: number = 1;
			const imagesWrapper = document.querySelector(".project-modal__images-wrapper");
			if ( imagesWrapper ) {
				for ( let i = 0; i < projectStructure.length; i++ ) {
					if ( projectStructure[i] === "1" ) {
						imagesWrapper.insertAdjacentHTML("beforeend", `
							<div class="project-modal__images-wrapper_one">
								<img src="/img/project/${project.id}/${imageCounter}.png" alt="project screenshot">
							</div>
						`);
						imageCounter += 1;
					} else {
						imagesWrapper.insertAdjacentHTML("beforeend", `
							<div class="project-modal__images-wrapper_two">
								<img src="/img/project/${project.id}/${imageCounter}.png" alt="project screenshot">
								<img src="/img/project/${project.id}/${imageCounter + 1}.png" alt="project screenshot">
							</div>
						`);
						imageCounter += 2;
					}
				}
			}
			// Скроллим вверх
			if ( scrollWrapper ) scrollToTop(scrollWrapper);
			// Анимация появления заголовка в модалке
			const projectModalTitle = document.querySelector<HTMLElement>(".project-modal__title");
			const projectModalSubitle = document.querySelector<HTMLElement>(".project-modal__subtitle");
			const projectImagesWrapper = document.querySelector<HTMLElement>(".project-modal__images-wrapper");
			if ( projectModalTitle ) animateWordsByWord(projectModalTitle, 0.3);
			if ( projectModalSubitle ) showScaleAndOpacityElement(projectModalSubitle, 0.2);
			if ( projectImagesWrapper ) showScaleAndOpacityElement(projectImagesWrapper, 0.3);
		}
	}
}

// Функция для вставки данных проекта в модальное окно
export const addActualWorkplaceDataToModalWindow = async (id: number): Promise<void> => {
	//blockBodyScroll()
	// Получаем модалку
	const projectModal = document.querySelector<HTMLElement>(".project-modal");
	const workplaces: Workplace[] = await loadWorkplaces();
	if ( workplaces && workplaces.length > 0 ) {
		const workplace = workplaces.find(p => p.id === id);
		if ( workplace && projectModal ) {
			const modalContentWrapper = projectModal.querySelector<HTMLElement>(".project-modal__content-wrapper");
			if ( modalContentWrapper ) {
				modalContentWrapper.innerHTML = "";
				modalContentWrapper.insertAdjacentHTML("beforeend", `
					<div class="project-modal__titles titles-gap">
						<div class="project-modal__icon">
							<img src="/img/workplace/${workplace.id}/company-logo.png" alt="company logo">
						</div>
						<h1 style="opacity: 0;" class="project-modal__title secondary-title">${workplace.post}</h1>
						<div class="project-modal__company-address project-show-animation">${workplace.company} — ${workplace["company-address"]}</div>
						<div class="project-modal__period project-show-animation">${workplace.period.from} - ${workplace.period.to}</div>
						<div class="project-modal__workplace-description project-show-animation">${workplace.description}</div>
					</div>
					<div class="project-modal__images-wrapper project-show-animation"></div>
				`)
			};
			// Формируем структуру каринок
			const workplaceStructure = workplace?.structure.split(",");
			let imageCounter: number = 1;
			const imagesWrapper = document.querySelector(".project-modal__images-wrapper");
			if ( imagesWrapper ) {
				for ( let i = 0; i < workplaceStructure.length; i++ ) {
					if ( workplaceStructure[i] === "1" ) {
						imagesWrapper.insertAdjacentHTML("beforeend", `
							<div class="project-modal__images-wrapper_one">
								<img src="/img/project/${workplace.id}/${imageCounter}.png" alt="project screenshot">
							</div>
						`);
						imageCounter += 1;
					} else {
						imagesWrapper.insertAdjacentHTML("beforeend", `
							<div class="project-modal__images-wrapper_two">
								<img src="/img/project/${workplace.id}/${imageCounter}.png" alt="project screenshot">
								<img src="/img/project/${workplace.id}/${imageCounter + 1}.png" alt="project screenshot">
							</div>
						`);
						imageCounter += 2;
					}
				}
			}
			// Скроллим вверх
			if ( scrollWrapper ) scrollToTop(scrollWrapper);
			// Анимация появления заголовка в модалке
			const projectModalTitle = document.querySelector<HTMLElement>(".project-modal__title");
			const projectShowElements = document.querySelectorAll<HTMLElement>(".project-show-animation");
			if ( projectModalTitle ) animateWordsByWord(projectModalTitle, 0.2);
			if ( projectShowElements && projectShowElements.length > 0 ) {
				for ( let element of projectShowElements ) {
					showScaleAndOpacityElement(element, 0.3);
				}
			}
		}
	}
}

// Прокрутка модалки в самый верх
export const scrollToTop = (element: HTMLElement, smooth: boolean = true): void => {
  if (!element) {
    console.warn('Element is not provided for scrollToTop function');
    return;
  }

  element.scrollTo({
    top: 0,
    left: 0,
    behavior: smooth ? 'smooth' : 'instant'
  });
};


// Блокируем и включаем скролл
export const blockBodyScroll = () => {
	const bodyElement = document.querySelector<HTMLElement>("body");
	if (bodyElement) {
		bodyElement.style.overflowY = "hidden";
	}
};
export const unlockBodyScroll = () => {
	const bodyElement = document.querySelector<HTMLElement>("body");
	if (bodyElement) {
		bodyElement.style.overflowY = "";
	}
};