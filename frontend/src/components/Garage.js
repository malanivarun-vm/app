import React, { Component, Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Html,
  ContactShadows,
  Environment,
  Lightformer,
  MeshReflectorMaterial,
} from "@react-three/drei";
import * as THREE from "three";

const HOTSPOTS = [
  { id: "engine", label: "ENGINE", chapter: "engine", pos: [0, 1.08, 1.5] },
  { id: "tyre-fl", label: "TYRES · SAINT-GOBAIN", chapter: "tyres", firm: 0, pos: [-1.0, 0.34, -1.1] },
  { id: "tyre-fr", label: "TYRES · MAZDA MOTOR", chapter: "tyres", firm: 1, pos: [1.0, 0.34, -1.1] },
  { id: "tyre-rl", label: "TYRES · GURPREET", chapter: "tyres", firm: 2, pos: [-1.0, 0.37, 1.42] },
  { id: "tyre-rr", label: "TYRES · SMARTSTAFF", chapter: "tyres", firm: 3, pos: [1.0, 0.37, 1.42] },
  { id: "fuel", label: "FUEL TANK", chapter: "fuel", pos: [1.02, 0.63, 0.5] },
  { id: "suspension", label: "SUSPENSION", chapter: "suspension", pos: [-1.02, 0.5, -1.05] },
  { id: "cockpit", label: "COCKPIT", chapter: "cockpit", pos: [-0.5, 1.12, -0.35] },
  { id: "headlights", label: "HEADLIGHTS", chapter: "headlights", pos: [0, 0.6, -2.25] },
  { id: "satnav", label: "SAT NAV", chapter: "satnav", pos: [0.48, 1.02, -0.8] },
];

class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { err: false, reported: false };
  }
  static getDerivedStateFromError() {
    return { err: true };
  }
  componentDidCatch() {
    if (!this.state.reported) {
      this.setState({ reported: true });
      this.props.onError && this.props.onError();
    }
  }
  render() {
    return this.props.children;
  }
}

function CarPrimitive({ onReady, phase }) {
  const gltf = useGLTF("/models/car.glb", true);
  const scene = useMemo(() => {
    const s = gltf.scene.clone(true);
    s.traverse((o) => {
      if (o.isMesh) {
        if (/logo/i.test(o.name)) o.visible = false;
        if (o.material && "envMapIntensity" in o.material) o.material.envMapIntensity = 0.12;
      }
    });
    const box = new THREE.Box3().setFromObject(s);
    s.position.set(
      -(box.min.x + box.max.x) / 2,
      -box.min.y,
      -(box.min.z + box.max.z) / 2
    );
    return s;
  }, [gltf]);

  const mats = useMemo(() => {
    const list = [];
    scene.traverse((o) => {
      if (o.isMesh && o.material && "envMapIntensity" in o.material && o.visible) list.push(o.material);
    });
    return list;
  }, [scene]);

  useFrame((_, dt) => {
    const target = phase === "igniting" || phase === "on" ? 0.85 : 0.12;
    const step = Math.min(dt, 0.05);
    for (const m of mats) m.envMapIntensity = THREE.MathUtils.damp(m.envMapIntensity, target, 4, step);
  });

  useEffect(() => {
    onReady && onReady();
  }, [onReady]);

  return <primitive object={scene} />;
}

function Hotspot({ h, phase, panel, openPanel, isMobile, colliderRef }) {
  const active =
    panel && panel.chapter === h.chapter && (panel.firm == null || panel.firm === h.firm);
  return (
    <Html
      position={h.pos}
      center
      distanceFactor={isMobile ? 6.5 : 8}
      zIndexRange={[50, 0]}
      occlude={isMobile ? undefined : [colliderRef]}
      wrapperClass="hs-wrap"
    >
      <button
        data-testid={`hotspot-${h.id}`}
        className={`hotspot ${phase === "on" ? "hs-show" : ""} ${active ? "hs-active" : ""}`}
        onClick={() => openPanel(h.chapter, h.firm ?? null)}
        aria-label={h.label}
      >
        <span className="hs-core" />
        <span className="hs-pulse" />
        <span className="hs-label">{h.label}</span>
      </button>
    </Html>
  );
}

function Turntable({ speed, children }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (!ref.current) return;
    const d = Math.min(dt, 0.05);
    ref.current.rotation.y += d * speed;
  });
  return <group ref={ref}>{children}</group>;
}

function HeadlightBeams({ active }) {
  const mats = useRef([]);
  const lights = useRef([]);
  const k = useRef(0);
  useFrame((_, dt) => {
    k.current = THREE.MathUtils.damp(k.current, active ? 1 : 0, 5, Math.min(dt, 0.05));
    mats.current.forEach((m) => {
      if (m) m.opacity = 0.14 * k.current;
    });
    lights.current.forEach((l) => {
      if (l) l.intensity = 9 * k.current;
    });
  });
  // apex sits at the headlight, cone widens forward (-Z): +Y maps to +Z
  return (
    <group position={[0, 0.52, -2.05]}>
      {[0, 1].map((i) => {
        const x = i === 0 ? -0.58 : 0.58;
        return (
          <React.Fragment key={i}>
            <mesh position={[x, 0, -2.35]} rotation={[Math.PI / 2 - 0.05, 0, 0]}>
              <coneGeometry args={[0.85, 4.7, 32, 1, true]} />
              <meshBasicMaterial
                ref={(m) => (mats.current[i] = m)}
                color="#dfe9ff"
                transparent
                opacity={0}
                depthWrite={false}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                fog={false}
              />
            </mesh>
            <pointLight
              ref={(l) => (lights.current[i] = l)}
              position={[x, 0.05, -0.5]}
              color="#dfe8ff"
              intensity={0}
              distance={7}
              decay={1.8}
            />
          </React.Fragment>
        );
      })}
    </group>
  );
}

function LightsRig({ phase, isMobile }) {
  const spot = useRef();
  const cone = useRef();
  const rimR = useRef();
  const rimB = useRef();
  const ring = useRef();
  const amb = useRef();

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const on = phase === "igniting" || phase === "on";
    let flicker = 1;
    if (phase === "igniting") {
      flicker = 0.55 + 0.45 * Math.abs(Math.sin(t * 21) * Math.sin(t * 7.3));
    }
    const damp = THREE.MathUtils.damp;
    const step = Math.min(dt, 0.05);
    if (amb.current) amb.current.intensity = damp(amb.current.intensity, on ? 0.12 : 0.035, 4, step);
    if (spot.current)
      spot.current.intensity = damp(spot.current.intensity, on ? (isMobile ? 260 : 380) * flicker : 0, 5, step);
    if (cone.current)
      cone.current.material.opacity = damp(cone.current.material.opacity, on ? 0.055 : 0, 5, step);
    if (rimR.current) rimR.current.intensity = damp(rimR.current.intensity, on ? 26 : 0, 4, step);
    if (rimB.current) rimB.current.intensity = damp(rimB.current.intensity, on ? 14 : 0, 4, step);
    if (ring.current)
      ring.current.material.emissiveIntensity = damp(ring.current.material.emissiveIntensity, on ? 2.4 : 0, 4, step);
  });

  return (
    <>
      <ambientLight ref={amb} intensity={0.035} />
      <spotLight
        ref={spot}
        position={[0, 7.2, 0.4]}
        angle={0.44}
        penumbra={0.9}
        distance={30}
        decay={1.6}
        color="#fff3e2"
        intensity={0}
      />
      <mesh ref={cone} position={[0, 3.7, 0.2]}>
        <coneGeometry args={[2.95, 7.1, 48, 1, true]} />
        <meshBasicMaterial
          color="#ffedd6"
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </mesh>
      <pointLight ref={rimR} position={[-4.2, 1.1, 2.6]} color="#ff2214" intensity={0} distance={13} decay={2} />
      <pointLight ref={rimB} position={[4.2, 0.9, -3.2]} color="#8fb0ff" intensity={0} distance={13} decay={2} />
      <mesh ref={ring} rotation-x={-Math.PI / 2} position={[0, 0.012, 0]}>
        <torusGeometry args={[2.8, 0.016, 12, 128]} />
        <meshStandardMaterial color="#1a0505" emissive="#ff1a0e" emissiveIntensity={0} toneMapped={false} />
      </mesh>
    </>
  );
}

function Dust({ count }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 0.5 + Math.random() * 2.3;
      const a = Math.random() * Math.PI * 2;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = Math.random() * 5.2;
      arr[i * 3 + 2] = Math.sin(a) * r;
    }
    return arr;
  }, [count]);
  useFrame((state, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y -= Math.min(dt, 0.05) * 0.035;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.22) * 0.15;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#ffd9b8"
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function SceneContents({ phase, panel, openPanel, onReady, isMobile, reduced, still }) {
  const colliderRef = useRef();

  const speed = reduced ? 0 : panel ? 0.015 : isMobile ? 0.05 : 0.09;

  return (
    <>
      <LightsRig phase={phase} isMobile={isMobile} />
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={1.3} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[9, 4, 1]} color="#fff4e4" />
        <Lightformer intensity={0.45} position={[-5, 1.5, 2]} rotation-y={Math.PI / 2} scale={[6, 1.2, 1]} color="#ff2a18" />
        <Lightformer intensity={0.3} position={[5, 1.2, -2]} rotation-y={-Math.PI / 2} scale={[6, 1, 1]} color="#9db8ff" />
      </Environment>

      <mesh rotation-x={-Math.PI / 2} position={[0, -0.101, 0]}>
        <circleGeometry args={[40, 64]} />
        {isMobile || still ? (
          <meshStandardMaterial color="#070708" metalness={0.3} roughness={0.85} />
        ) : (
          <MeshReflectorMaterial
            blur={[280, 60]}
            resolution={512}
            mixBlur={1}
            mixStrength={7}
            roughness={0.92}
            depthScale={1.1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#060607"
            metalness={0.35}
            mirror={0.55}
          />
        )}
      </mesh>

      <ContactShadows position={[0, 0.012, 0]} scale={13} blur={2.4} far={2.4} opacity={0.75} color="#000000" />

      <Turntable speed={speed}>
        <mesh position={[0, -0.045, 0]}>
          <cylinderGeometry args={[2.78, 2.92, 0.1, 96]} />
          <meshStandardMaterial color="#0a0a0c" metalness={0.55} roughness={0.5} />
        </mesh>
        <group position={[0, 0.005, 0]}>
          <CarPrimitive onReady={onReady} phase={phase} />
          <mesh ref={colliderRef} position={[0, 0.5, 0]}>
            <boxGeometry args={[1.8, 1.0, 4.4]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
          </mesh>
          <HeadlightBeams active={panel && panel.chapter === "headlights"} />
          {HOTSPOTS.map((h) => (
            <Hotspot
              key={h.id}
              h={h}
              phase={phase}
              panel={panel}
              openPanel={openPanel}
              isMobile={isMobile}
              colliderRef={colliderRef}
            />
          ))}
        </group>
      </Turntable>

      {!reduced && <Dust count={isMobile ? 40 : 140} />}
    </>
  );
}

export default function Garage({ phase, panel, openPanel, onReady, onModelError, isMobile, reduced }) {
  const still = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("still");
  const calm = reduced || still;
  return (
    <SceneErrorBoundary onError={onModelError}>
      <Canvas
        className="stage-canvas"
        dpr={still ? 1 : [1, isMobile ? 1.6 : 2]}
        camera={{ position: [3.9, 1.5, -4.4], fov: 34, near: 0.1, far: 90 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#050506"]} />
        <fog attach="fog" args={["#050506", 13, 32]} />
        <Suspense fallback={null}>
          <SceneContents
            phase={phase}
            panel={panel}
            openPanel={openPanel}
            onReady={onReady}
            isMobile={isMobile}
            reduced={calm}
            still={still}
          />
        </Suspense>
        <OrbitControls
          makeDefault
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.6}
          zoomSpeed={0.8}
          minDistance={2.9}
          maxDistance={10.5}
          minPolarAngle={0.5}
          maxPolarAngle={1.45}
          target={[0, 0.55, 0]}
          enabled={!panel || !isMobile}
        />
      </Canvas>
    </SceneErrorBoundary>
  );
}

export function FallbackStage({ phase, panel, openPanel }) {
  return (
    <div className="fallback-stage">
      <img
        src="https://static.prod-images.emergentagent.com/jobs/c4d98454-acb9-462f-8a91-cc9fd996caca/images/31aafe2b37236e17050c7d552adeac478e48bb38c6c2b9f0ce9f51758e38751e.jpeg"
        alt="Dark hybrid hypercar under a garage spotlight, side view"
      />
      {HS_FALLBACK_POS.map((h) => (
        <button
          key={h.id}
          data-testid={`fallback-hotspot-${h.id}`}
          className={`fallback-hotspot ${phase === "on" ? "hs-show" : ""} ${
            panel && panel.chapter === h.chapter ? "hs-active" : ""
          }`}
          style={{ left: `${h.x}%`, top: `${h.y}%`, opacity: phase === "on" ? 1 : 0, pointerEvents: phase === "on" ? "auto" : "none" }}
          onClick={() => openPanel(h.chapter, h.firm ?? null)}
        >
          {h.label}
        </button>
      ))}
    </div>
  );
}

const HS_FALLBACK_POS = [
  { id: "headlights", label: "HEADLIGHTS", chapter: "headlights", x: 9, y: 54 },
  { id: "satnav", label: "SAT NAV", chapter: "satnav", x: 37, y: 28 },
  { id: "cockpit", label: "COCKPIT", chapter: "cockpit", x: 47, y: 38 },
  { id: "suspension", label: "SUSPENSION", chapter: "suspension", x: 27, y: 63 },
  { id: "tyre-fl", label: "TYRES · SAINT-GOBAIN", chapter: "tyres", firm: 0, x: 20, y: 80 },
  { id: "tyre-fr", label: "TYRES · MAZDA MOTOR", chapter: "tyres", firm: 1, x: 40, y: 74 },
  { id: "fuel", label: "FUEL TANK", chapter: "fuel", x: 62, y: 60 },
  { id: "tyre-rl", label: "TYRES · GURPREET", chapter: "tyres", firm: 2, x: 57, y: 74 },
  { id: "engine", label: "ENGINE", chapter: "engine", x: 90, y: 46 },
  { id: "tyre-rr", label: "TYRES · SMARTSTAFF", chapter: "tyres", firm: 3, x: 75, y: 80 },
];

useGLTF.preload("/models/car.glb");
