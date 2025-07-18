document.addEventListener("DOMContentLoaded", () => {
	addCurrentMarginTop()
});
window.addEventListener("resize", () => {
	addCurrentMarginTop()
});

const addCurrentMarginTop = () => {
	const textBlock = document.querySelector<HTMLElement>(".product-thinking");
	const textBlockTop = textBlock?.offsetTop;
	const cardsBlock = document.querySelector<HTMLElement>(".history");
	const cardsBlockTop = cardsBlock?.offsetTop;
	console.log(window.innerWidth > 992)
	if ( window.innerWidth > 992 ) {
		if ( textBlockTop && cardsBlockTop ) {
			const elementsGap = textBlockTop - cardsBlockTop - 1220;
			textBlock.style.marginTop = `-${elementsGap}px`;
		}
	} else {
			if ( textBlock ) textBlock.style.marginTop = `20vw`;
		}
}