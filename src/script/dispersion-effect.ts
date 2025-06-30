const canvas = document.getElementById("scene");
  const ctx = canvas.getContext("2d");

  let ww = canvas.width = window.innerWidth;
  let wh = canvas.height = window.innerHeight;

  let particles = [];
  let particleCount = 500;
  const gravity = 1;
  const friction = 0.05;

  const mouse = {
    x: -9999,
    y: -9999,
    radius: 100
  };

  let bounceForce = 0.1;

	function createParticles() {
		// Очищаем контейнер
		if ( canvas ) {
			canvas.innerHTML = '';
			particles = [];
			
			// 1. Создаём HTML строку для всех частиц
			let htmlString = '';
			const particlesData = [];
			
			for (let i = 0; i < particleCount; i++) {
				const r = 5 + Math.random() * 5;
				const color = `violet`;
				const x = Math.random() * ww;
				const y = Math.random() * wh * 0.5;
				
				// Сохраняем данные частицы
				particlesData.push({
					x: x,
					y: y,
					r: r,
					vx: (Math.random() - 0.5) * 5,
					vy: 0,
					color: color
				});
				
				// Добавляем HTML для частицы
				htmlString += `
					<div class="particle" style="
						position: absolute;
						width: 30px;
						height: 30px;
						left: ${x - r}px;
						top: ${y - r}px;
						pointer-events: none;
					">
						<svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
							<circle cx="18.4004" cy="18.2998" r="18" fill="#D6E4EC"/>
						</svg>
					</div>
				`;
			}
			
			// 2. Вставляем все элементы одним вызовом
			canvas.insertAdjacentHTML('beforeend', htmlString);
			
			// 3. Собираем созданные элементы циклом
			const particleElements = canvas.querySelectorAll('.particle');
			
			// 4. Связываем данные с элементами
			particleElements.forEach((element, index) => {
				particles.push({
					...particlesData[index],
					element: element
				});
			});
					
		}
	}

  function resolveCollisions() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = p1.r + p2.r;

        if (dist < minDist && dist > 0) {
          const overlap = 0.5 * (minDist - dist);
          const nx = dx / dist;
          const ny = dy / dist;

          p1.x -= overlap * nx;
          p1.y -= overlap * ny;
          p2.x += overlap * nx;
          p2.y += overlap * ny;

          const vxTotal = p1.vx - p2.vx;
          const vyTotal = p1.vy - p2.vy;

          p1.vx = ((p1.vx * (1 - 1)) + (2 * 1 * p2.vx)) / (1 + 1);
          p2.vx = vxTotal + p1.vx;

          p1.vy = ((p1.vy * (1 - 1)) + (2 * 1 * p2.vy)) / (1 + 1);
          p2.vy = vyTotal + p1.vy;
        }
      }
    }
  }

  function updateParticles() {
    for (let p of particles) {
      p.vy += gravity;

      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius + p.r) {
        const angle = Math.atan2(dy, dx);
        const force = (mouse.radius + p.r - dist) * bounceForce;
        p.vx += Math.cos(angle) * force;
        p.vy += Math.sin(angle) * force;
      }

      p.x += p.vx;
      p.y += p.vy;

      const floor = wh - p.r;
      if (p.y > floor) {
        p.y = floor;
        p.vy *= -friction;
        if (Math.abs(p.vy) < 0.1) p.vy = 0;
        p.vx *= 0.7;
      }

      if (p.x < p.r) {
        p.x = p.r;
        p.vx *= -0.7;
      }
      if (p.x > ww - p.r) {
        p.x = ww - p.r;
        p.vx *= -0.7;
      }
    }

    resolveCollisions();
  }

  function drawParticles() {
    ctx.clearRect(0, 0, ww, wh);
    for (let p of particles) {
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function animate() {
    updateParticles();
    drawParticles();
    requestAnimationFrame(animate);
  }

  // Обработка мыши
  window.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener("mouseleave", () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // Слайдеры
  const countRange = document.getElementById("countRange");
  const countValue = document.getElementById("countValue");
  const forceRange = document.getElementById("forceRange");
  const forceValue = document.getElementById("forceValue");

  countRange.addEventListener("input", e => {
    particleCount = parseInt(e.target.value);
    countValue.textContent = particleCount;
    createParticles();
  });

  forceRange.addEventListener("input", e => {
    bounceForce = parseFloat(e.target.value);
    forceValue.textContent = bounceForce.toFixed(2);
  });

  window.addEventListener("resize", () => {
    ww = canvas.width = window.innerWidth;
    wh = canvas.height = window.innerHeight;
    createParticles();
  });

  // Старт
  createParticles();
  animate();