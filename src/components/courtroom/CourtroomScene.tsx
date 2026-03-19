import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  Environment,
  ContactShadows,
  Grid,
} from "@react-three/drei";
import { useCourtroomContext } from "@/context/CourtroomContext";
import { ROLE_COLORS, type Participant, ROLE_LABELS } from "@/types/courtroom";
import { useTheme } from "@/components/theme-provider";
import * as THREE from "three";

const VideoScreen = ({
  stream,
  position,
}: {
  stream: MediaStream;
  position: [number, number, number];
}) => {
  const video = useMemo(() => {
    const v = document.createElement("video");
    v.srcObject = stream;
    v.muted = true; // Mute local preview and avoid feedback
    v.play().catch((e) => console.error("Video play failed:", e));
    return v;
  }, [stream]);

  return (
    <mesh position={position}>
      <planeGeometry args={[1.2, 0.675]} />
      <meshBasicMaterial toneMapped={false} side={THREE.DoubleSide}>
        <videoTexture attach="map" args={[video]} />
      </meshBasicMaterial>
      {/* Screen boarder/backing */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.25, 0.725]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>
    </mesh>
  );
};

// Simple avatar - a cylinder body + sphere head
const Avatar3D = ({
  participant,
  position,
  rotation = [0, 0, 0],
  stream,
}: {
  participant: Participant;
  position: [number, number, number];
  rotation?: [number, number, number];
  stream?: MediaStream;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const roleColor = ROLE_COLORS[participant.role];
  const isLawyer = participant.role === "lawyer";

  useFrame((state) => {
    if (glowRef.current && participant.isSpeaking) {
      glowRef.current.scale.setScalar(
        1 + Math.sin(state.clock.elapsedTime * 5) * 0.1,
      );
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation as any}>
      {/* Video Screen above head */}
      {participant.hasCamera && stream && (
        <VideoScreen stream={stream} position={[0, 2.3, 0]} />
      )}
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
  const woodColor = theme === "light" ? "#6b4f3a" : "#6b3510";
  const woodDark = theme === "light" ? "#4d3828" : "#4a2208";
  const feltColor = theme === "light" ? "#4a3728" : "#1a2d4a";
  const brassColor = "#d4a030";
  const marbleColor = theme === "light" ? "#dce0e6" : "#8a7d6a";
  const marbleColor2 = theme === "light" ? "#cdd1d8" : "#7d7060";

  return (
    <group position={[0, 0, -4]}>
      {/* STEP 1 - bottom wide base */}
      <mesh position={[0, 0.15, 0.2]}>
        <boxGeometry args={[5.0, 0.3, 3.2]} />
        <meshStandardMaterial
          color={marbleColor}
          roughness={0.2}
          metalness={0.05}
        />
      </mesh>
      {/* STEP 2 - upper narrower platform */}
      <mesh position={[0, 0.45, 0.1]}>
        <boxGeometry args={[4.6, 0.3, 2.8]} />
        <meshStandardMaterial
          color={marbleColor2}
          roughness={0.2}
          metalness={0.05}
        />
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
        <meshStandardMaterial
          color={brassColor}
          metalness={0.85}
          roughness={0.15}
        />
      </mesh>
      {/* Brass trim - left wing front edge */}
      <mesh position={[-1.6, 1.6, 1.21]}>
        <boxGeometry args={[1.05, 0.05, 0.03]} />
        <meshStandardMaterial
          color={brassColor}
          metalness={0.85}
          roughness={0.15}
        />
      </mesh>
      {/* Brass trim - right wing front edge */}
      <mesh position={[1.6, 1.6, 1.21]}>
        <boxGeometry args={[1.05, 0.05, 0.03]} />
        <meshStandardMaterial
          color={brassColor}
          metalness={0.85}
          roughness={0.15}
        />
      </mesh>

      {/* Brass corner posts */}
      {[
        [-2.1, 1.21],
        [2.1, 1.21],
        [-2.1, -0.6],
        [2.1, -0.6],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 1.3, z]}>
          <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
          <meshStandardMaterial
            color={brassColor}
            metalness={0.85}
            roughness={0.15}
          />
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
  const feltColor = theme === "light" ? "#9f887a" : "#6b4c10";
  const woodColor = theme === "light" ? "#a07840" : "#5c2a0e";
  const woodDark = theme === "light" ? "#7a5c30" : "#3d1c06";
  const brassColor = "#b8860b";
  // const brassColor = "black";
  // 9f887a
  return (
    <group position={[x, 0, 0]}>
      {/* Table legs */}
      {[
        [-0.85, -0.45],
        [-0.85, 0.45],
        [0.85, -0.45],
        [0.85, 0.45],
      ].map(([lx, lz], i) => (
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
        <meshStandardMaterial
          color={brassColor}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Small nameplate */}
      <mesh position={[0, 0.62, 0.42]}>
        <boxGeometry args={[0.5, 0.04, 0.12]} />
        <meshStandardMaterial
          color={brassColor}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
};

const WitnessStand = ({ theme }: { theme: string }) => {
  const woodColor = theme === "light" ? "#8b6914" : "#5c2a0e";
  const woodDark = theme === "light" ? "#6b4c10" : "#3d1c06";
  const feltColor = theme === "light" ? "#8b4513" : "#1a4731";
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
      {[
        [-0.55, -0.55],
        [-0.55, 0.55],
        [0.55, -0.55],
        [0.55, 0.55],
      ].map(([cx, cz], i) => (
        <mesh key={i} position={[cx, 0.82, cz]}>
          <cylinderGeometry args={[0.04, 0.04, 0.12, 6]} />
          <meshStandardMaterial
            color={brassColor}
            metalness={0.85}
            roughness={0.15}
          />
        </mesh>
      ))}
      {/* "WITNESS" label text would go here */}
    </group>
  );
};

const EvidenceScreen = ({ theme }: { theme: string }) => {
  const frameColor = "#1a1a2a";
  const screenColor = theme === "light" ? "#ffffff" : "#232836";
  const emissiveColor = theme === "light" ? "#f8fafc" : "#7e96c9";
  const brassColor = "#b8860b";

  return (
    <group position={[0, 5.0, -7.5]}>
      {/* Outer brass border */}
      <mesh>
        <boxGeometry args={[6.45, 4.2, 0.08]} />
        <meshStandardMaterial
          color={brassColor}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      {/* Inner dark frame */}
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[6.0, 3.75, 0.06]} />
        <meshStandardMaterial color={frameColor} roughness={0.75} />
      </mesh>
      {/* Screen surface */}
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[5.4, 3.15]} />
        <meshStandardMaterial
          color={screenColor}
          emissive={emissiveColor}
          emissiveIntensity={theme === "light" ? 0.45 : 1.8}
          roughness={0.9}
          metalness={0.02}
        />
      </mesh>
      {/* "EXHIBIT A" text */}
      <Text
        position={[0, 0.45, 0.12]}
        fontSize={0.25}
        color="#d4a542"
        anchorX="center"
        font={undefined}
      >
        EXHIBIT A
      </Text>
      <Text
        position={[0, -0.3, 0.12]}
        fontSize={0.12}
        color={theme === "light" ? "#475569" : "#8899aa"}
        anchorX="center"
        font={undefined}
      >
        Contract_Agreement_2025.pdf
      </Text>
      {/* Screen corner screws */}
      {[
        [-2.925, 1.875],
        [2.925, 1.875],
        [-2.925, -1.875],
        [2.925, -1.875],
      ].map(([sx, sy], i) => (
        <mesh key={i} position={[sx, sy, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.04, 8]} />
          <meshStandardMaterial
            color={brassColor}
            metalness={0.9}
            roughness={0.1}
          />
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
        <group key={row} position={[0, 0, row * 1.2]}>
          {/* Pew seat */}
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[6.2, 0.08, 0.55]} />
            <meshStandardMaterial color={pewColor} roughness={0.5} />
          </mesh>
          {/* Pew back rest */}
          <mesh position={[0, 0.52, 0.22]}>
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
  // const floorColor = theme === "light" ? "#ffffff" : "#050505";
  // const floorColor = theme === "light" ? "#ffffff" : "#101417";
  const floorColor = theme === "light" ? "#ffffff" : "#1b1d21";
  const gridColor = theme === "light" ? "#e2e8f0" : "#343841";

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          color={floorColor}
          roughness={0.96}
          metalness={0.04}
        />
      </mesh>
      <Grid
        infiniteGrid
        args={[100, 100]}
        fadeDistance={60}
        fadeStrength={5}
        sectionSize={1.5}
        sectionThickness={1}
        sectionColor={gridColor}
        cellSize={1.5}
        cellThickness={0.5}
        cellColor={gridColor}
        position={[0, -0.01, 0]}
      />
    </group>
  );
};

const Walls = ({ theme }: { theme: string }) => {
  const wallTopColor = theme === "light" ? "#fcfaf5" : "#4f473f";
  const woodColor = theme === "light" ? "#a47d68" : "#120c09";
  const stripEmissiveColor = theme === "light" ? "#fff2d1" : "#ffcc88";
  const wallHeight = 25;
  const wallSpan = 50;
  const wainscotHeight = 1;

  return (
    <group>
      {/* Front Wall (behind judge) */}
      <group position={[0, wallHeight / 2, -25]}>
        {/* Upper Wall - Height Significantly Reduced */}
        <mesh position={[0, wainscotHeight / 2, 0]}>
          <boxGeometry args={[wallSpan, wallHeight - wainscotHeight, 0.2]} />
          <meshStandardMaterial
            color={wallTopColor}
            roughness={0.95}
            metalness={0.02}
          />
        </mesh>
        {/* Lower Wainscoting - Height Increased to 12m */}
        <mesh position={[0, -wallHeight / 2 + wainscotHeight / 2, 0]}>
          <boxGeometry args={[wallSpan, wainscotHeight, 0.25]} />
          <meshStandardMaterial
            color={woodColor}
            roughness={0.88}
            metalness={0.04}
          />
        </mesh>
        {/* Cove Light Glow */}
        <mesh position={[0, wallHeight / 2 - 0.2, 0.15]}>
          <boxGeometry args={[wallSpan, 0.1, 0.1]} />
          <meshStandardMaterial
            color={theme === "light" ? "#f4eadb" : "#050505"}
            emissive={stripEmissiveColor}
            emissiveIntensity={theme === "light" ? 1.6 : 2.2}
            roughness={1}
            metalness={0}
          />
        </mesh>
      </group>

      {/* Back Wall */}
      <group position={[0, wallHeight / 2, 25]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, wainscotHeight / 2, 0]}>
          <boxGeometry args={[wallSpan, wallHeight - wainscotHeight, 0.2]} />
          <meshStandardMaterial
            color={wallTopColor}
            roughness={0.95}
            metalness={0.02}
          />
        </mesh>
        <mesh position={[0, -wallHeight / 2 + wainscotHeight / 2, 0]}>
          <boxGeometry args={[wallSpan, wainscotHeight, 0.25]} />
          <meshStandardMaterial
            color={woodColor}
            roughness={0.88}
            metalness={0.04}
          />
        </mesh>
      </group>

      {/* Left Wall */}
      <group position={[-25, wallHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, wainscotHeight / 2, 0]}>
          <boxGeometry args={[wallSpan, wallHeight - wainscotHeight, 0.2]} />
          <meshStandardMaterial
            color={wallTopColor}
            roughness={0.95}
            metalness={0.02}
          />
        </mesh>
        <mesh position={[0, -wallHeight / 2 + wainscotHeight / 2, 0]}>
          <boxGeometry args={[wallSpan, wainscotHeight, 0.25]} />
          <meshStandardMaterial
            color={woodColor}
            roughness={0.88}
            metalness={0.04}
          />
        </mesh>
        <mesh position={[0, wallHeight / 2 - 0.45, 0.15]}>
          <boxGeometry args={[wallSpan - 4, 0.18, 0.12]} />
          <meshStandardMaterial
            color="#050505"
            emissive={stripEmissiveColor}
            emissiveIntensity={theme === "light" ? 1.4 : 2.6}
            roughness={1}
            metalness={0}
          />
        </mesh>
      </group>

      {/* Right Wall */}
      <group position={[25, wallHeight / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, wainscotHeight / 2, 0]}>
          <boxGeometry args={[wallSpan, wallHeight - wainscotHeight, 0.2]} />
          <meshStandardMaterial
            color={wallTopColor}
            roughness={0.95}
            metalness={0.02}
          />
        </mesh>
        <mesh position={[0, -wallHeight / 2 + wainscotHeight / 2, 0]}>
          <boxGeometry args={[wallSpan, wainscotHeight, 0.25]} />
          <meshStandardMaterial
            color={woodColor}
            roughness={0.88}
            metalness={0.04}
          />
        </mesh>
        <mesh position={[0, wallHeight / 2 - 0.45, 0.15]}>
          <boxGeometry args={[wallSpan - 4, 0.18, 0.12]} />
          <meshStandardMaterial
            color="#050505"
            emissive={stripEmissiveColor}
            emissiveIntensity={theme === "light" ? 1.4 : 2.6}
            roughness={1}
            metalness={0}
          />
        </mesh>
      </group>
    </group>
  );
};

const Pillars = ({ theme }: { theme: string }) => {
  const pillarColor = theme === "light" ? "#d1d5db" : "#334155";
  const pillarPositions: [number, number, number][] = [
    [-8, 0, -8],
    [-8, 0, 0],
    [-8, 0, 8],
    [8, 0, -8],
    [8, 0, 0],
    [8, 0, 8],
  ];

  return (
    <group>
      {pillarPositions.map((pos, i) => (
        <mesh key={i} position={[pos[0], 12.5, pos[2]]}>
          <cylinderGeometry args={[0.4, 0.45, 25, 16]} />
          <meshStandardMaterial
            color={pillarColor}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
};

const Ceiling = ({ theme }: { theme: string }) => {
  // const ceilingColor = theme === "light" ? "#ffffff" : "#0f172a";
  const ceilingColor = theme === "light" ? "#ded9d3" : "#0f172a";
  const lightColor = "#ffffff";
  const panelColor = "#ffffff";
  // ded9d3
  const panels = [
    [-6, -6],
    [0, -6],
    [6, -6],
    [-6, 6],
    [0, 6],
    [6, 6],
  ];

  return (
    <group position={[0, 25, 0]}>
      {/* Main Ceiling Slab */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color={ceilingColor} side={THREE.BackSide} />
      </mesh>

      {/* Recessed LED Panels */}
      {panels.map(([x, z], i) => (
        <group key={i} position={[x, -0.05, z]}>
          {/* Panel Frame/Bezel */}
          <mesh>
            <boxGeometry args={[2.1, 0.02, 2.1]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          {/* Emissive Light Surface */}
          <mesh position={[0, -0.01, 0]}>
            <boxGeometry args={[2, 0.02, 2]} />
            <meshStandardMaterial
              color={panelColor}
              emissive={panelColor}
              // emissiveIntensity={2}
              emissiveIntensity={0.5}
            />
          </mesh>
          {/* <pointLight
            intensity={2}
            distance={20}
            color={lightColor}
            decay={2}
          /> */}
          {/* <ambientLight intensity={0.1} /> */}
        </group>
      ))}
    </group>
  );
};

const BrandText = () => (
  <Text
    position={[0, 4.5, -6.9]}
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
  const {
    participants,
    currentUserRole,
    localStream,
    remoteStreams,
    localParticipantId,
  } = useCourtroomContext();

  const { theme } = useTheme();
  const currentTheme = (() => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
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
    if (judge)
      positions.push({
        participant: judge,
        pos: [0, 0.6, -4.2],
        rot: [0, 0, 0],
      });

    const prosLawyers = participants.filter(
      (p) => p.role === "lawyer" && p.side === "prosecution",
    );
    const defLawyers = participants.filter(
      (p) => p.role === "lawyer" && p.side === "defense",
    );

    // Lawyers look towards judge (rot Y=PI)
    prosLawyers.forEach((p, i) =>
      positions.push({
        participant: p,
        pos: [-2.5 + i * 0.8, 0, 0.7],
        rot: [0, Math.PI, 0],
      }),
    );
    defLawyers.forEach((p, i) =>
      positions.push({
        participant: p,
        pos: [2.5 - i * 0.8, 0, 0.7],
        rot: [0, Math.PI, 0],
      }),
    );

    const prosLitigants = participants.filter(
      (p) => p.role === "litigant" && p.side === "prosecution",
    );
    const defLitigants = participants.filter(
      (p) => p.role === "litigant" && p.side === "defense",
    );

    // Litigants also face judge
    prosLitigants.forEach((p, i) =>
      positions.push({
        participant: p,
        pos: [-3.5 - i * 0.8, 0, 0.7],
        rot: [0, Math.PI, 0],
      }),
    );
    defLitigants.forEach((p, i) =>
      positions.push({
        participant: p,
        pos: [3.5 + i * 0.8, 0, 0.7],
        rot: [0, Math.PI, 0],
      }),
    );

    const observers = participants.filter((p) => p.role === "observer");
    // Observers face judge
    observers.forEach((p, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      positions.push({
        participant: p,
        pos: [-1.5 + col * 1.5, 0, 3.5 + row * 1.5],
        rot: [0, Math.PI, 0],
      });
    });

    return positions;
  }, [participants]);

  return (
    <div className="absolute inset-0" style={{ top: "56px", bottom: "80px" }}>
      <Canvas
        camera={{ position: [0, 5, 8], fov: 50 }}
        // gl={{ antialias: true }}
        gl={{
          antialias: true,
          physicallyCorrectLights: true,
          toneMappingExposure: currentTheme === "light" ? 0.95 : 0.72,
        }}
      >
        <ambientLight
          intensity={currentTheme === "light" ? 0.3 : 0.2}
          color={currentTheme === "light" ? "#fff5ea" : "#f6ede3"}
        />
        <spotLight
          position={[0, 7.8, -1.6]}
          target-position={[0, 0.9, -3.8]}
          angle={currentTheme === "light" ? 0.42 : 0.38}
          penumbra={0.85}
          intensity={currentTheme === "light" ? 0.9 : 1.25}
          distance={18}
          decay={2}
          color={currentTheme === "light" ? "#fff4df" : "#ffe0b0"}
        />
        {currentTheme === "dark" && (
          <>
            <pointLight
              position={[-16, 11.5, 0]}
              intensity={0.2}
              distance={20}
              decay={2}
              color="#ffcc88"
            />
            <pointLight
              position={[16, 11.5, 0]}
              intensity={0.2}
              distance={20}
              decay={2}
              color="#ffcc88"
            />
          </>
        )}

        <Floor theme={currentTheme} />
        <Walls theme={currentTheme} />
        <Pillars theme={currentTheme} />
        <Ceiling theme={currentTheme} />
        <JudgeBench theme={currentTheme} />
        <LawyerTable side="left" theme={currentTheme} />
        <LawyerTable side="right" theme={currentTheme} />
        <WitnessStand theme={currentTheme} />
        <EvidenceScreen theme={currentTheme} />
        <Gallery theme={currentTheme} />

        {avatarPositions.map(({ participant, pos, rot }) => {
          const isLocal = participant.id === localParticipantId;

          const stream = isLocal ? localStream : remoteStreams[participant.id];

          return (
            <Avatar3D
              key={participant.id}
              participant={participant}
              position={pos}
              rotation={rot}
              stream={stream || undefined}
            />
          );
        })}

        <ContactShadows
          position={[0, -0.015, 0]}
          opacity={currentTheme === "light" ? 0.3 : 0.5}
          scale={40}
          blur={2.5}
          far={10}
          resolution={512}
          frames={1}
        />
        <OrbitControls
          makeDefault
          // maxPolarAngle={Math.PI / 2.2}
          maxPolarAngle={180}
          minDistance={2}
          maxDistance={15}
          target={[0, 1.5, -1]}
        />
        {/* Fog effect restricted to Dark mode */}
        {/* {currentTheme === "dark" && (
          <fog attach="fog" args={["#000000", 5, 20]} />
        )} */}
        {/* Horizon light effect */}
        <mesh position={[0, 0, -60]}>
          <planeGeometry args={[500, 100]} />
          <meshBasicMaterial
            color={currentTheme === "light" ? "#ffffff" : "#ffffff"}
            transparent
            opacity={0.03}
          />
        </mesh>
      </Canvas>
    </div>
  );
};

export default CourtroomScene;
