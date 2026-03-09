import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import { useCourtroomContext } from "@/context/CourtroomContext";
import { ROLE_COLORS, type Participant } from "@/types/courtroom";
import { useTheme } from "@/components/theme-provider";
import * as THREE from "three";

// Simple avatar - a cylinder body + sphere head
const Avatar3D = ({
  participant,
  position,
}: {
  participant: Participant;
  position: [number, number, number];
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const roleColor = ROLE_COLORS[participant.role];

  useFrame((_, delta) => {
    if (glowRef.current && participant.isSpeaking) {
      glowRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.1);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Speaking glow ring */}
      {participant.isSpeaking && (
        <mesh
          ref={glowRef}
          position={[0, 0.05, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.5, 0.65, 32]} />
          <meshBasicMaterial color={roleColor} transparent opacity={0.4} />
        </mesh>
      )}
      {/* Body */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.8, 8]} />
        <meshStandardMaterial color={participant.avatarColor} roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={participant.avatarColor} roughness={0.5} />
      </mesh>
      {/* Name label */}
      <Text
        position={[0, 1.6, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        anchorY="bottom"
        font={undefined}
      >
        {participant.name.split(" ").pop()}
      </Text>
      {/* Role badge */}
      <Text
        position={[0, 1.45, 0]}
        fontSize={0.08}
        color={roleColor}
        anchorX="center"
        anchorY="bottom"
        font={undefined}
      >
        {participant.role.toUpperCase()}
      </Text>
    </group>
  );
};

// Courtroom furniture
const JudgeBench = ({ theme }: { theme: string }) => {
  const baseColor = theme === "light" ? "#f1f5f9" : "#2a2d3a";
  const deskColor = theme === "light" ? "#e2e8f0" : "#363a4a";

  return (
    <group position={[0, 0, -4]}>
      {/* Elevated platform */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[3, 0.8, 1.5]} />
        <meshStandardMaterial color={baseColor} roughness={0.3} />
      </mesh>
      {/* Desk surface */}
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[3.2, 0.08, 1.6]} />
        <meshStandardMaterial color={deskColor} roughness={0.4} />
      </mesh>
      {/* Gold trim */}
      <mesh position={[0, 0.82, 0.82]}>
        <boxGeometry args={[3.2, 0.04, 0.04]} />
        <meshStandardMaterial color="#d4a542" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};

const LawyerTable = ({
  side,
  theme,
}: {
  side: "left" | "right";
  theme: string;
}) => {
  const x = side === "left" ? -2.5 : 2.5;
  const baseColor = theme === "light" ? "#cbd5e1" : "#252838";
  const topColor = theme === "light" ? "#94a3b8" : "#2e3348";

  return (
    <group position={[x, 0, -1]}>
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[2, 0.7, 1]} />
        <meshStandardMaterial color={baseColor} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[2.1, 0.06, 1.1]} />
        <meshStandardMaterial color={topColor} roughness={0.4} />
      </mesh>
    </group>
  );
};

const WitnessStand = ({ theme }: { theme: string }) => {
  const baseColor = theme === "light" ? "#f1f5f9" : "#2a2d3a";
  const topColor = theme === "light" ? "#e2e8f0" : "#363a4a";

  return (
    <group position={[3.5, 0, -3]}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.2, 0.6, 1.2]} />
        <meshStandardMaterial color={baseColor} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[1.3, 0.06, 1.3]} />
        <meshStandardMaterial color={topColor} roughness={0.4} />
      </mesh>
    </group>
  );
};

const EvidenceScreen = ({ theme }: { theme: string }) => {
  const frameColor = theme === "light" ? "#e2e8f0" : "#1e2030";
  const screenColor = theme === "light" ? "#ffffff" : "#1a1d2e";
  const emissiveColor = theme === "light" ? "#f8fafc" : "#252a40";

  return (
    <group position={[0, 2.5, -5.5]}>
      {/* Frame */}
      <mesh>
        <boxGeometry args={[4, 2.5, 0.1]} />
        <meshStandardMaterial color={frameColor} roughness={0.2} />
      </mesh>
      {/* Screen surface */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[3.6, 2.1]} />
        <meshStandardMaterial
          color={screenColor}
          emissive={emissiveColor}
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* "EXHIBIT A" text */}
      <Text
        position={[0, 0.3, 0.08]}
        fontSize={0.25}
        color="#d4a542"
        anchorX="center"
        font={undefined}
      >
        EXHIBIT A
      </Text>
      <Text
        position={[0, -0.2, 0.08]}
        fontSize={0.12}
        color={theme === "light" ? "#475569" : "#8899aa"}
        anchorX="center"
        font={undefined}
      >
        Contract_Agreement_2025.pdf
      </Text>
    </group>
  );
};

const Gallery = ({ theme }: { theme: string }) => {
  const benchColor = theme === "light" ? "#cbd5e1" : "#222536";
  return (
    <group position={[0, 0, 3]}>
      {[0, 1, 2].map((row) => (
        <mesh key={row} position={[0, 0.15 + row * 0.35, row * 1.2]}>
          <boxGeometry args={[6, 0.3, 0.6]} />
          <meshStandardMaterial color={benchColor} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
};

const Floor = ({ theme }: { theme: string }) => {
  const floorColor = theme === "light" ? "#e2e8f0" : "#1c1f2e";
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.01, 0]}
      receiveShadow
    >
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color={floorColor} roughness={0.8} />
    </mesh>
  );
};

const Walls = ({ theme }: { theme: string }) => {
  const backWallColor = theme === "light" ? "#f8fafc" : "#222536";
  const sideWallColor = theme === "light" ? "#f1f5f9" : "#1e2132";

  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 3, -6]}>
        <planeGeometry args={[20, 6]} />
        <meshStandardMaterial color={backWallColor} roughness={0.7} />
      </mesh>
      {/* Side walls */}
      <mesh position={[-8, 3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial color={sideWallColor} roughness={0.7} />
      </mesh>
      <mesh position={[8, 3, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial color={sideWallColor} roughness={0.7} />
      </mesh>
    </group>
  );
};

const BrandText = () => (
  <Text
    position={[0, 4.5, -5.9]}
    fontSize={0.4}
    color="#d4a542"
    anchorX="center"
    font={undefined}
    letterSpacing={0.15}
  >
    LAWBLOCKS
  </Text>
);

const CourtroomScene = () => {
  const { participants } = useCourtroomContext();

  const { theme } = useTheme();
  const currentTheme = (() => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme;
  })();

  // Position avatars by role
  const avatarPositions = useMemo(() => {
    const positions: {
      participant: Participant;
      pos: [number, number, number];
    }[] = [];
    const judge = participants.find((p) => p.role === "judge");
    if (judge) positions.push({ participant: judge, pos: [0, 0.8, -3.5] });

    const prosLawyers = participants.filter(
      (p) => p.role === "lawyer" && p.side === "prosecution",
    );
    const defLawyers = participants.filter(
      (p) => p.role === "lawyer" && p.side === "defense",
    );
    prosLawyers.forEach((p, i) =>
      positions.push({ participant: p, pos: [-2.5 + i * 0.8, 0, -0.3] }),
    );
    defLawyers.forEach((p, i) =>
      positions.push({ participant: p, pos: [2.5 - i * 0.8, 0, -0.3] }),
    );

    const prosLitigants = participants.filter(
      (p) => p.role === "litigant" && p.side === "prosecution",
    );
    const defLitigants = participants.filter(
      (p) => p.role === "litigant" && p.side === "defense",
    );
    prosLitigants.forEach((p, i) =>
      positions.push({ participant: p, pos: [-3.5 - i * 0.8, 0, -0.3] }),
    );
    defLitigants.forEach((p, i) =>
      positions.push({ participant: p, pos: [3.5 + i * 0.8, 0, -0.3] }),
    );

    const observers = participants.filter((p) => p.role === "observer");
    observers.forEach((p, i) =>
      positions.push({ participant: p, pos: [-1.5 + i * 1.5, 0, 3.5] }),
    );

    return positions;
  }, [participants]);

  return (
    <div className="absolute inset-0" style={{ top: "56px", bottom: "80px" }}>
      <Canvas
        camera={{ position: [0, 5, 8], fov: 50 }}
        shadows
        gl={{ antialias: true }}
      >
        <ambientLight intensity={currentTheme === "light" ? 0.6 : 0.3} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={currentTheme === "light" ? 1.0 : 0.6}
          castShadow
        />
        <pointLight
          position={[0, 4, -4]}
          intensity={currentTheme === "light" ? 0.2 : 0.4}
          color="#d4a542"
        />
        <pointLight
          position={[-3, 3, 0]}
          intensity={currentTheme === "light" ? 0.1 : 0.2}
          color="#4a7fd4"
        />
        <pointLight
          position={[3, 3, 0]}
          intensity={currentTheme === "light" ? 0.1 : 0.2}
          color="#4a7fd4"
        />

        <Floor theme={currentTheme} />
        <Walls theme={currentTheme} />
        <JudgeBench theme={currentTheme} />
        <LawyerTable side="left" theme={currentTheme} />
        <LawyerTable side="right" theme={currentTheme} />
        <WitnessStand theme={currentTheme} />
        <EvidenceScreen theme={currentTheme} />
        <Gallery theme={currentTheme} />
        <BrandText />

        {avatarPositions.map(({ participant, pos }) => (
          <Avatar3D
            key={participant.id}
            participant={participant}
            position={pos}
          />
        ))}

        <ContactShadows
          position={[0, 0, 0]}
          opacity={currentTheme === "light" ? 0.15 : 0.4}
          scale={15}
          blur={2}
        />
        <OrbitControls
          makeDefault
          maxPolarAngle={Math.PI / 2.2}
          minDistance={4}
          maxDistance={15}
          target={[0, 1.5, -1]}
        />
        {currentTheme !== "light" && (
          <fog attach="fog" args={["#1c1f2e", 12, 28]} />
        )}
      </Canvas>
    </div>
  );
};

export default CourtroomScene;
