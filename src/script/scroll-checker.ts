// Расширенный интерфейс для настройки отслеживания блока
interface ScrollWatcherConfig {
  selector: string;
  threshold?: number;
  callback?: (element: Element, isVisible: boolean) => void;
  onScroll?: (element: Element, scrollData: ScrollData) => void; // Новый колбэк для отслеживания прокрутки
  once?: boolean;
}

// Данные о прокрутке блока
interface ScrollData {
  percentageVisible: number;    // Процент видимости (0-100)
  pixelsVisible: number;        // Количество видимых пикселей
  totalHeight: number;          // Общая высота элемента
  scrolledFromTop: number;      // Сколько пикселей прокручено от верха элемента
  scrolledPercentage: number;   // Процент прокрутки элемента (0-100)
  distanceFromTop: number;      // Расстояние верха элемента от верха экрана
  distanceFromBottom: number;   // Расстояние низа элемента от низа экрана
}

// Расширенный класс для отслеживания прокрутки
class AdvancedScrollWatcher {
  private observer: IntersectionObserver;
  private scrollListener: () => void;
  private watchedElements: Map<Element, ScrollWatcherConfig> = new Map();

  constructor() {
    // Intersection Observer для базовой видимости
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        root: null,
        rootMargin: '0px',
        threshold: Array.from({ length: 101 }, (_, i) => i / 100) // 0%, 1%, 2%, ..., 100%
      }
    );

    // Scroll listener для точного отслеживания
    this.scrollListener = () => this.handleScroll();
    window.addEventListener('scroll', this.scrollListener, { passive: true });
  }

  // Добавить блок для отслеживания
  watch(config: ScrollWatcherConfig): void {
    const elements = document.querySelectorAll(config.selector);
    
    elements.forEach(element => {
      this.watchedElements.set(element, config);
      this.observer.observe(element);
    });
  }

  // Удалить блок из отслеживания
  unwatch(selector: string): void {
    this.watchedElements.forEach((config, element) => {
      if (element.matches(selector)) {
        this.observer.unobserve(element);
        this.watchedElements.delete(element);
      }
    });
  }

  // Обработчик пересечения (базовая видимость)
  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      const config = this.watchedElements.get(entry.target);
      if (!config || !config.callback) return;

      const isVisible = config.threshold ? 
        entry.intersectionRatio >= config.threshold : 
        entry.isIntersecting;
      
      config.callback(entry.target, isVisible);

      if (config.once && isVisible) {
        this.observer.unobserve(entry.target);
        this.watchedElements.delete(entry.target);
      }
    });
  }

  // Обработчик прокрутки (детальные данные)
  private handleScroll(): void {
    this.watchedElements.forEach((config, element) => {
      if (!config.onScroll) return;

      const scrollData = this.calculateScrollData(element);
      config.onScroll(element, scrollData);
    });
  }

  // Вычисление данных прокрутки
private calculateScrollData(element: Element): ScrollData {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  const elementHeight = rect.height;

  // Расстояния
  const distanceFromTop = rect.top;
  const distanceFromBottom = windowHeight - rect.bottom;

	console.log(distanceFromTop)

  // Видимая часть элемента
  const visibleTop = Math.max(0, -distanceFromTop);
  const visibleBottom = Math.max(0, distanceFromBottom);
  const pixelsVisible = Math.max(0, elementHeight - visibleTop - visibleBottom);
  
  // Проценты видимости
  const percentageVisible = Math.min(100, (pixelsVisible / elementHeight) * 100);
  const elementTopY = rect.top; // Позиция верхней границы элемента
  const hasPassedBottomViewport = elementTopY <= windowHeight; // Верхняя граница прошла низ экрана?
  
  let scrolledFromViewportBottom = 0;
  let scrolledPercentage = 0;
  
  if (hasPassedBottomViewport) {
    // Сколько прокручено после того, как верхняя граница прошла низ экрана
    scrolledFromViewportBottom = windowHeight - elementTopY;
    // Процент прокрутки относительно высоты элемента + высоты экрана
    const totalScrollableDistance = elementHeight + windowHeight;
    scrolledPercentage = Math.min(100, (scrolledFromViewportBottom / totalScrollableDistance) * 100);
  }

  return {
    percentageVisible: Math.round(percentageVisible * 100) / 100,
    pixelsVisible: Math.round(pixelsVisible),
    totalHeight: elementHeight,
    scrolledFromTop: Math.round(scrolledFromViewportBottom), // Теперь это scrolledFromViewportBottom
    scrolledPercentage: Math.round(scrolledPercentage * 100) / 100,
    distanceFromTop: Math.round(distanceFromTop),
    distanceFromBottom: Math.round(distanceFromBottom)
  };
}

  // Уничтожить наблюдатель
  destroy(): void {
    this.observer.disconnect();
    window.removeEventListener('scroll', this.scrollListener);
    this.watchedElements.clear();
  }
}


// Создаём экземпляр расширенного наблюдателя
export const advancedScrollWatcher = new AdvancedScrollWatcher();








// Примеры использования:

// 1. Отслеживание точного процента видимости блока
// advancedScrollWatcher.watch({
//   selector: '.about',
//   onScroll: (element, data) => {
//     console.log(`Блок .about виден на ${data.percentageVisible}%`);
//     console.log(`Видимо пикселей: ${data.pixelsVisible} из ${data.totalHeight}`);
//     console.log(`Прокручено от начала: ${data.scrolledPercentage}%`);
    
//     // Например, изменяем opacity в зависимости от видимости
//     if (element instanceof HTMLElement) {
//       element.style.opacity = `${data.percentageVisible / 100}`;
//     }
//   }
// });

// 2. Запуск слайдера при определённом проценте прокрутки
// let sliderWorks = false;
// advancedScrollWatcher.watch({
//   selector: '.about',
//   onScroll: (element, data) => {
//     // Запускаем слайдер, когда блок прокручен на 25%
//     if (data.scrolledPercentage >= 25 && !sliderWorks) {
//       console.log('Блок прокручен на 25%, запускаем слайдер');
//       // changeSlides(5);
//       sliderWorks = true;
//     }
//   }
// });

// 3. Анимация в зависимости от прокрутки
// advancedScrollWatcher.watch({
//   selector: '.advantage-card',
//   onScroll: (element, data) => {
//     if (data.percentageVisible > 50) {
//       // Масштабируем карточку в зависимости от видимости
//       const scale = 0.8 + (data.percentageVisible / 100) * 0.2; // от 0.8 до 1.0
//       if (element instanceof HTMLElement) {
//         element.style.transform = `scale(${scale})`;
//       }
//     }
//   }
// });

// 4. Комбинированное использование (базовая видимость + детальная прокрутка)
// advancedScrollWatcher.watch({
//   selector: '.hero-section',
//   threshold: 0.1, // Базовый порог видимости
//   callback: (element, isVisible) => {
//     console.log(`Секция ${isVisible ? 'появилась' : 'скрылась'}`);
//   },
//   onScroll: (element, data) => {
//     // Детальное отслеживание прокрутки
//     if (data.scrolledPercentage > 80) {
//       console.log('Секция почти полностью прокручена!');
//     }
//   }
// });
