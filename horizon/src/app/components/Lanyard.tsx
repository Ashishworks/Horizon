'use client';
import { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import {
  useGLTF,
  useTexture,
  Environment,
  Lightformer,
  Text,
  RenderTexture,
} from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  RigidBodyProps,
  RapierRigidBody 
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';

/* --- THE FIX START --- */
class MeshLineGeometryClass extends MeshLineGeometry { }
class MeshLineMaterialClass extends MeshLineMaterial { }

extend({
  MeshLineGeometry: MeshLineGeometryClass,
  MeshLineMaterial: MeshLineMaterialClass
});
/* --- THE FIX END --- */

// Assets pointing to public folder
const cardGLB = '/lanyard/card.glb';
const lanyardTexture = '/lanyard/lanyard.png';

interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
}

// 1. Define the specific shape of your GLTF model
type GLTFResult = GLTF & {
  nodes: {
    card: THREE.Mesh;
    clip: THREE.Mesh;
    clamp: THREE.Mesh;
  };
  materials: {
    metal: THREE.MeshStandardMaterial;
  };
};

// 2. Define a custom RigidBody type that includes the 'lerped' property used in your animation loop
interface ExtendedRigidBody extends RapierRigidBody {
  lerped?: THREE.Vector3;
}

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true
}: LanyardProps) {
  return (
    <div className="relative z-0 w-full h-screen flex justify-center items-center transform scale-100 origin-center">
      <Canvas
        camera={{ position, fov }}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={1 / 60}>
          <Band />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}

function Band({ maxSpeed = 50, minSpeed = 0 }) {
  const band = useRef<THREE.Mesh<MeshLineGeometryClass, MeshLineMaterialClass>>(null);
  
  const fixed = useRef<ExtendedRigidBody>(null);
  const j1 = useRef<ExtendedRigidBody>(null);
  const j2 = useRef<ExtendedRigidBody>(null);
  const j3 = useRef<ExtendedRigidBody>(null);
  const card = useRef<ExtendedRigidBody>(null);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();
  
  const segmentProps: RigidBodyProps = { 
    type: 'dynamic', 
    canSleep: true, 
    colliders: false, 
    angularDamping: 4, 
    linearDamping: 4 
  };

  const { nodes, materials } = useGLTF(cardGLB) as unknown as GLTFResult;
  const texture = useTexture(lanyardTexture);
  const [curve] = useState(() => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]));
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);
  const [isSmall, setIsSmall] = useState<boolean>(false);

  useEffect(() => {
    setIsSmall(window.innerWidth < 1024);
    const handleResize = () => setIsSmall(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useRopeJoint(
    fixed as React.RefObject<RapierRigidBody>, 
    j1 as React.RefObject<RapierRigidBody>, 
    [[0, 0, 0], [0, 0, 0], 1]
  );
  useRopeJoint(
    j1 as React.RefObject<RapierRigidBody>, 
    j2 as React.RefObject<RapierRigidBody>, 
    [[0, 0, 0], [0, 0, 0], 1]
  );
  useRopeJoint(
    j2 as React.RefObject<RapierRigidBody>, 
    j3 as React.RefObject<RapierRigidBody>, 
    [[0, 0, 0], [0, 0, 0], 1]
  );
  useSphericalJoint(
    j3 as React.RefObject<RapierRigidBody>, 
    card as React.RefObject<RapierRigidBody>, 
    [[0, 0, 0], [0, 1.45, 0]]
  );

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => { document.body.style.cursor = 'auto'; };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged && typeof dragged !== 'boolean') {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      
      card.current?.setNextKinematicTranslation({ 
        x: vec.x - dragged.x, 
        y: vec.y - dragged.y, 
        z: vec.z - dragged.z 
      });
    }

    if (fixed.current) {
      [j1, j2].forEach((ref) => {
        if (!ref.current) return;
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
      });

      if (j3.current && j2.current?.lerped && j1.current?.lerped) {
        curve.points[0].copy(j3.current.translation());
        curve.points[1].copy(j2.current.lerped);
        curve.points[2].copy(j1.current.lerped);
        curve.points[3].copy(fixed.current.translation());
        
        if (band.current) {
          band.current.geometry.setPoints(curve.getPoints(32));
        }
      }

      if (card.current) {
        ang.copy(card.current.angvel());
        rot.copy(card.current.rotation());
        
        // --- THE FIX IS HERE: Added 'true' as the second argument ---
        card.current.setAngvel(
          { x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, 
          true
        );
      }
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => {
              (e.target as Element).releasePointerCapture(e.pointerId);
              drag(false);
            }}
            onPointerDown={(e) => {
              (e.target as Element).setPointerCapture(e.pointerId);
              if (card.current) {
                drag(
                  new THREE.Vector3()
                    .copy(e.point)
                    .sub(vec.copy(card.current.translation()))
                );
              }
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial clearcoat={1} clearcoatRoughness={0.15} roughness={0.3} metalness={0.5}>
                <RenderTexture attach="map" anisotropy={16}>
                  <group scale={[1, -1, 1]}>
                    <color attach="background" args={['#2a2a2a']} />
                    <group rotation={[0, 0, 0]} position={[0, -0.3, 0]}>
                      <Text fontSize={0.1} color="white" position={[-0.70, 2, 0]} anchorX="center" anchorY="middle">
                        DEVELOPER&apos;S NOTE
                      </Text>
                      <Text fontSize={0.1} color="#cccccc" position={[-0.70, 1, 0]} anchorX="center" anchorY="middle">
                        Use id: demo@gmail.com
                      </Text>
                      <Text fontSize={0.1} color="#cccccc" position={[-0.70, 0.8, 0]} anchorX="center" anchorY="middle">
                        Pass: easypass
                      </Text>
                      <Text fontSize={0.08} color="#888888" position={[-0.70, 0.3, 0]} anchorX="center" anchorY="middle">
                        (for exploring the website)
                      </Text>
                    </group>
                  </group>
                </RenderTexture>
              </meshPhysicalMaterial>
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial color="white" depthTest={false} resolution={isSmall ? [1000, 2000] : [1000, 1000]} useMap map={texture} repeat={[-4, 1]} lineWidth={1} />
      </mesh>
    </>
  );
}