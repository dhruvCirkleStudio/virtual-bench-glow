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

// Gavel component sitting on the bench
const Gavel = ({ position }: { position: [number, number, number] }) => (
  <group position={position} rotation={[0, Math.PI / 5, 0]}>
    {/* Handle */}
    <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.025, 0.03, 0.45, 10]} />
      <meshStandardMaterial color="#3d1c06" roughness={0.4} metalness={0.0} />
    </mesh>
    {/* Mallet head */}
    <mesh position={[0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.055, 0.055, 0.16, 12]} />
      <meshStandardMaterial color="#5c2d0a" roughness={0.35} metalness={0.05} />
    </mesh>
    {/* Brass band on mallet */}
    <mesh position={[0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.058, 0.058, 0.025, 12]} />
      <meshStandardMaterial color="#b8860b" metalness={0.85} roughness={0.15} />
    </mesh>
    {/* Gavel block */}
    <mesh position={[0, -0.04, 0.05]}>
      <boxGeometry args={[0.12, 0.04, 0.1]} />
      <meshStandardMaterial color="#3d1c06" roughness={0.4} />
    </mesh>
  </group>
);

// Judge avatar — robes, wig, face details
const JudgeAvatar3D = ({
  participant,
  position,
}: {
  participant: Participant;
  position: [number, number, number];
}) => {
  const glowRef = useRef<THREE.Mesh>(null);
  const roleColor = ROLE_COLORS[participant.role];

  useFrame(() => {
    if (glowRef.current && participant.isSpeaking) {
      glowRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.1);
    }
  });

  return (
    <group position={position}>
      {/* Speaking glow */}
      {participant.isSpeaking && (
        <mesh ref={glowRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.78, 32]} />
          <meshBasicMaterial color={roleColor} transparent opacity={0.45} />
        </mesh>
      )}

      {/* Black judge robe - wide at bottom */}
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.28, 0.36, 1.0, 10]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      {/* Robe collar / white band */}
      <mesh position={[0, 1.02, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.12, 10]} />
        <meshStandardMaterial color="#e8e0d0" roughness={0.7} />
      </mesh>
      {/* White jabot / cravat */}
      <mesh position={[0, 0.97, 0.15]}>
        <boxGeometry args={[0.12, 0.14, 0.04]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.8} />
      </mesh>
      {/* Gold badge / crest on robe */}
      <mesh position={[0.12, 0.82, 0.27]}>
        <cylinderGeometry args={[0.045, 0.045, 0.02, 8]} />
        <meshStandardMaterial color="#d4a542" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.09, 0.1, 0.14, 10]} />
        <meshStandardMaterial color="#d4a077" roughness={0.6} />
      </mesh>
      {/* Head / face */}
      <mesh position={[0, 1.28, 0]}>
        <sphereGeometry args={[0.19, 16, 16]} />
        <meshStandardMaterial color="#d4a077" roughness={0.55} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.07, 1.3, 0.17]}>
        <sphereGeometry args={[0.028, 8, 8]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.3} />
      </mesh>
      <mesh position={[0.07, 1.3, 0.17]}>
        <sphereGeometry args={[0.028, 8, 8]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.3} />
      </mesh>
      {/* Eyebrows */}
      <mesh position={[-0.07, 1.35, 0.175]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[0.065, 0.014, 0.01]} />
        <meshStandardMaterial color="#6b4c2a" roughness={0.5} />
      </mesh>
      <mesh position={[0.07, 1.35, 0.175]} rotation={[0, 0, -0.15]}>
        <boxGeometry args={[0.065, 0.014, 0.01]} />
        <meshStandardMaterial color="#6b4c2a" roughness={0.5} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 1.26, 0.19]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#c0906a" roughness={0.6} />
      </mesh>
      {/* Mouth — slight stern frown */}
      <mesh position={[0, 1.19, 0.18]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.07, 0.012, 0.01]} />
        <meshStandardMaterial color="#8b5a4a" roughness={0.5} />
      </mesh>
      {/* Ears */}
      <mesh position={[-0.19, 1.27, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#c8956a" roughness={0.6} />
      </mesh>
      <mesh position={[0.19, 1.27, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#c8956a" roughness={0.6} />
      </mesh>

      {/* Judge's white powdered wig */}
      <mesh position={[0, 1.42, 0]}>
        <sphereGeometry args={[0.22, 14, 14]} />
        <meshStandardMaterial color="#f0ede8" roughness={0.9} />
      </mesh>
      {/* Wig curls front */}
      {[-0.12, 0, 0.12].map((x, i) => (
        <mesh key={i} position={[x, 1.35, 0.17]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial color="#ede8e0" roughness={0.9} />
        </mesh>
      ))}
      {/* Wig side curls */}
      <mesh position={[-0.21, 1.22, 0.04]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#ede8e0" roughness={0.9} />
      </mesh>
      <mesh position={[0.21, 1.22, 0.04]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#ede8e0" roughness={0.9} />
      </mesh>

      {/* Gold crown/laurel accent on wig */}
      <mesh position={[0, 1.56, 0]}>
        <torusGeometry args={[0.17, 0.018, 8, 24]} />
        <meshStandardMaterial color="#d4a542" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Name label */}
      <Text position={[0, 1.85, 0]} fontSize={0.11} color="white" anchorX="center" anchorY="bottom" font={undefined}>
        {participant.name.split(" ").pop()}
      </Text>
      {/* Role badge */}
      <Text position={[0, 1.73, 0]} fontSize={0.08} color={roleColor} anchorX="center" anchorY="bottom" font={undefined}>
        JUDGE
      </Text>
    </group>
  );
};

// Standard avatar for non-judge roles
const Avatar3D = ({
  participant,
  position,
}: {
  participant: Participant;
  position: [number, number, number];
}) => {
  // Use special judge avatar
  if (participant.role === "judge") {
    return <JudgeAvatar3D participant={participant} position={position} />;
  }

  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const roleColor = ROLE_COLORS[participant.role];

  // Suit color by side
  const suitColor = participant.side === "prosecution" ? "#1b3a5c" : participant.side === "defense" ? "#2a1a3e" : "#2a2a2a";

  useFrame(() => {
    if (glowRef.current && participant.isSpeaking) {
      glowRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.1);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Speaking glow ring */}
      {participant.isSpeaking && (
        <mesh ref={glowRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.65, 32]} />
          <meshBasicMaterial color={roleColor} transparent opacity={0.4} />
        </mesh>
      )}
      {/* Legs */}
      <mesh position={[-0.09, 0.22, 0]}>
        <boxGeometry args={[0.1, 0.44, 0.12]} />
        <meshStandardMaterial color={suitColor} roughness={0.7} />
      </mesh>
      <mesh position={[0.09, 0.22, 0]}>
        <boxGeometry args={[0.1, 0.44, 0.12]} />
        <meshStandardMaterial color={suitColor} roughness={0.7} />
      </mesh>
      {/* Body / suit jacket */}
      <mesh position={[0, 0.62, 0]}>
        <boxGeometry args={[0.34, 0.42, 0.22]} />
        <meshStandardMaterial color={suitColor} roughness={0.65} />
      </mesh>
      {/* Shirt / white collar */}
      <mesh position={[0, 0.73, 0.115]}>
        <boxGeometry args={[0.1, 0.14, 0.02]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.7} />
      </mesh>
      {/* Tie */}
      <mesh position={[0, 0.65, 0.118]}>
        <boxGeometry args={[0.04, 0.2, 0.01]} />
        <meshStandardMaterial color={roleColor} roughness={0.6} />
      </mesh>
      {/* Shoulders */}
      <mesh position={[-0.21, 0.72, 0]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color={suitColor} roughness={0.65} />
      </mesh>
      <mesh position={[0.21, 0.72, 0]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color={suitColor} roughness={0.65} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0.88, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.1, 8]} />
        <meshStandardMaterial color="#d4a077" roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.03, 0]}>
        <sphereGeometry args={[0.17, 14, 14]} />
        <meshStandardMaterial color="#d4a077" roughness={0.55} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.06, 1.05, 0.155]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.06, 1.05, 0.155]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Hair */}
      <mesh position={[0, 1.14, 0]}>
        <sphereGeometry args={[0.175, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
        <meshStandardMaterial color={participant.avatarColor} roughness={0.8} />
      </mesh>
      {/* Name label */}
      <Text position={[0, 1.4, 0]} fontSize={0.11} color="white" anchorX="center" anchorY="bottom" font={undefined}>
        {participant.name.split(" ").pop()}
      </Text>
      {/* Role badge */}
      <Text position={[0, 1.28, 0]} fontSize={0.08} color={roleColor} anchorX="center" anchorY="bottom" font={undefined}>
        {participant.role.toUpperCase()}
      </Text>
    </group>
  );
};

// Courtroom furniture
const JudgeBench = ({ theme }: { theme: string }) => {
  // Rich mahogany wood for the judge's elevated bench
  const woodColor = theme === "light" ? "#5c2d0a" : "#6b3510";
  const woodDark = theme === "light" ? "#3d1c06" : "#4a2208";
  const feltColor = "#1a4731"; // court green felt
  const brassColor = "#b8860b";
  const marbleColor = theme === "light" ? "#d4c8b0" : "#8a7d6a";

  return (
    <group position={[0, 0, -4]}>
      {/* Elevated platform - marble */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[3.8, 0.4, 2]} />
        <meshStandardMaterial color={marbleColor} roughness={0.2} metalness={0.05} />
      </mesh>
      {/* Step riser */}
      <mesh position={[0, 0.1, 1.1]}>
        <boxGeometry args={[3.8, 0.2, 0.2]} />
        <meshStandardMaterial color={marbleColor} roughness={0.2} />
      </mesh>
      {/* Main bench body - mahogany */}
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[3.4, 0.5, 1.6]} />
        <meshStandardMaterial color={woodColor} roughness={0.5} />
      </mesh>
      {/* Front panel carved detail */}
      <mesh position={[0, 0.55, 0.82]}>
        <boxGeometry args={[3.3, 0.3, 0.04]} />
        <meshStandardMaterial color={woodDark} roughness={0.6} />
      </mesh>
      {/* Desk top - green felt surface */}
      <mesh position={[0, 0.92, 0]}>
        <boxGeometry args={[3.5, 0.06, 1.7]} />
        <meshStandardMaterial color={feltColor} roughness={0.9} />
      </mesh>
      {/* Brass front trim */}
      <mesh position={[0, 0.9, 0.86]}>
        <boxGeometry args={[3.5, 0.06, 0.04]} />
        <meshStandardMaterial color={brassColor} metalness={0.85} roughness={0.15} />
      </mesh>
      {/* Brass corner posts */}
      {[-1.72, 1.72].map((x, i) => (
        <mesh key={i} position={[x, 0.7, 0.84]}>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
          <meshStandardMaterial color={brassColor} metalness={0.85} roughness={0.15} />
        </mesh>
      ))}
      {/* Gavel block on desk */}
      <mesh position={[1.2, 0.97, 0]}>
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
  // Prosecution (left) = navy blue felt; Defense (right) = burgundy felt
  const feltColor = side === "left" ? "#1b3a5c" : "#5c1a2a";
  const woodColor = theme === "light" ? "#4a2008" : "#5c2a0e";
  const woodDark = theme === "light" ? "#2e1204" : "#3d1c06";
  const brassColor = "#b8860b";

  return (
    <group position={[x, 0, -1]}>
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
  const woodColor = theme === "light" ? "#4a2008" : "#5c2a0e";
  const woodDark = theme === "light" ? "#2e1204" : "#3d1c06";
  const feltColor = "#1a4731";
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
  const pewColor = theme === "light" ? "#4a2008" : "#5c2a0e";
  const pewDark = theme === "light" ? "#2e1204" : "#3d1c06";
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
  const floorColor = theme === "light" ? "#c8bfa8" : "#6e6355";
  const floorColor2 = theme === "light" ? "#b5aa94" : "#5e5448";
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
  const wallColor = theme === "light" ? "#e8dcc8" : "#4a4235";
  const wainscotColor = theme === "light" ? "#5c2d0a" : "#6b3510";

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
          <fog attach="fog" args={["#2a2e3e", 14, 30]} />
        )}
      </Canvas>
    </div>
  );
};

export default CourtroomScene;
