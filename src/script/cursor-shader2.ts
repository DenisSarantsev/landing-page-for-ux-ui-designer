import {
                Polyline,
                Renderer,
                Transform,
                Geometry,
                Program,
                Mesh,
                Vec3,
                Vec2,
                Color
            } from 'https://cdn.jsdelivr.net/npm/ogl@0.0.25/dist/ogl.mjs'

const vertex = `
    attribute vec3 position;
    attribute vec3 next;
    attribute vec3 prev;
    attribute vec2 uv;
    attribute float side;

    uniform vec2 uResolution;
    uniform float uDPR;
    uniform float uThickness;
    uniform float uTime;

    vec4 getPosition() {
        vec2 aspect = vec2(uResolution.x / uResolution.y, 1);
        vec2 nextScreen = next.xy * aspect;
        vec2 prevScreen = prev.xy * aspect;

        vec2 tangent = normalize(nextScreen - prevScreen);
        vec2 normal = vec2(-tangent.y, tangent.x);
        normal /= aspect;
        
// ✅ СУПЕР-ЭКСТРЕМАЛЬНАЯ КЛЯКСА
float megaBlob = pow(uv.x, 0.3) * 35.0;

// ✅ ФИНАЛЬНЫЙ ХАОС В КОНЦЕ
float finalChaos = pow(smoothstep(0.75, 1.0, uv.x), 1.5) * 80.0;

// ✅ МНОЖЕСТВЕННЫЕ НЕПРАВИЛЬНЫЕ ФОРМЫ
float weirdShape = 0.0;
if (uv.x > 0.5) {
    float shapeZone = (uv.x - 0.5) / 0.5;
    weirdShape = sin(uv.y * 20.0 + uTime * 4.0) * shapeZone * 25.0 +
                cos(uv.y * 30.0 + uTime * 3.0) * shapeZone * 20.0 +
                sin(uv.y * 45.0 + uTime * 5.0) * shapeZone * 15.0 +
                cos(uv.y * 65.0) * shapeZone * 12.0 +
                sin(uv.y * 85.0 + uTime * 2.5) * shapeZone * 10.0;
}

// ✅ ЭКСТРЕМАЛЬНЫЕ ВЫПУКЛОСТИ В САМОМ КОНЦЕ
float extremeBumps = 0.0;
if (uv.x > 0.9) {
    float bumpZone = (uv.x - 0.9) / 0.1;
    extremeBumps = sin(uv.y * 150.0 + uTime * 8.0) * bumpZone * 30.0 +
                   cos(uv.y * 200.0 + uTime * 6.0) * bumpZone * 25.0;
}

// ✅ ПУЛЬСАЦИЯ
float pulsation = 0.7 + 0.3 * sin(uv.x * 8.0 + uTime * 4.0);

// ✅ ИТОГОВАЯ НЕПРАВИЛЬНАЯ ФОРМА
float finalWidth = (0.2 + megaBlob + finalChaos + weirdShape + extremeBumps) * pulsation;
        
        float taper = 1.0 - pow(abs(uv.y - 0.5) * 2.0, 6.0);
        normal *= taper * finalWidth;

        float pixelWidth = 1.0 / (uResolution.y / uDPR);
        normal *= pixelWidth * uThickness;

        float dist = length(nextScreen - prevScreen);
        normal *= smoothstep(0.0, 0.02, dist);

        vec4 current = vec4(position, 1);
        current.xy -= normal * side;
        return current;
    }

    void main() {
        gl_Position = getPosition();
    }
`

            {
                const renderer = new Renderer({ dpr: 2, alpha: true })
                const gl = renderer.gl
                document.body.appendChild(gl.canvas)
             

                const scene = new Transform()

                const lines = []

                function resize() {
                    renderer.setSize(window.innerWidth, window.innerHeight)

                    // We call resize on the polylines to update their resolution uniforms
                    lines.forEach(line => line.polyline.resize())
                }
                window.addEventListener('resize', resize, false)

                // If you're interested in learning about drawing lines with geometry,
                // go through this detailed article by Matt DesLauriers
                // https://mattdesl.svbtle.com/drawing-lines-is-hard
                // It's an excellent breakdown of the approaches and their pitfalls.

                // In this example, we're making screen-space polylines. Basically it
                // involves creating a geometry of vertices along a path - with two vertices
                // at each point. Then in the vertex shader, we push each pair apart to
                // give the line some width.

                // Just a helper function to make the code neater
                function random(a, b) {
                    const alpha = Math.random()
                    return a * (1.0 - alpha) + b * alpha
                }

                // We're going to make a number of different coloured lines for fun.
								// Вместо массива цветов и forEach создаём только одну линию:
							const line = {
									spring: 0.025,
									friction: 0.88,
									mouseVelocity: new Vec3(),
									mouseOffset: new Vec3(0, 0, 0),
									waveSpeed: 1.2,
									waveAmplitude: 0.04,
									thicknessBase: 4,
									thicknessRange: 2,
									timeOffset: 0
							}

							const count = 25
							const points = (line.points = [])
							for (let i = 0; i < count; i++) points.push(new Vec3())

							line.polyline = new Polyline(gl, {
									points,
									vertex,
									uniforms: {
											uColor: { value: new Color('#3700ff') },
											uThickness: { value: line.thicknessBase },
											uTime: { value: 0 }
									}
							})

							line.polyline.mesh.setParent(scene)
							lines.push(line)

                // Call initial resize after creating the polylines
                resize()

                // Add handlers to get mouse position
                const mouse = new Vec3()
                if ('ontouchstart' in window) {
                    window.addEventListener('touchstart', updateMouse, false)
                    window.addEventListener('touchmove', updateMouse, false)
                } else {
                    window.addEventListener('mousemove', updateMouse, false)
                }

                function updateMouse(e) {
                    if (e.changedTouches && e.changedTouches.length) {
                        e.x = e.changedTouches[0].pageX
                        e.y = e.changedTouches[0].pageY
                    }
                    if (e.x === undefined) {
                        e.x = e.pageX
                        e.y = e.pageY
                    }

                    // Get mouse value in -1 to 1 range, with y flipped
                    mouse.set((e.x / gl.renderer.width) * 2 - 1, (e.y / gl.renderer.height) * -2 + 1, 0)
                }

                const tmp = new Vec3()

                requestAnimationFrame(update)
                function update(t) {
                    requestAnimationFrame(update)

                    lines.forEach(line => {
                        // Update polyline input points
                        for (let i = line.points.length - 1; i >= 0; i--) {
                            if (!i) {
                                // For the first point, spring ease it to the mouse position
                                tmp.copy(mouse)
                                    .add(line.mouseOffset)
                                    .sub(line.points[i])
                                    .multiply(line.spring)
                                line.mouseVelocity.add(tmp).multiply(line.friction)
                                line.points[i].add(line.mouseVelocity)
                            } else {
                                // The rest of the points ease to the point in front of them, making a line
                                line.points[i].lerp(line.points[i - 1],0.5)
                            }
                        }
                        line.polyline.updateGeometry()
                    })

                    renderer.render({ scene })
                }
            }
