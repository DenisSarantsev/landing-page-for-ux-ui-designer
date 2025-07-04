document.addEventListener("DOMContentLoaded", () => {
// Получаем модалку
const projectModal = document.querySelector<HTMLElement>(".project-modal");
// Показывать ли модалку (false - не показывать, "project" / "workplace" - показывать)
let showProjectModalStatus: boolean | string;
// ID текущего проекта / воркплейса
let currentModalProject: number;
// Кнопка закрытия модалки
const modalCloseButton = document.querySelector<HTMLElement>(".modal-close-button");
modalCloseButton?.addEventListener("click", (event) => {
	
})

// Получаем все карточки проектов на странице
const allProjectCards = document.querySelectorAll<HTMLElement>(".work-card");
if ( allProjectCards && [...allProjectCards].length > 0 ) {
	[...allProjectCards].forEach((card) => {
		card.addEventListener("click", (event) => {
			showProjectModalStatus = "project"
		})
	})
}
// Получаем все карточки воркплейсов на странице (десктоп и мобайл)
const allWorkplaceCards = document.querySelectorAll<HTMLElement>(".work-history-card")
if ( allWorkplaceCards && [...allWorkplaceCards].length > 0 ) {
	[...allWorkplaceCards].forEach((card) => {
		card.addEventListener("click", (event) => {
			showProjectModalStatus = "workplace"
		})
	})
}







})
