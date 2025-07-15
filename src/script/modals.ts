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
	});
	// Элементы модалки
	const modalTitles = document.querySelector<HTMLElement>(".project-modal__titles");
	const modalImages = document.querySelector<HTMLElement>(".project-modal__images-wrapper");
	if ( modalTitles ) modalTitles.innerHTML = "";
	if ( modalImages ) modalImages.innerHTML = "";
})

// Ховеры модалки
modalCloseButton?.addEventListener("mouseenter", () => {
	if ( modalCloseButton ) {
		gsap.to(modalCloseButton, {
			scale: 1.1,
			duration: 0.2
		})
	}
});
modalCloseButton?.addEventListener("mouseleave", () => {
	if ( modalCloseButton ) {
		gsap.to(modalCloseButton, {
			scale: 1,
			duration: 0.2
		})
	}
})


})



