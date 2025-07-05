import type { Workplace, WorkplacesData } from "../types/workplace.type";
import type { Project, ProjectsData } from "../types/project.type";

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
						<h1 class="project-modal__title secondary-title">${project["project-name"]}</h1>
						<div class="project-modal__subtitle subtitle">${project.description}</div>
					</div>
					<div class="project-modal__images-wrapper">
						<div class="project-modal__images-wrapper_one">
							<img src="/img/project/${project.id}/1.png" alt="project screenshot">
						</div>
						<div class="project-modal__images-wrapper_two">
							<img src="/img/project/${project.id}/2.png" alt="project screenshot">
							<img src="/img/project/${project.id}/3.png" alt="project screenshot">
						</div>
						<div class="project-modal__images-wrapper_three">
							<img src="/img/project/${project.id}/4.png" alt="project screenshot">
						</div>
						<div class="project-modal__images-wrapper_four">
							<img src="/img/project/${project.id}/5.png" alt="project screenshot">
							<img src="/img/project/${project.id}/6.png" alt="project screenshot">
						</div>
					</div>
				`)
			}
		}
	}
}

// Функция для вставки данных проекта в модальное окно
export const addActualWorkplaceDataToModalWindow = async (id: number): Promise<void> => {
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
						<h1 class="project-modal__title secondary-title">${workplace.post}</h1>
						<div class="project-modal__company-address">${workplace.company} — ${workplace["company-address"]}</div>
						<div class="project-modal__period">${workplace.period.from} - ${workplace.period.to}</div>
						<div class="project-modal__workplace-description">${workplace.description}</div>
					</div>
					<div class="project-modal__images-wrapper">
						<div class="project-modal__images-wrapper_one">
							<img src="/img/project/${workplace.id}/1.png" alt="project screenshot">
						</div>
						<div class="project-modal__images-wrapper_two">
							<img src="/img/project/${workplace.id}/2.png" alt="project screenshot">
							<img src="/img/project/${workplace.id}/3.png" alt="project screenshot">
						</div>
						<div class="project-modal__images-wrapper_three">
							<img src="/img/project/${workplace.id}/4.png" alt="project screenshot">
						</div>
						<div class="project-modal__images-wrapper_four">
							<img src="/img/project/${workplace.id}/5.png" alt="project screenshot">
							<img src="/img/project/${workplace.id}/6.png" alt="project screenshot">
						</div>
					</div>
				`)
			}
		}
	}
}