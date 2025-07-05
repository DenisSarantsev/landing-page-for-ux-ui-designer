import gsap from "gsap"
import type { Project, ProjectsData } from "../types/project.type";
import { loadProjects } from "./common";

document.addEventListener("DOMContentLoaded", () => {
// Получаем модалку
const projectModal = document.querySelector<HTMLElement>(".project-modal");
// Кнопка закрытия модалки
const modalCloseButton = document.querySelector<HTMLElement>(".modal-close-button");

// Функционал закрытия модалки
modalCloseButton?.addEventListener("click", () => {
	const projectModalWrapper = projectModal?.firstElementChild;
	if ( projectModalWrapper )
	gsap.fromTo(projectModalWrapper, {
		opacity: 1,
		scale: 1
	},{
		scale: 0.9,
		opacity: 0,
		duration: 0.3,
		ease: "power2.out",
	})
	gsap.to(projectModal, {
		opacity: 0,
		duration: 0.3,
		onComplete: () => {
			projectModal?.classList.add("modal-hidden");
		}
	})
})


// Получаем все карточки воркплейсов на странице (десктоп и мобайл)
const allWorkplaceCards = document.querySelectorAll<HTMLElement>(".work-history-card")
if ( allWorkplaceCards && [...allWorkplaceCards].length > 0 ) {
	[...allWorkplaceCards].forEach((card) => {
		card.addEventListener("click", (event) => {
			
		})
	})
}

})



