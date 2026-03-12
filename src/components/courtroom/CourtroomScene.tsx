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
  rotation = [0, 0, 0],
}: {
  participant: Participant;
  position: [number, number, number];
  rotation?: [number, number, number];
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const roleColor = ROLE_COLORS[participant.role];
  const isLawyer = participant.role === "lawyer";

  useFrame((_, delta) => {
    if (glowRef.current && participant.isSpeaking) {
      glowRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.1);
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation as any}>
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
        <meshStandardMaterial color={isLawyer ? "#1a1c23" : participant.avatarColor} roughness={0.6} />
      </mesh>
      {/* Suit detailing for lawyers */}
      {isLawyer && (
        <group position={[0, 0.5, 0.2]}>
          {/* White shirt triangle */}
          <mesh position={[0, 0.2, 0.03]} rotation={[0, 0, Math.PI]}>
            <cylinderGeometry args={[0, 0.1, 0.3, 3]} />
            <meshStandardMaterial color="#ffffff" roughness={0.9} />
          </mesh>
          {/* Tie */}
          <mesh position={[0, 0.1, 0.04]}>
            <boxGeometry args={[0.03, 0.2, 0.01]} />
            <meshStandardMaterial color="#8b0000" roughness={0.5} />
          </mesh>
        </group>
      )}
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
  const woodColor = theme === "light" ? "#5c3d2e" : "#6b3510";
  const woodDark = theme === "light" ? "#3e2a1e" : "#4a2208";
  const feltColor = theme === "light" ? "#2c3e6b" : "#1a2d4a";
  const brassColor = "#d4a030";
  const marbleColor = theme === "light" ? "#dce0e6" : "#8a7d6a";
  const marbleColor2 = theme === "light" ? "#cdd1d8" : "#7d7060";

  return (
    <group position={[0, 0, -4]}>
      {/* STEP 1 - bottom wide base */}
      <mesh position={[0, 0.15, 0.2]}>
        <boxGeometry args={[5.0, 0.3, 3.2]} />
        <meshStandardMaterial color={marbleColor} roughness={0.2} metalness={0.05} />
      </mesh>
      {/* STEP 2 - upper narrower platform */}
      <mesh position={[0, 0.45, 0.1]}>
        <boxGeometry args={[4.6, 0.3, 2.8]} />
        <meshStandardMaterial color={marbleColor2} roughness={0.2} metalness={0.05} />
      </mesh>

      {/* C-SHAPE BENCH opening toward BACK WALL (wings extend toward audience) */}
      {/* Left wing - extends toward front/audience */}
      <mesh position={[-1.6, 1.15, 0.3]}>
        <boxGeometry args={[1.0, 0.9, 1.8]} />
        <meshStandardMaterial color={woodColor} roughness={0.5} />
      </mesh>
      {/* Left wing felt top */}
      <mesh position={[-1.6, 1.61, 0.3]}>
        <boxGeometry args={[1.05, 0.02, 1.85]} />
        <meshStandardMaterial color={feltColor} roughness={0.9} />
      </mesh>

      {/* Right wing - extends toward front/audience */}
      <mesh position={[1.6, 1.15, 0.3]}>
        <boxGeometry args={[1.0, 0.9, 1.8]} />
        <meshStandardMaterial color={woodColor} roughness={0.5} />
      </mesh>
      {/* Right wing felt top */}
      <mesh position={[1.6, 1.61, 0.3]}>
        <boxGeometry args={[1.05, 0.02, 1.85]} />
        <meshStandardMaterial color={feltColor} roughness={0.9} />
      </mesh>

      {/* Front connector (faces audience, closes the C toward audience side) */}
      <mesh position={[0, 1.05, 1.1]}>
        <boxGeometry args={[4.2, 0.7, 0.5]} />
        <meshStandardMaterial color={woodColor} roughness={0.5} />
      </mesh>
      {/* Front connector felt top */}
      <mesh position={[0, 1.41, 1.1]}>
        <boxGeometry args={[4.25, 0.02, 0.55]} />
        <meshStandardMaterial color={feltColor} roughness={0.9} />
      </mesh>

      {/* Front panel detail on left wing (audience-facing) */}
      <mesh position={[-1.6, 1.05, 1.21]}>
        <boxGeometry args={[0.95, 0.5, 0.04]} />
        <meshStandardMaterial color={woodDark} roughness={0.6} />
      </mesh>
      {/* Front panel detail on right wing (audience-facing) */}
      <mesh position={[1.6, 1.05, 1.21]}>
        <boxGeometry args={[0.95, 0.5, 0.04]} />
        <meshStandardMaterial color={woodDark} roughness={0.6} />
      </mesh>
      {/* Front panel on connector */}
      <mesh position={[0, 0.95, 1.36]}>
        <boxGeometry args={[2.1, 0.4, 0.04]} />
        <meshStandardMaterial color={woodDark} roughness={0.6} />
      </mesh>

      {/* Brass trim - front connector */}
      <mesh position={[0, 1.4, 1.36]}>
        <boxGeometry args={[4.25, 0.05, 0.03]} />
        <meshStandardMaterial color={brassColor} metalness={0.85} roughness={0.15} />
      </mesh>
      {/* Brass trim - left wing front edge */}
      <mesh position={[-1.6, 1.6, 1.21]}>
        <boxGeometry args={[1.05, 0.05, 0.03]} />
        <meshStandardMaterial color={brassColor} metalness={0.85} roughness={0.15} />
      </mesh>
      {/* Brass trim - right wing front edge */}
      <mesh position={[1.6, 1.6, 1.21]}>
        <boxGeometry args={[1.05, 0.05, 0.03]} />
        <meshStandardMaterial color={brassColor} metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Brass corner posts */}
      {[[-2.1, 1.21], [2.1, 1.21], [-2.1, -0.6], [2.1, -0.6]].map(([x, z], i) => (
        <mesh key={i} position={[x, 1.3, z]}>
          <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
          <meshStandardMaterial color={brassColor} metalness={0.85} roughness={0.15} />
        </mesh>
      ))}

      {/* Gavel block on right wing */}
      <mesh position={[1.6, 1.64, 0.3]}>
        <boxGeometry args={[0.2, 0.05, 0.15]} />
        <meshStandardMaterial color={woodDark} roughness={0.4} />
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
  const feltColor = theme === "light" ? "#4a3728" : "#6b4c10";
  const woodColor = theme === "light" ? "#a07840" : "#5c2a0e";
  const woodDark = theme === "light" ? "#7a5c30" : "#3d1c06";
  const brassColor = "#b8860b";

  return (
    <group position={[x, 0, 0]}>
      {/* Table legs */}
      {[[-0.85, -0.45], [-0.85, 0.45], [0.85, -0.45], [0.85, 0.45]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.2, lz]}>
          <boxGeometry args={[0.06, 0.7, 0.06]} />
          <meshStandardMaterial color={woodDark} roughness={0.5} />
        </mesh>
      ))}
      {/* Apron rail front */}
      <mesh position={[0, 0.52, 0.48]}>
        <boxGeometry args={[1.7, 0.08, 0.04]} />
        <meshStandardMaterial color={woodColor} roughness={0.5} />
      </mesh>
      {/* Tabletop - mahogany */}
      <mesh position={[0, 0.57, 0]}>
        <boxGeometry args={[1.9, 0.06, 0.98]} />
        <meshStandardMaterial color={woodColor} roughness={0.4} />
      </mesh>
      {/* Felt surface on table */}
      <mesh position={[0, 0.605, 0]}>
        <boxGeometry args={[1.75, 0.01, 0.82]} />
        <meshStandardMaterial color={feltColor} roughness={0.9} />
      </mesh>
      {/* Brass edge trim */}
      <mesh position={[0, 0.58, 0.5]}>
        <boxGeometry args={[1.9, 0.03, 0.03]} />
        <meshStandardMaterial color={brassColor} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Small nameplate */}
      <mesh position={[0, 0.62, 0.42]}>
        <boxGeometry args={[0.5, 0.04, 0.12]} />
        <meshStandardMaterial color={brassColor} metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
};

const WitnessStand = ({ theme }: { theme: string }) => {
  const woodColor = theme === "light" ? "#8b6914" : "#5c2a0e";
  const woodDark = theme === "light" ? "#6b4c10" : "#3d1c06";
  const feltColor = theme === "light" ? "#2a6b4a" : "#1a4731";
  const brassColor = "#b8860b";

  return (
    <group position={[3.5, 0, -3]}>
      {/* Base platform */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[1.4, 0.3, 1.4]} />
        <meshStandardMaterial color={woodDark} roughness={0.5} />
      </mesh>
      {/* Main body */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.2, 0.5, 1.2]} />
        <meshStandardMaterial color={woodColor} roughness={0.5} />
      </mesh>
      {/* Top surface - green felt */}
      <mesh position={[0, 0.78, 0]}>
        <boxGeometry args={[1.25, 0.06, 1.25]} />
        <meshStandardMaterial color={woodColor} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <boxGeometry args={[1.1, 0.01, 1.1]} />
        <meshStandardMaterial color={feltColor} roughness={0.9} />
      </mesh>
      {/* Brass corner accents */}
      {[[-0.55, -0.55], [-0.55, 0.55], [0.55, -0.55], [0.55, 0.55]].map(([cx, cz], i) => (
        <mesh key={i} position={[cx, 0.82, cz]}>
          <cylinderGeometry args={[0.04, 0.04, 0.12, 6]} />
          <meshStandardMaterial color={brassColor} metalness={0.85} roughness={0.15} />
        </mesh>
      ))}
      {/* "WITNESS" label text would go here */}
    </group>
  );
};

const EvidenceScreen = ({ theme }: { theme: string }) => {
  const frameColor = "#1a1a2a";
  const screenColor = theme === "light" ? "#ffffff" : "#282c3c";
  const emissiveColor = theme === "light" ? "#f8fafc" : "#353a50";
  const brassColor = "#b8860b";

  return (
    <group position={[0, 2.5, -5.5]}>
      {/* Outer brass border */}
      <mesh>
        <boxGeometry args={[4.3, 2.8, 0.08]} />
        <meshStandardMaterial color={brassColor} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Inner dark frame */}
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[4, 2.5, 0.06]} />
        <meshStandardMaterial color={frameColor} roughness={0.2} />
      </mesh>
      {/* Screen surface */}
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[3.6, 2.1]} />
        <meshStandardMaterial
          color={screenColor}
          emissive={emissiveColor}
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* "EXHIBIT A" text */}
      <Text
        position={[0, 0.3, 0.12]}
        fontSize={0.25}
        color="#d4a542"
        anchorX="center"
        font={undefined}
      >
        EXHIBIT A
      </Text>
      <Text
        position={[0, -0.2, 0.12]}
        fontSize={0.12}
        color={theme === "light" ? "#475569" : "#8899aa"}
        anchorX="center"
        font={undefined}
      >
        Contract_Agreement_2025.pdf
      </Text>
      {/* Screen corner screws */}
      {[[-1.95, 1.3], [1.95, 1.3], [-1.95, -1.3], [1.95, -1.3]].map(([sx, sy], i) => (
        <mesh key={i} position={[sx, sy, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.04, 8]} />
          <meshStandardMaterial color={brassColor} metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
    </group>
  );
};

const Gallery = ({ theme }: { theme: string }) => {
  // Traditional courtroom pew wood
  const pewColor = theme === "light" ? "#8b6914" : "#5c2a0e";
  const pewDark = theme === "light" ? "#6b4c10" : "#3d1c06";
  return (
    <group position={[0, 0, 3]}>
      {[0, 1, 2].map((row) => (
        <group key={row} position={[0, row * 0.35, row * 1.2]}>
          {/* Pew seat */}
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[6.2, 0.08, 0.55]} />
            <meshStandardMaterial color={pewColor} roughness={0.5} />
          </mesh>
          {/* Pew back rest */}
          <mesh position={[0, 0.52, -0.22]}>
            <boxGeometry args={[6.2, 0.45, 0.06]} />
            <meshStandardMaterial color={pewColor} roughness={0.5} />
          </mesh>
          {/* Pew base */}
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[6.2, 0.2, 0.6]} />
            <meshStandardMaterial color={pewDark} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const Floor = ({ theme }: { theme: string }) => {
  // Marble-style floor
  const floorColor = theme === "light" ? "#d8dce4" : "#6e6355";
  const floorColor2 = theme === "light" ? "#c8ccd4" : "#5e5448";
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={floorColor} roughness={0.3} metalness={0.05} />
      </mesh>
      {/* Marble tile grid lines */}
      {[-6, -3, 0, 3, 6].map((x) =>
        [-6, -3, 0, 3, 6].map((z) => (
          <mesh key={`${x}-${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0, z]}>
            <planeGeometry args={[2.98, 2.98]} />
            <meshStandardMaterial color={x % 2 === z % 2 ? floorColor : floorColor2} roughness={0.25} metalness={0.05} />
          </mesh>
        ))
      )}
    </group>
  );
};

const Walls = ({ theme }: { theme: string }) => {
  // Warm court beige/cream walls with wainscoting
  const wallColor = theme === "light" ? "#e4e8ee" : "#4a4235";
  const wainscotColor = theme === "light" ? "#8b6914" : "#6b3510";

  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 3, -6]}>
        <planeGeometry args={[20, 6]} />
        <meshStandardMaterial color={wallColor} roughness={0.7} />
      </mesh>
      {/* Wainscoting panels - back wall */}
      <mesh position={[0, 0.6, -5.95]}>
        <boxGeometry args={[18, 1.2, 0.05]} />
        <meshStandardMaterial color={wainscotColor} roughness={0.5} />
      </mesh>
      {/* Side walls */}
      <mesh position={[-8, 3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial color={wallColor} roughness={0.7} />
      </mesh>
      <mesh position={[8, 3, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial color={wallColor} roughness={0.7} />
      </mesh>
      {/* Wainscoting - side walls */}
      <mesh position={[-7.95, 0.6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[12, 1.2, 0.05]} />
        <meshStandardMaterial color={wainscotColor} roughness={0.5} />
      </mesh>
      <mesh position={[7.95, 0.6, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[12, 1.2, 0.05]} />
        <meshStandardMaterial color={wainscotColor} roughness={0.5} />
      </mesh>
      {/* Crown molding - back wall */}
      <mesh position={[0, 5.9, -5.9]}>
        <boxGeometry args={[18, 0.15, 0.12]} />
        <meshStandardMaterial color="#b8860b" metalness={0.6} roughness={0.3} />
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
      rot: [number, number, number];
    }[] = [];
    
    // Judge on top of two-step platform (0.3+0.3=0.6), inside C-shape opening toward back
    const judge = participants.find((p) => p.role === "judge");
    if (judge) positions.push({ participant: judge, pos: [0, 0.6, -4.2], rot: [0, 0, 0] });

    const prosLawyers = participants.filter(
      (p) => p.role === "lawyer" && p.side === "prosecution",
    );
    const defLawyers = participants.filter(
      (p) => p.role === "lawyer" && p.side === "defense",
    );
    
    // Lawyers look towards judge (rot Y=PI)
    prosLawyers.forEach((p, i) =>
      positions.push({ participant: p, pos: [-2.5 + i * 0.8, 0, -0.3], rot: [0, Math.PI, 0] }),
    );
    defLawyers.forEach((p, i) =>
      positions.push({ participant: p, pos: [2.5 - i * 0.8, 0, -0.3], rot: [0, Math.PI, 0] }),
    );

    const prosLitigants = participants.filter(
      (p) => p.role === "litigant" && p.side === "prosecution",
    );
    const defLitigants = participants.filter(
      (p) => p.role === "litigant" && p.side === "defense",
    );
    
    // Litigants also face judge
    prosLitigants.forEach((p, i) =>
      positions.push({ participant: p, pos: [-3.5 - i * 0.8, 0, -0.3], rot: [0, Math.PI, 0] }),
    );
    defLitigants.forEach((p, i) =>
      positions.push({ participant: p, pos: [3.5 + i * 0.8, 0, -0.3], rot: [0, Math.PI, 0] }),
    );

    const observers = participants.filter((p) => p.role === "observer");
    // Observers face judge
    observers.forEach((p, i) =>
      positions.push({ participant: p, pos: [-1.5 + i * 1.5, 0, 3.5], rot: [0, Math.PI, 0] }),
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

        {avatarPositions.map(({ participant, pos, rot }) => (
          <Avatar3D
            key={participant.id}
            participant={participant}
            position={pos}
            rotation={rot}
          />
        ))}

        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={currentTheme === "light" ? 0.3 : 0.6}
          scale={20}
          blur={1.5}
          far={10}
          resolution={512}
        />
        <OrbitControls
          makeDefault
          maxPolarAngle={Math.PI / 2.2}
          minDistance={4}
          maxDistance={15}
          target={[0, 1.5, -1]}
        />
        {currentTheme !== "light" && (
          <fog attach="fog" args={["#2a2e3e", 14, 30]} />
        )}
      </Canvas>
    </div>
  );
};

export default CourtroomScene;
