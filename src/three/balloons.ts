/**
 * "Balões de luz" — Three.js puro (sem R3F: uma cena pequena não justifica o runtime extra).
 * Formas orgânicas translúcidas com borda acesa (fresnel) e leve iridescência,
 * em mistura aditiva sobre o fundo escuro do CTA.
 * Reagem ao cursor (afastam-se suavemente) e à velocidade do scroll (ondulam e sobem).
 * O loop só roda quando `start()` é chamado (seção visível).
 */
import {
  AdditiveBlending,
  Color,
  Mesh,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector2,
  WebGLRenderer,
} from 'three';

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;
  uniform float uWobble;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vec3 p = position;
    float w = sin(p.y * 3.1 + uTime * 0.9 + uPhase) * 0.03
            + sin(p.x * 4.3 + uTime * 0.7 + uPhase * 1.7) * 0.022
            + sin(p.z * 3.7 + uTime * 1.1) * 0.018;
    p += normal * w * (1.0 + uWobble * 3.5);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPhase;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);
    float fres = pow(1.0 - abs(dot(n, v)), 2.3);
    vec3 irid = 0.5 + 0.5 * cos(6.28318 * (fres * 0.55 + vec3(0.0, 0.33, 0.67) + uPhase * 0.08));
    vec3 tint = mix(uColor, irid, 0.22 * fres);
    vec3 l = normalize(vec3(-0.45, 0.8, 0.55));
    float spec = pow(max(dot(reflect(-l, n), v), 0.0), 36.0);
    float spec2 = pow(max(dot(reflect(-normalize(vec3(0.6, -0.2, 0.7)), n), v), 0.0), 80.0);
    vec3 c = uColor * 0.18 + tint * fres * 0.95 + vec3(1.0, 0.97, 0.93) * (spec * 0.75 + spec2 * 0.35);
    float a = (0.06 + fres * 0.7 + spec * 0.5) * uOpacity;
    gl_FragColor = vec4(c, a);
  }
`;

const PALETTE = ['#e9cdb9', '#d9a79a', '#f1e7dc', '#cdb6c3', '#e8d6b0', '#c99486', '#efe2e0'];

type Balloon = {
  mesh: Mesh<SphereGeometry, ShaderMaterial>;
  base: { x: number; y: number; z: number; s: number };
  speed: number;
  phase: number;
  push: Vector2;
};

export type BalloonScene = {
  start: () => void;
  stop: () => void;
  setVelocity: (v: number) => void;
  dispose: () => void;
};

export function createBalloons(canvas: HTMLCanvasElement, opts: { count: number; quality: 'high' | 'low' }): BalloonScene {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: opts.quality === 'high', powerPreference: 'low-power' });
  const dprCap = opts.quality === 'high' ? 1.5 : 1.25;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 50);
  camera.position.set(0, 0, 10);

  // geometria de "balão": esfera alongada que afina suavemente na base
  const seg = opts.quality === 'high' ? 64 : 36;
  const geo = new SphereGeometry(1, seg, Math.round(seg * 0.75));
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const taper = y < 0 ? 1 - 0.22 * Math.pow(-y, 1.6) : 1 - 0.04 * y;
    pos.setXYZ(i, pos.getX(i) * taper, y * 1.17, pos.getZ(i) * taper);
  }
  geo.computeVertexNormals();

  const balloons: Balloon[] = [];
  for (let i = 0; i < opts.count; i++) {
    const material = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPhase: { value: Math.random() * 6.28 },
        uWobble: { value: 0 },
        uColor: { value: new Color(PALETTE[i % PALETTE.length]) },
        uOpacity: { value: 0 },
      },
    });
    const mesh = new Mesh(geo, material);
    const spread = (i / Math.max(1, opts.count - 1)) * 2 - 1; // -1..1 distribuídos na largura
    const base = {
      x: spread * 5.2 + (Math.random() - 0.5) * 1.2,
      y: (Math.random() - 0.5) * 7,
      z: -Math.random() * 4.5 + 0.8,
      s: 0.55 + Math.random() * 0.75,
    };
    mesh.scale.setScalar(base.s);
    scene.add(mesh);
    balloons.push({ mesh, base, speed: 0.12 + Math.random() * 0.14, phase: material.uniforms.uPhase.value, push: new Vector2() });
  }

  // tamanho
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // mantém a composição em telas estreitas (afasta a câmera)
    camera.position.z = w / h < 1 ? 14 : 10;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // cursor → ponto no plano z=0
  const pointer = new Vector2(99, 99);
  const pointerTarget = new Vector2(99, 99);
  const onPointer = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
    const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    pointerTarget.set(nx * halfH * camera.aspect, ny * halfH);
  };
  window.addEventListener('pointermove', onPointer, { passive: true });

  let velocity = 0;
  let wobble = 0;
  let raf = 0;
  let running = false;
  let last = 0;
  let elapsed = 0;
  let fadeIn = 0;

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    last = now;
    elapsed += dt;
    fadeIn = Math.min(1, fadeIn + dt * 0.6);

    wobble += (Math.min(1, Math.abs(velocity) / 2500) - wobble) * 0.06;
    velocity *= 0.9;
    pointer.lerp(pointerTarget, 0.08);

    camera.position.x += (pointer.x * 0.04 - camera.position.x) * 0.04;
    camera.position.y += (pointer.y * 0.03 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    for (const b of balloons) {
      const { mesh, base } = b;
      base.y += (b.speed + wobble * 0.9) * dt;
      if (base.y > 5.2) base.y = -5.2;

      // afastamento suave do cursor
      const dx = mesh.position.x - pointer.x;
      const dy = mesh.position.y - pointer.y;
      const d2 = dx * dx + dy * dy;
      const f = Math.exp(-d2 / 2.2) * 0.9;
      b.push.x += (dx * f - b.push.x) * 0.05;
      b.push.y += (dy * f - b.push.y) * 0.05;

      mesh.position.set(base.x + Math.sin(elapsed * 0.35 + b.phase) * 0.35 + b.push.x, base.y + b.push.y, base.z);
      mesh.rotation.z = Math.sin(elapsed * 0.4 + b.phase) * 0.12 + b.push.x * 0.08;
      mesh.rotation.x = Math.cos(elapsed * 0.3 + b.phase) * 0.08;

      const u = mesh.material.uniforms;
      u.uTime.value = elapsed;
      u.uWobble.value = wobble;
      // some nas bordas verticais para o loop não "pular"
      const edge = 1 - Math.min(1, Math.max(0, (Math.abs(base.y) - 3.8) / 1.4));
      u.uOpacity.value = fadeIn * edge;
    }
    renderer.render(scene, camera);
  };

  return {
    start() {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    setVelocity(v: number) {
      velocity = v;
    },
    dispose() {
      cancelAnimationFrame(raf);
      running = false;
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
      balloons.forEach((b) => b.mesh.material.dispose());
      geo.dispose();
      renderer.dispose();
    },
  };
}
