import { useEffect, useRef, useState } from 'react';
import {
  ACESFilmicToneMapping,
  AmbientLight,
  BoxGeometry,
  CapsuleGeometry,
  CylinderGeometry,
  DirectionalLight,
  Group,
  InstancedMesh,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  WebGLRenderer,
  type BufferGeometry,
  type Material,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * The hero "vault dial": a machined green/brass safe wheel that tilts toward the
 * cursor, spins on scroll and drifts a few coins around it. Pure three.js, no
 * external assets — reflections come from the built-in RoomEnvironment.
 *
 * It pauses when off-screen / tab hidden and renders a single still frame under
 * prefers-reduced-motion. If WebGL is unavailable we show an SVG dial instead.
 */
export default function Hero3D({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setFailed(true);
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    mount.appendChild(renderer.domElement);

    const scene = new Scene();
    const pmrem = new PMREMGenerator(renderer);
    const envScene = new RoomEnvironment();
    const envTarget = pmrem.fromScene(envScene, 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.95;

    const camera = new PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 0, 10.5);

    scene.add(new AmbientLight(0xfff4e0, 0.35));
    const key = new DirectionalLight(0xffe8c8, 2.2);
    key.position.set(3.5, 4.5, 6);
    scene.add(key);
    const rim = new DirectionalLight(0x9be0b8, 1.1);
    rim.position.set(-5, -2, 3);
    scene.add(rim);

    // ── materials ──
    const green = new MeshPhysicalMaterial({ color: 0x1c6f45, metalness: 0.5, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12 });
    const deep = new MeshPhysicalMaterial({ color: 0x0a3620, metalness: 0.65, roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.2 });
    const brass = new MeshPhysicalMaterial({ color: 0xd8b56c, metalness: 1, roughness: 0.22, clearcoat: 0.4 });
    const ivory = new MeshStandardMaterial({ color: 0xf4f2eb, roughness: 0.55, metalness: 0.05 });

    const geometries: BufferGeometry[] = [];
    const materials: Material[] = [green, deep, brass, ivory];
    const geo = <T extends BufferGeometry>(g: T): T => {
      geometries.push(g);
      return g;
    };

    // ── dial ──
    const dial = new Group();
    scene.add(dial);

    const outer = new Mesh(geo(new TorusGeometry(2.45, 0.16, 48, 180)), deep);
    dial.add(outer);

    const bezel = new Mesh(geo(new TorusGeometry(2.08, 0.05, 32, 180)), brass);
    bezel.position.z = 0.06;
    dial.add(bezel);

    const plate = new Mesh(geo(new CylinderGeometry(2.05, 2.05, 0.14, 120)), green);
    plate.rotation.x = Math.PI / 2;
    plate.position.z = -0.02;
    dial.add(plate);

    // tick ring (rotates)
    const tickRing = new Group();
    const tickGeo = geo(new BoxGeometry(0.035, 0.2, 0.07));
    const bigTickGeo = geo(new BoxGeometry(0.05, 0.34, 0.08));
    const ticks = new InstancedMesh(tickGeo, ivory, 72);
    const bigTicks = new InstancedMesh(bigTickGeo, brass, 12);
    const dummy = new Object3D();
    let big = 0;
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      const isBig = i % 6 === 0;
      const r = isBig ? 1.78 : 1.82;
      dummy.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.1);
      dummy.rotation.set(0, 0, a - Math.PI / 2);
      dummy.updateMatrix();
      if (isBig) bigTicks.setMatrixAt(big++, dummy.matrix);
      else ticks.setMatrixAt(i - big, dummy.matrix);
    }
    ticks.count = 72 - 12;
    tickRing.add(ticks, bigTicks);
    dial.add(tickRing);

    const inner = new Mesh(geo(new CylinderGeometry(1.32, 1.32, 0.3, 96)), deep);
    inner.rotation.x = Math.PI / 2;
    inner.position.z = 0.08;
    dial.add(inner);

    const innerRim = new Mesh(geo(new TorusGeometry(1.32, 0.035, 24, 140)), brass);
    innerRim.position.z = 0.24;
    dial.add(innerRim);

    // wheel handle (spins)
    const handle = new Group();
    handle.position.z = 0.3;
    const spokeGeo = geo(new CapsuleGeometry(0.075, 1.75, 10, 24));
    for (let i = 0; i < 3; i++) {
      const spoke = new Mesh(spokeGeo, brass);
      spoke.position.y = 0;
      spoke.rotation.z = (i / 3) * Math.PI;
      handle.add(spoke);
    }
    const knobGeo = geo(new SphereGeometry(0.15, 32, 32));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const knob = new Mesh(knobGeo, brass);
      knob.position.set(Math.cos(a) * 0.98, Math.sin(a) * 0.98, 0);
      handle.add(knob);
    }
    const hub = new Mesh(geo(new SphereGeometry(0.34, 48, 48)), green);
    hub.scale.z = 0.7;
    handle.add(hub);
    dial.add(handle);

    // ── orbiting coins ──
    const coins = new Group();
    scene.add(coins);
    const coinGeo = geo(new CylinderGeometry(0.2, 0.2, 0.045, 40));
    const coinRimGeo = geo(new TorusGeometry(0.17, 0.012, 12, 40));
    const coinData = Array.from({ length: 16 }, (_, i) => {
      const coin = new Group();
      const face = new Mesh(coinGeo, brass);
      face.rotation.x = Math.PI / 2;
      const rimMesh = new Mesh(coinRimGeo, brass);
      rimMesh.position.z = 0.03;
      coin.add(face, rimMesh);
      const radius = 3.2 + (i % 4) * 0.45;
      const angle = (i / 16) * Math.PI * 2;
      const tilt = (Math.random() - 0.5) * 1.6;
      coin.scale.setScalar(0.7 + (i % 3) * 0.25);
      coins.add(coin);
      return { coin, radius, angle, speed: 0.04 + (i % 5) * 0.012, tilt, bob: Math.random() * 6 };
    });

    // ── interaction state ──
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let hovering = false;
    let boost = 0;
    let visible = true;
    let rafId = 0;
    let disposed = false;

    const onMove = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect();
      pointer.tx = MathUtils.clamp(((e.clientX - (r.left + r.width / 2)) / window.innerWidth) * 2.2, -1, 1);
      pointer.ty = MathUtils.clamp(((e.clientY - (r.top + r.height / 2)) / window.innerHeight) * 2.2, -1, 1);
    };
    const onEnter = () => (hovering = true);
    const onLeave = () => (hovering = false);
    if (!coarse) window.addEventListener('pointermove', onMove, { passive: true });
    mount.addEventListener('pointerenter', onEnter);
    mount.addEventListener('pointerleave', onLeave);

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // keep the whole dial in frame on narrow / short canvases
      camera.position.z = camera.aspect < 0.9 ? 10.5 / Math.max(camera.aspect, 0.62) * 0.92 : 10.5;
      camera.updateProjectionMatrix();
      if (reduceMotion) renderer.render(scene, camera);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    const clock = { last: performance.now(), t: 0 };

    const frame = (now: number) => {
      rafId = 0;
      if (disposed) return;
      const dt = Math.min(0.05, (now - clock.last) / 1000);
      clock.last = now;
      clock.t += dt;
      const t = clock.t;

      const heroH = Math.max(window.innerHeight * 0.95, 1);
      const p = MathUtils.clamp(window.scrollY / heroH, 0, 1.4);

      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      boost += ((hovering ? 1 : 0) - boost) * 0.05;

      dial.rotation.y = pointer.x * 0.5 + p * 0.9;
      dial.rotation.x = -pointer.y * 0.32 + 0.1 + p * 0.25;
      dial.position.y = Math.sin(t * 0.6) * 0.08 - p * 0.9;
      dial.scale.setScalar(1 - Math.min(p, 1) * 0.22);

      tickRing.rotation.z = -t * 0.06 - p * 2.4;
      handle.rotation.z = t * (0.12 + boost * 0.9) + p * 3.2;
      outer.rotation.z = t * 0.02;

      coinData.forEach((c, i) => {
        const a = c.angle + t * c.speed + p * 0.6;
        c.coin.position.set(Math.cos(a) * c.radius, Math.sin(a * 1.0 + c.tilt) * c.radius * 0.55 + Math.sin(t * 0.7 + c.bob) * 0.12, Math.sin(a) * 1.4 - 0.4);
        c.coin.rotation.set(t * 0.4 + i, t * 0.55 + c.tilt, 0);
      });
      coins.rotation.z = pointer.x * 0.06;

      renderer.render(scene, camera);
      if (!reduceMotion && visible && !document.hidden) rafId = requestAnimationFrame(frame);
    };

    const start = () => {
      if (reduceMotion || rafId || disposed) return;
      clock.last = performance.now();
      rafId = requestAnimationFrame(frame);
    };

    if (reduceMotion) {
      frame(performance.now());
    } else {
      start();
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
      },
      { threshold: 0.01 },
    );
    io.observe(mount);
    const onVis = () => {
      if (!document.hidden) start();
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onMove);
      mount.removeEventListener('pointerenter', onEnter);
      mount.removeEventListener('pointerleave', onLeave);
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      ticks.dispose();
      bigTicks.dispose();
      envTarget.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);

  if (failed) return <DialFallback className={className} />;
  return <div ref={mountRef} className={className} />;
}

/** Flat SVG version for browsers without WebGL. */
function DialFallback({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden>
        <defs>
          <radialGradient id="fg" cx="40%" cy="35%" r="75%">
            <stop offset="0%" stopColor="#2a8a5b" />
            <stop offset="100%" stopColor="#0f4a2e" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="170" fill="#0a3620" />
        <circle cx="200" cy="200" r="146" fill="url(#fg)" />
        <circle cx="200" cy="200" r="146" fill="none" stroke="#d8b56c" strokeWidth="3" />
        {Array.from({ length: 72 }, (_, i) => {
          const a = (i / 72) * Math.PI * 2;
          const big = i % 6 === 0;
          const r1 = big ? 112 : 120;
          return <line key={i} x1={200 + Math.cos(a) * r1} y1={200 + Math.sin(a) * r1} x2={200 + Math.cos(a) * 132} y2={200 + Math.sin(a) * 132} stroke={big ? '#d8b56c' : '#f4f2eb'} strokeWidth={big ? 3 : 1.5} />;
        })}
        <circle cx="200" cy="200" r="90" fill="#0a3620" />
        {[0, 60, 120].map((deg) => (
          <rect key={deg} x="196" y="110" width="8" height="180" rx="4" fill="#d8b56c" transform={`rotate(${deg} 200 200)`} />
        ))}
        <circle cx="200" cy="200" r="26" fill="#1c6f45" stroke="#d8b56c" strokeWidth="3" />
      </svg>
    </div>
  );
}
