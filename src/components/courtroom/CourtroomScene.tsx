import { useRef, useMemo, useEffect, useState, memo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  Environment,
  ContactShadows,
  Grid,
  useTexture,
} from "@react-three/drei";
import { Suspense } from "react";
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
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!stream) return;

    const v = document.createElement("video");
    v.srcObject = stream;
    v.muted = true;
    v.autoplay = true;
    v.playsInline = true;

    // Crucial for Three.js VideoTexture: ensure metadata is loaded
    v.onloadedmetadata = () => {
      v.play().catch(() => {});
    };

    // If tracks are added later, re-attempt play
    const handleAddTrack = () => {
      v.play().catch(() => {});
    };

    stream.addEventListener("addtrack", handleAddTrack);
    setVideo(v);

    return () => {
      stream.removeEventListener("addtrack", handleAddTrack);
      v.pause();
      v.srcObject = null;
      v.load();
    };
  }, [stream]);

  if (!video) return null;

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
  const micGlowRef = useRef<THREE.Mesh>(null);
  const roleColor = ROLE_COLORS[participant.role];
  const isLawyer = participant.role === "lawyer";
  const isMicActive = !participant.isMuted;

  useFrame((state) => {
    if (glowRef.current && participant.isSpeaking) {
      glowRef.current.scale.setScalar(
        1 + Math.sin(state.clock.elapsedTime * 5) * 0.1,
      );
    }
    // Gentle pulse for mic-on glow ring
    if (micGlowRef.current && isMicActive) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.08;
      micGlowRef.current.scale.setScalar(pulse);
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

      {/* Mic-on glow ring at avatar base */}
      {isMicActive && (
        <mesh
          ref={micGlowRef}
          position={[0, 0.02, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.3, 0.45, 48]} />
          <meshBasicMaterial color="#4ade80" transparent opacity={0.35} />
        </mesh>
      )}
      {/* Mic-on soft ground disc */}
      {isMicActive && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.35, 48]} />
          <meshBasicMaterial color="#4ade80" transparent opacity={0.1} />
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
  // const woodColor = theme === "light" ? "#6b4f3a" : "#6b3510";
  const woodColor = theme === "light" ? "#6b4f3a" : "#7d675b";
  const woodDark = theme === "light" ? "#4d3828" : "#4a2208";
  const feltColor = theme === "light" ? "#4a3728" : "#1a2d4a";
  const brassColor = "#d4a030";
  // const marbleColor = theme === "light" ? "#dce0e6" : "#8a7d6a";
  const marbleColor = theme === "light" ? "#dce0e6" : "#696f7b";
  // const marbleColor2 = theme === "light" ? "#cdd1d8" : "#7d7060";
  const marbleColor2 = theme === "light" ? "#cdd1d8" : "#696f7b";

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
  const feltColor = theme === "light" ? "#4a3728" : "#6b4c10";
  // const woodColor = theme === "light" ? "#a07840" : "#5c2a0e";
  const woodColor = theme === "light" ? "#a07840" : "#5F4744";
  // const woodDark = theme === "light" ? "#7a5c30" : "#3d1c06";
  const woodDark = theme === "light" ? "#7a5c30" : "#4A3735";
  const brassColor = "#b8860b";

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
      {/* <mesh position={[0, 0.605, 0]}>
        <boxGeometry args={[1.75, 0.01, 0.82]} />
        <meshStandardMaterial color={feltColor} roughness={0.9} />
      </mesh> */}
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

const ImageTexture = memo(({ url }: { url: string }) => {
  const texture = useTexture(url);
  return (
    <mesh position={[0, 0, 0.1]}>
      <planeGeometry args={[5.2, 2.9]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
});

ImageTexture.displayName = "ImageTexture";

const EvidenceScreen = ({ theme }: { theme: string }) => {
  const { evidence } = useCourtroomContext();
  const activeEvidence = useMemo(
    () => evidence.find((e) => e.isPresenting),
    [evidence],
  );

  const frameColor = "#1a1a2a";
  const screenColor = theme === "light" ? "#ffffff" : "#282c3c";
  const emissiveColor = theme === "light" ? "#f8fafc" : "#353a50";
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
        <meshStandardMaterial color={frameColor} roughness={0.2} />
      </mesh>
      {/* Screen surface */}
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[5.4, 3.15]} />
        <meshStandardMaterial
          color={screenColor}
          emissive={emissiveColor}
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* Active Evidence Content */}
      <Suspense
        fallback={
          <Text position={[0, 0, 0.1]} color="gold">
            Loading Texture...
          </Text>
        }
      >
        {(activeEvidence?.thumbnailUrl || activeEvidence?.url) &&
          (activeEvidence.type === "image" ||
            activeEvidence.type === "pdf") && (
            <ImageTexture
              url={activeEvidence.thumbnailUrl || activeEvidence.url!}
            />
          )}
      </Suspense>
      {/* Active Evidence Display (Text overlay if no image or extra info) */}
      {activeEvidence && (
        <group
          position={[
            0,
            0,
            activeEvidence.type === "image" || activeEvidence.type === "pdf"
              ? 0.12
              : 0.1,
          ]}
        >
          {!(activeEvidence.thumbnailUrl || activeEvidence.url) ||
          (activeEvidence.type !== "image" && activeEvidence.type !== "pdf") ? (
            <>
              <Text
                position={[0, 0.45, 0.02]}
                fontSize={0.25}
                color="#d4a542"
                anchorX="center"
                font={undefined}
              >
                EXHIBIT PRESENTED
              </Text>
              <Text
                position={[0, -0.1, 0.02]}
                fontSize={0.18}
                color={theme === "light" ? "#1e293b" : "#f1f5f9"}
                anchorX="center"
                font={undefined}
                maxWidth={4.5}
                textAlign="center"
              >
                {activeEvidence.name}
              </Text>
            </>
          ) : (
            // Small subtle label for images/PDFs
            <Text
              position={[2.4, -1.4, 0.02]}
              fontSize={0.08}
              color="#d4a542"
              anchorX="right"
              font={undefined}
            >
              {activeEvidence.name}
            </Text>
          )}
          <Text
            position={
              activeEvidence.type === "image" || activeEvidence.type === "pdf"
                ? [-2.4, -1.4, 0.02]
                : [0, -0.6, 0.02]
            }
            fontSize={0.1}
            color={
              theme === "light"
                ? activeEvidence.type === "image" ||
                  activeEvidence.type === "pdf"
                  ? "#ffffff"
                  : "#64748b"
                : "#94a3b8"
            }
            anchorX={
              activeEvidence.type === "image" || activeEvidence.type === "pdf"
                ? "left"
                : "center"
            }
            font={undefined}
          >
            Uploaded by: {activeEvidence.uploadedBy}
          </Text>
        </group>
      )}
      {!activeEvidence && (
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.2}
          color={theme === "light" ? "#cbd5e1" : "#475569"}
          anchorX="center"
          font={undefined}
        >
          AWAITING EVIDENCE
        </Text>
      )}
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
  // Use Grid for both themes for consistency
  // const floorColor = theme === "light" ? "#f8fafc" : "#020202";
  // const floorColor = theme === "light" ? "#f8fafc" : "#212126";
  const floorColor = theme === "light" ? "#f8fafc" : "#636672";
  // const gridColor = theme === "light" ? "#cbd5e1" : "#5ec2ff";
  const gridColor = theme === "light" ? "#cbd5e1" : "#353232ff";

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
          roughness={theme === "light" ? 0.9 : 0.8}
        />
      </mesh>
      <Grid
        infiniteGrid
        fadeDistance={40}
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

const Pillars = ({ theme }: { theme: string }) => {
  // const pillarColor = theme === "light" ? "#e2e8f0" : "#0a0a0a";
  // const pillarColor = theme === "light" ? "#e2e8f0" : "#1e293b";
  const pillarColor = theme === "light" ? "#e2e8f0" : "#797C86";
  const pillarPositions: [number, number, number][] = [
    [-6, 0, -5],
    [-6, 0, 0],
    [-6, 0, 5],
    [6, 0, -5],
    [6, 0, 0],
    [6, 0, 5],
  ];

  return (
    <group>
      {pillarPositions.map((pos, i) => (
        <mesh key={i} position={[pos[0], 4, pos[2]]}>
          <cylinderGeometry args={[0.3, 0.35, 12, 16]} />
          <meshStandardMaterial color={pillarColor} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
};

const Walls = () => {
  return null; // Unified design: No walls in either mode
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
    observers.forEach((p, i) =>
      positions.push({
        participant: p,
        pos: [-1.5 + i * 1.5, 0, 3.5],
        rot: [0, Math.PI, 0],
      }),
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
        {/* <Environment preset="night" /> */}
        {/* <color attach="background" args={["#000000"]} /> */}
        <ambientLight
          color="#F9F4EC"
          intensity={currentTheme === "light" ? 0.6 : 0.2}
        />
        {/* <directionalLight
          position={[5, 10, 5]}
          intensity={currentTheme === "light" ? 1.0 : 0.4}
          castShadow
        /> */}
        <directionalLight
          position={[5, 10, 5]}
          intensity={currentTheme === "light" ? 1.0 : 0.4}
          castShadow
        />
        {/* Unified focal spotlight */}
        {/* <spotLight
          position={[0, 10, 0]}
          angle={0.6}
          penumbra={0.5}
          intensity={currentTheme === "light" ? 1.5 : 2.2}
          castShadow
          color={currentTheme === "light" ? "#ffffff" : "#ffffff"}
        /> */}
        <spotLight
          color="#F9F4EC"
          position={[0, 20, 0]} // straight above
          angle={0.4} // focused beam
          penumbra={0.5} // soft edges
          intensity={currentTheme === "light" ? 1.5 : 300}
          castShadow
        />
        <pointLight position={[0, 2, 4]} intensity={0.5} distance={12} />
        {/* <pointLight
          position={[0, 4, -4]}
          intensity={currentTheme === "light" ? 0.2 : 1.2}
          color="#ffd700"
        /> */}
        {/* <pointLight
          position={[-3, 3, 0]}
          intensity={currentTheme === "light" ? 0.1 : 0.4}
          color="#4a7fd4"
        /> */}
        {/* <pointLight
          position={[3, 3, 0]}
          intensity={currentTheme === "light" ? 0.1 : 0.4}
          color="#4a7fd4"
        /> */}

        {/* Extra overhead glow for Dark Mode visibility */}
        {/* {currentTheme === "dark" && (
          <pointLight
            position={[0, 8, -2]}
            intensity={2.5}
            distance={20}
            color="#ffffff"
          />
        )} */}

        <Floor theme={currentTheme} />
        <Pillars theme={currentTheme} />
        <JudgeBench theme={currentTheme} />
        <LawyerTable side="left" theme={currentTheme} />
        <LawyerTable side="right" theme={currentTheme} />
        <WitnessStand theme={currentTheme} />
        <EvidenceScreen theme={currentTheme} />
        <Gallery theme={currentTheme} />
        {/* BrandText hidden for unified minimalistic look */}

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
          position={[0, -0.01, 0]}
          opacity={currentTheme === "light" ? 0.3 : 0.6}
          scale={20}
          blur={1.5}
          far={10}
          resolution={512}
        />
        <OrbitControls
          makeDefault
          // maxPolarAngle={Math.PI / 2.2}
          maxPolarAngle={10}
          minDistance={4}
          maxDistance={15}
          target={[0, 1.5, -1]}
        />
        {/* Fog effect restricted to Dark mode */}
        {/* {currentTheme === "dark" && (
          <fog attach="fog" args={["#000000", 10, 25]} />
        )} */}
        {/* {currentTheme === "dark" && (
          <fog attach="fog" args={["#0f172a", 10, 25]} />
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
