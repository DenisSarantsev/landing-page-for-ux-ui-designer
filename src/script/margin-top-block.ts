document.addEventListener("DOMContentLoaded", () => {
  addCurrentMarginTop();

  const startBlockBottomElement = document.querySelector<HTMLElement>(".start-block__second-title");
  const worksBlock = document.querySelector<HTMLElement>(".works");

  // Запоминаем базовый margin-top один раз
  if (worksBlock && !worksBlock.dataset.baseMt) {
    const baseMt = parseFloat(getComputedStyle(worksBlock).marginTop) || 0;
    worksBlock.dataset.baseMt = String(baseMt);
  }

  if (startBlockBottomElement && worksBlock) {
    addCurrentMarginTopForWorksBlock(startBlockBottomElement, worksBlock);
  }

  window.addEventListener("resize", () => {
    addCurrentMarginTop();
    if (startBlockBottomElement && worksBlock) {
      addCurrentMarginTopForWorksBlock(startBlockBottomElement, worksBlock);
    }
  });
});

const addCurrentMarginTop = () => {
  const textBlock = document.querySelector<HTMLElement>(".product-thinking");
  const cardsBlock = document.querySelector<HTMLElement>(".history");
  if (!textBlock || !cardsBlock) return;

  if (window.innerWidth > 992) {
    // Используй реальное положение относительно документа
    const textTop = textBlock.getBoundingClientRect().top + window.scrollY;
    const cardsTop = cardsBlock.getBoundingClientRect().top + window.scrollY;
    const elementsGap = textTop - cardsTop - 1220;
    textBlock.style.marginTop = `-${elementsGap}px`;
  } else {
    textBlock.style.marginTop = "20vw";
  }
};

// Перезаписываем margin-top без вычитания "старой надбавки"
const addCurrentMarginTopForWorksBlock = (startBlock: HTMLElement, worksBlock: HTMLElement) => {
  const minGap = 60;

  // Базовый margin-top (фиксированная отправная точка)
  const baseMt = parseFloat(worksBlock.dataset.baseMt || "0") || 0;

  // Низ стартового блока от верха документа
  const startBottom = startBlock.offsetTop + startBlock.offsetHeight;

  // Текущая позиция worksBlock и его текущий margin-top
  const currentTop = worksBlock.getBoundingClientRect().top + window.scrollY;
  const currentMt = parseFloat(getComputedStyle(worksBlock).marginTop) || 0;

  // Позиция "без маргина" в текущем лайауте (учитывает адаптив/пересчёт при ресайзе)
  const baseTopNoMargin = currentTop - currentMt + baseMt;

  // Где должен быть верх worksBlock, чтобы сохранять минимальный зазор
  const targetTop = startBottom + minGap;

  // Сколько нужно добавить к базовому margin-top
  const requiredDelta = Math.max(0, targetTop - baseTopNoMargin);

  // Перезаписываем margin-top единым значением (без накопления)
  worksBlock.style.marginTop = `${baseMt + requiredDelta}px`;
};