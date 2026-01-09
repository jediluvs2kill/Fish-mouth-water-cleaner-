import React, { useRef, useMemo } from 'react';
import { useFrame, Canvas } from '@react-three/fiber';
import { Float, Environment, OrbitControls, Stars, Sparkles, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';
import { SimulationState, ViewMode, ParticleType } from '../types';

interface BioFilter3DProps {
  simulationState: SimulationState;
  viewMode: ViewMode;
}

// --- Geometry Components ---

interface GillArchProps {
    z: number;
    index: number;
    total: number;
    viewMode: ViewMode;
}

// A single "Gill Arch" - curved bone structure
const GillArch: React.FC<GillArchProps> = ({ z, index, total, viewMode }) => {
  const scale = 2.5 - (index * 0.15); // Tapering cone shape
  const isProduct = viewMode === 'PRODUCT';
  
  // Create a custom curved shape for the rib
  const curve = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const angle = Math.PI * 1.2 * (t - 0.5); // Arc from -0.6PI to 0.6PI
        points.push(new THREE.Vector3(Math.cos(angle) * scale, Math.sin(angle) * scale, 0));
    }
    return new THREE.CatmullRomCurve3(points);
  }, [scale]);

  return (
    <group position={[0, 0, z]}>
      {/* The Arch Structure */}
      <mesh>
        <tubeGeometry args={[curve, 64, isProduct ? 0.05 : 0.08, 8, false]} />
        <meshStandardMaterial 
          color={isProduct ? "#94a3b8" : "#e2e8f0"} 
          roughness={isProduct ? 0.2 : 0.3} 
          metalness={isProduct ? 0.8 : 0.6}
          emissive={isProduct ? "#000000" : "#38bdf8"}
          emissiveIntensity={isProduct ? 0 : 0.1}
        />
      </mesh>

      {/* The Rakers (Filtering Bristles) - projecting inwards */}
      {Array.from({ length: 16 }).map((_, i) => {
        const t = i / 15;
        const angle = Math.PI * 1.2 * (t - 0.5);
        // Position on the arch
        const x = Math.cos(angle) * scale;
        const y = Math.sin(angle) * scale;
        
        return (
          <mesh key={i} position={[x, y, 0]} rotation={[0, 0, angle + Math.PI/2]}>
            <coneGeometry args={[isProduct ? 0.015 : 0.02, 0.6, 6]} />
            <meshStandardMaterial 
                color={isProduct ? "#cbd5e1" : "#f472b6"} 
                transparent 
                opacity={0.6} 
                emissive={isProduct ? "#ffffff" : "#ec4899"}
                emissiveIntensity={0.2}
                metalness={isProduct ? 0.5 : 0}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// --- Product Visualization Components ---

const ProductHousing = () => {
  return (
    <group>
        {/* Main Transparent Cylinder Housing */}
        <mesh position={[0, 0, -2]} rotation={[Math.PI/2, 0, 0]}>
            <cylinderGeometry args={[3.2, 4, 20, 32, 1, true]} />
            <meshPhysicalMaterial 
                color="#cbd5e1" 
                transmission={0.9} 
                roughness={0.1} 
                thickness={0.5} 
                transparent 
                opacity={0.3} 
                side={THREE.DoubleSide}
            />
        </mesh>

        {/* End Caps (Inlet/Outlet) rings */}
        <mesh position={[0, 0, 8]} rotation={[Math.PI/2, 0, 0]}>
            <torusGeometry args={[4, 0.1, 16, 64]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, -12]} rotation={[Math.PI/2, 0, 0]}>
            <torusGeometry args={[3.2, 0.1, 16, 64]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* 3D Labels */}
        <group position={[0, 3.5, 8]}>
            <Text fontSize={0.5} color="#ef4444" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
                DIRTY WATER INLET
            </Text>
            <mesh position={[0, -1, 0]} rotation={[0, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 1.5]} />
                <meshBasicMaterial color="#ef4444" />
                <mesh position={[0, 0.8, 0]} rotation={[0, 0, 0]}>
                   <coneGeometry args={[0.15, 0.4, 8]} />
                   <meshBasicMaterial color="#ef4444" />
                </mesh>
            </mesh>
        </group>

        <group position={[4.5, 0, -2]} rotation={[0, -Math.PI/2, 0]}>
            <Text fontSize={0.5} color="#38bdf8" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
                CLEAN PERMEATE
            </Text>
            <Text fontSize={0.3} position={[0, -0.4, 0]} color="#94a3b8" anchorX="center" anchorY="middle">
                (To Sewer/River)
            </Text>
        </group>

        <group position={[0, -3.5, -13]}>
            <Text fontSize={0.5} color="#f59e0b" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
                CONCENTRATED SLUDGE
            </Text>
            <Text fontSize={0.3} position={[0, -0.4, 0]} color="#94a3b8" anchorX="center" anchorY="middle">
                (To Collection Tank)
            </Text>
             <mesh position={[0, 1.5, 0]} rotation={[Math.PI, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 1.5]} />
                <meshBasicMaterial color="#f59e0b" />
                <mesh position={[0, 0.8, 0]} rotation={[0, 0, 0]}>
                   <coneGeometry args={[0.15, 0.4, 8]} />
                   <meshBasicMaterial color="#f59e0b" />
                </mesh>
            </mesh>
        </group>
    </group>
  )
}

// --- Physics & Particle System ---

const COUNT_WATER = 500;
const COUNT_PLASTIC = 100;
const COUNT_ALGAE = 100;
const COUNT_SEDIMENT = 100;

const AdvancedParticleSystem = ({ flowRate, density, isRunning, viewMode }: { flowRate: number, density: number, isRunning: boolean, viewMode: ViewMode }) => {
  const waterMesh = useRef<THREE.InstancedMesh>(null);
  const plasticMesh = useRef<THREE.InstancedMesh>(null);
  const algaeMesh = useRef<THREE.InstancedMesh>(null);
  const sedimentMesh = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Simulation bounds
  const START_Z = 10;
  const END_Z = -15;
  const CONE_SLOPE = 0.15;
  const INITIAL_RADIUS = 2.5;

  const particles = useMemo(() => {
    const items = [];
    const total = COUNT_WATER + COUNT_PLASTIC + COUNT_ALGAE + COUNT_SEDIMENT;
    
    for (let i = 0; i < total; i++) {
        let type = ParticleType.WATER;
        if (i >= COUNT_WATER && i < COUNT_WATER + COUNT_PLASTIC) type = ParticleType.MICROPLASTIC;
        else if (i >= COUNT_WATER + COUNT_PLASTIC && i < COUNT_WATER + COUNT_PLASTIC + COUNT_ALGAE) type = ParticleType.ALGAE;
        else if (i >= COUNT_WATER + COUNT_PLASTIC + COUNT_ALGAE) type = ParticleType.SEDIMENT;

        const radius = Math.random() * INITIAL_RADIUS;
        const angle = Math.random() * Math.PI * 2;
        
        items.push({
            position: new THREE.Vector3(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                START_Z + Math.random() * 20
            ),
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.1, 
                (Math.random() - 0.5) * 0.1, 
                -(0.5 + Math.random() * 0.5)
            ),
            type,
            rotation: new THREE.Euler(Math.random(), Math.random(), Math.random()),
            rotationSpeed: Math.random() * 0.1,
            filtered: false
        });
    }
    return items;
  }, []);

  useFrame((state, delta) => {
    if (!isRunning) return;
    if (!waterMesh.current || !plasticMesh.current || !algaeMesh.current || !sedimentMesh.current) return;

    let waterIdx = 0;
    let plasticIdx = 0;
    let algaeIdx = 0;
    let sedimentIdx = 0;

    particles.forEach((p) => {
        // 1. Move Forward
        const speedMultiplier = flowRate * 10 * delta;
        p.position.addScaledVector(p.velocity, speedMultiplier);

        // 2. Rotate
        if (p.type !== ParticleType.WATER) {
            p.rotation.x += p.rotationSpeed;
            p.rotation.y += p.rotationSpeed;
        }

        // 3. Filter Interaction
        const depth = START_Z - p.position.z;
        const currentConeRadius = Math.max(0.5, INITIAL_RADIUS - (depth * CONE_SLOPE));
        const distFromCenter = Math.sqrt(p.position.x**2 + p.position.y**2);

        if (p.position.z < 5 && p.position.z > -10) {
            if (p.type !== ParticleType.WATER) {
                // SOLIDS (Plastic, Algae, Sediment) Ricochet
                if (distFromCenter >= currentConeRadius - 0.2) {
                    const angle = Math.atan2(p.position.y, p.position.x);
                    p.position.x = Math.cos(angle) * (currentConeRadius - 0.3);
                    p.position.y = Math.sin(angle) * (currentConeRadius - 0.3);
                    p.velocity.x += -Math.cos(angle) * 0.5;
                    p.velocity.y += -Math.sin(angle) * 0.5;
                    p.velocity.z *= 1.1; // Accelerate down the chute
                }
                // Hydrodynamic focusing
                p.position.x = THREE.MathUtils.lerp(p.position.x, 0, 0.01);
                p.position.y = THREE.MathUtils.lerp(p.position.y, 0, 0.01);

            } else {
                // Water Permeation
                if (distFromCenter > currentConeRadius * 0.8 && !p.filtered) {
                    const angle = Math.atan2(p.position.y, p.position.x);
                    p.velocity.x += Math.cos(angle) * 0.05;
                    p.velocity.y += Math.sin(angle) * 0.05;
                    p.velocity.z *= 0.9;
                    if (distFromCenter > currentConeRadius) p.filtered = true;
                }
            }
        }

        // 4. Reset
        if (p.position.z < END_Z || Math.abs(p.position.x) > 5) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * INITIAL_RADIUS;
            p.position.set(
                Math.cos(angle) * r,
                Math.sin(angle) * r,
                START_Z + Math.random() * 5
            );
            p.velocity.set(
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.1,
                -(0.5 + Math.random() * 0.5)
            );
            p.filtered = false;
        }

        dummy.position.copy(p.position);
        dummy.rotation.copy(p.rotation);
        
        // Scale/Visibility logic
        let s = 0.08;
        if (p.type === ParticleType.MICROPLASTIC) s = 0.15;
        if (p.type === ParticleType.ALGAE) s = 0.12;
        if (p.type === ParticleType.SEDIMENT) s = 0.1;
        
        if (p.type === ParticleType.WATER && p.filtered) s *= 0.1;
        dummy.scale.set(s, s, s);

        dummy.updateMatrix();

        if (p.type === ParticleType.WATER) waterMesh.current.setMatrixAt(waterIdx++, dummy.matrix);
        else if (p.type === ParticleType.MICROPLASTIC) plasticMesh.current.setMatrixAt(plasticIdx++, dummy.matrix);
        else if (p.type === ParticleType.ALGAE) algaeMesh.current.setMatrixAt(algaeIdx++, dummy.matrix);
        else if (p.type === ParticleType.SEDIMENT) sedimentMesh.current.setMatrixAt(sedimentIdx++, dummy.matrix);
    });

    waterMesh.current.instanceMatrix.needsUpdate = true;
    plasticMesh.current.instanceMatrix.needsUpdate = true;
    algaeMesh.current.instanceMatrix.needsUpdate = true;
    sedimentMesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
        <instancedMesh ref={waterMesh} args={[undefined, undefined, COUNT_WATER]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial 
                color={viewMode === 'PRODUCT' ? "#38bdf8" : "#60a5fa"} 
                transparent 
                opacity={0.4} 
                blending={THREE.AdditiveBlending}
                depthWrite={false} 
            />
        </instancedMesh>

        <instancedMesh ref={plasticMesh} args={[undefined, undefined, COUNT_PLASTIC]}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial 
                color="#ef4444" 
                roughness={0.2} 
                metalness={0.5}
                emissive="#991b1b"
                emissiveIntensity={0.5}
            />
        </instancedMesh>

        {/* ALGAE - Organic Green Shapes */}
        <instancedMesh ref={algaeMesh} args={[undefined, undefined, COUNT_ALGAE]}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial 
                color="#22c55e" // Green-500
                roughness={0.8} 
                metalness={0.1}
            />
        </instancedMesh>

        {/* SEDIMENT - Heavy Brown Blocks */}
        <instancedMesh ref={sedimentMesh} args={[undefined, undefined, COUNT_SEDIMENT]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial 
                color="#a16207" // Yellow-800 (Brown)
                roughness={0.9} 
                metalness={0.2}
            />
        </instancedMesh>
    </group>
  );
};


const BioFilter3D: React.FC<BioFilter3DProps> = ({ simulationState, viewMode }) => {
  return (
    <div className="absolute inset-0 w-full h-full bg-slate-950">
        <BioFilterCanvas simulationState={simulationState} viewMode={viewMode} />
    </div>
  );
};

export const BioFilterCanvas = ({ simulationState, viewMode }: { simulationState: SimulationState, viewMode: ViewMode }) => {
    const arches = useMemo(() => {
        return Array.from({ length: 15 }).map((_, i) => (
            <GillArch key={i} index={i} total={15} z={2 - (i * 1.2)} viewMode={viewMode} />
        ));
    }, [viewMode]);

    return (
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
            <PerspectiveCamera makeDefault position={[8, 5, 12]} fov={45} />
            <OrbitControls 
                enablePan={false} 
                maxPolarAngle={Math.PI / 1.5} 
                minDistance={5} 
                maxDistance={30} 
                autoRotate={simulationState.isRunning}
                autoRotateSpeed={0.5}
            />

            <color attach="background" args={[viewMode === 'PRODUCT' ? '#0f172a' : '#020617']} />
            
            <ambientLight intensity={viewMode === 'PRODUCT' ? 0.8 : 0.2} color={viewMode === 'PRODUCT' ? "#ffffff" : "#0f172a"} />
            
            <spotLight 
                position={[10, 15, 10]} 
                angle={0.3} 
                penumbra={0.5} 
                intensity={viewMode === 'PRODUCT' ? 10 : 20} 
                castShadow 
                color={viewMode === 'PRODUCT' ? "#ffffff" : "#38bdf8"} 
            />
            
            {viewMode === 'NATURE' && <pointLight position={[-10, 0, -5]} intensity={5} color="#c026d3" />}
            {viewMode === 'PRODUCT' && <pointLight position={[-5, 5, 0]} intensity={2} color="#ffffff" />}

            {viewMode === 'NATURE' && (
                <>
                    <Stars radius={50} depth={20} count={2000} factor={4} saturation={0} fade speed={0.5} />
                    <Sparkles count={100} scale={12} size={2} speed={0.4} opacity={0.2} color="#ffffff" />
                </>
            )}

            <Float speed={viewMode === 'PRODUCT' ? 0 : 2} rotationIntensity={viewMode === 'PRODUCT' ? 0 : 0.1} floatIntensity={0.2}>
                <group rotation={[0, 0, 0]}>
                    <group rotation={[0, 0, viewMode === 'PRODUCT' ? 0 : Math.PI / 12]}> 
                        {arches}
                    </group>

                    {viewMode === 'PRODUCT' && <ProductHousing />}

                    <AdvancedParticleSystem 
                        flowRate={simulationState.flowRate} 
                        density={simulationState.particleDensity}
                        isRunning={simulationState.isRunning}
                        viewMode={viewMode}
                    />

                    {/* Ghostly Shell for Nature Mode */}
                    {viewMode === 'NATURE' && (
                        <mesh position={[0, 0, -5]} rotation={[Math.PI/2, 0, 0]}>
                            <cylinderGeometry args={[1, 3, 18, 32, 1, true]} />
                            <meshPhongMaterial 
                                color="#1e293b" 
                                transparent 
                                opacity={0.1} 
                                side={THREE.DoubleSide}
                                wireframe
                            />
                        </mesh>
                    )}
                </group>
            </Float>

            <Environment preset={viewMode === 'PRODUCT' ? "studio" : "city"} />
        </Canvas>
    )
}

export default BioFilter3D;