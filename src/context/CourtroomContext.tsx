import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Participant, ChatMessage, EvidenceItem, CourtStatus, Role } from '@/types/courtroom';
import { mockParticipants, mockMessages, mockEvidence } from '@/data/mockData';
import socketService from '@/services/socketService';
import webRTCService from '@/services/webRTCService';

interface CourtroomState {
  caseId: string;
  courtStatus: CourtStatus;
  elapsedSeconds: number;
  currentUserRole: Role;
  participants: Participant[];
  messages: ChatMessage[];
  evidence: EvidenceItem[];
  isMicOn: boolean;
  isCameraOn: boolean;
  isHandRaised: boolean;
  showParticipants: boolean;
  showChat: boolean;
  activeRightTab: 'evidence' | 'chat';
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  localParticipantId: string | null;
}

interface CourtroomActions {
  setCourtStatus: (s: CourtStatus) => void;
  toggleMic: () => void;
  toggleCamera: () => void;
  toggleHand: () => void;
  toggleParticipants: () => void;
  toggleChat: () => void;
  setActiveRightTab: (t: 'evidence' | 'chat') => void;
  sendMessage: (content: string) => void;
  muteParticipant: (id: string) => void;
  removeParticipant: (id: string) => void;
  grantSpeaking: (id: string) => void;
  presentEvidence: (id: string) => void;
  toggleScreenShare: () => void;
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
}

type CourtroomContextType = CourtroomState & CourtroomActions;

const CourtroomContext = createContext<CourtroomContextType | undefined>(undefined);

export const useCourtroomContext = () => {
  const ctx = useContext(CourtroomContext);
  if (!ctx) throw new Error('useCourtroomContext must be used within CourtroomProvider');
  return ctx;
};

const ROLE_COLORS: Record<string, string> = {
  judge: '#d4a542',
  lawyer: '#4a7fd4',
  litigant: '#c4c9d4',
  observer: '#777d88',
};

export const CourtroomProvider: React.FC<{ 
  children: React.ReactNode; 
  caseId: string; 
  role: Role; 
  side?: 'prosecution' | 'defense';
  userName?: string;
}> = ({ children, caseId, role, side, userName }) => {
  const [courtStatus, setCourtStatus] = useState<CourtStatus>('live');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localParticipantId, setLocalParticipantId] = useState<string | null>(null);
  const localParticipantIdRef = useRef<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [evidence, setEvidence] = useState<EvidenceItem[]>(mockEvidence);
  const [isMicOn, setMicOn] = useState(true);
  const [isCameraOn, setCameraOn] = useState(false);
  const [isHandRaised, setHandRaised] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [activeRightTab, setActiveRightTab] = useState<'evidence' | 'chat'>('chat');
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (courtStatus !== 'live') return;
    const interval = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [courtStatus]);

  // Join room and setup socket listeners
  useEffect(() => {
    console.log(`[CourtroomContext] Joining room: ${caseId}, role: ${role}, side: ${side}, userName: ${userName}`);
    socketService.connect();
    
    // Find our role in mock data to get initial profile info (fallback)
    const initialProfile = mockParticipants.find(p => p.role === role);
    const localId = `local-${role}-${Date.now().toString().slice(-4)}`;
    setLocalParticipantId(localId);
    localParticipantIdRef.current = localId;

    // Initial local user entry
    const finalName = userName || (initialProfile?.name || `Guest ${role}`);
    const participantSide = side || initialProfile?.side;
    
    console.log(`[CourtroomContext] Setting local participant: ${finalName} (${localId}) on ${participantSide}`);

    setParticipants([{
      id: localId,
      name: finalName,
      role: role,
      isMuted: !isMicOn,
      isSpeaking: false,
      hasCamera: isCameraOn,
      avatarColor: ROLE_COLORS[role] || ROLE_COLORS.observer,
      side: participantSide as any
    }]);
    
    socketService.joinRoom(caseId, localId, finalName, role, participantSide, isCameraOn, isMicOn);

    socketService.onMessage((newMessage) => {
      setMessages(prev => {
        if (prev.some(m => m.id === newMessage.id)) return prev;
        return [...prev, { ...newMessage, timestamp: new Date(newMessage.timestamp) }];
      });
    });

    socketService.onMessageHistory((history) => {
      setMessages(history.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
    });

    socketService.getSocket()?.on('join_error', (data: { message: string }) => {
      alert(`Could not join courtroom: ${data.message}`);
    });

    socketService.getSocket()?.on('room_participants', (roomParticipants: any[]) => {
      console.log('[CourtroomContext] Current room participants:', roomParticipants);
      const currentLocalId = localParticipantIdRef.current;
      
      const otherParticipants: Participant[] = roomParticipants
        .filter(p => p.participantId !== currentLocalId)
        .map(p => ({
          id: p.participantId,
          name: p.userName,
          role: p.role,
          side: p.side,
          isMuted: !p.hasMic,
          isSpeaking: false,
          hasCamera: p.hasCamera,
          avatarColor: p.avatarColor || ROLE_COLORS[p.role] || ROLE_COLORS.observer
        }));

      setParticipants(prev => {
        const localUser = prev.find(p => p.id === currentLocalId);
        return localUser ? [localUser, ...otherParticipants] : otherParticipants;
      });

      roomParticipants.forEach(p => {
        if (p.participantId !== currentLocalId) {
          webRTCService.createPeerConnection(p.participantId, p.socketId, localStreamRef.current, true);
        }
      });
    });

    socketService.getSocket()?.on('participant_joined', (data: any) => {
      console.log('[CourtroomContext] New participant joined:', data);
      const currentLocalId = localParticipantIdRef.current;
      if (data.participantId === currentLocalId) return;

      const newParticipant: Participant = {
        id: data.participantId,
        name: data.userName,
        role: data.role,
        side: data.side,
        isMuted: !data.hasMic,
        isSpeaking: false,
        hasCamera: data.hasCamera,
        avatarColor: data.avatarColor || ROLE_COLORS[data.role] || ROLE_COLORS.observer
      };

      setParticipants(prev => {
        if (prev.find(p => p.id === newParticipant.id)) return prev;
        return [...prev, newParticipant];
      });

      // When a new participant joins, we wait for THEM to send us an offer
      webRTCService.createPeerConnection(data.participantId, data.socketId, localStreamRef.current, false);
    });

    socketService.getSocket()?.on('webrtc_signal', (data: any) => {
      webRTCService.handleSignal(data.senderSocketId, data.senderParticipantId, data.signalData, localStreamRef.current);
    });

    socketService.getSocket()?.on('camera_status_changed', ({ participantId, hasCamera }: any) => {
      setParticipants(prev => prev.map(p => p.id === participantId ? { ...p, hasCamera } : p));
    });

    socketService.getSocket()?.on('mic_status_changed', ({ participantId, hasMic }: any) => {
      setParticipants(prev => prev.map(p => p.id === participantId ? { ...p, isMuted: !hasMic } : p));
    });

    socketService.getSocket()?.on('participant_left', ({ participantId, socketId }: any) => {
      webRTCService.closeConnection(socketId);
      setRemoteStreams(prev => {
        const next = { ...prev };
        delete next[participantId];
        return next;
      });
      setParticipants(prev => prev.filter(p => p.id !== participantId));
    });

    webRTCService.onRemoteStream((participantId, stream) => {
      console.log('Setting remote stream for:', participantId);
      // We spread the previous state to ensure a new object reference for remoteStreams,
      // which triggers a re-render of components using remoteStreams.
      setRemoteStreams(prev => ({ ...prev, [participantId]: stream }));
    });

    return () => {
      socketService.disconnect();
      webRTCService.closeAll();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [role]);

  const toggleMic = useCallback(() => {
    setMicOn(prev => {
      const next = !prev;
      if (localStream) {
        localStream.getAudioTracks().forEach(track => track.enabled = next);
      }
      // Update the local participant's isMuted state so the avatar glow reacts
      const currentId = localParticipantIdRef.current;
      setParticipants(prevParts =>
        prevParts.map(p =>
          p.id === currentId ? { ...p, isMuted: !next } : p
        )
      );
      // Broadcast mic state to other users
      socketService.getSocket()?.emit('mic_toggle', { caseId, participantId: currentId, hasMic: next });
      return next;
    });
  }, [localStream, caseId]);

  const toggleCamera = useCallback(async () => {
    if (!isCameraOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        localStreamRef.current = stream;
        stream.getAudioTracks().forEach(track => track.enabled = isMicOn);
        setCameraOn(true);
        
        const currentUser = participants.find(p => p.role === role);
        if (currentUser) {
          setParticipants(prev => prev.map(p => p.id === currentUser.id ? { ...p, hasCamera: true } : p));
          socketService.getSocket()?.emit('camera_toggle', { caseId, participantId: currentUser.id, hasCamera: true });
        }
        
        // Signal to others that we now have a stream
        webRTCService.addLocalTracks(stream);
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    } else {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
        localStreamRef.current = null;
      }
      setCameraOn(false);
      const currentUser = participants.find(p => p.role === role);
      if (currentUser) {
        setParticipants(prev => prev.map(p => p.id === currentUser.id ? { ...p, hasCamera: false } : p));
        socketService.getSocket()?.emit('camera_toggle', { caseId, participantId: currentUser.id, hasCamera: false });
      }
    }
  }, [isCameraOn, isMicOn, participants, role]);

  const toggleHand = useCallback(() => setHandRaised(v => !v), []);
  const toggleParticipants = useCallback(() => setShowParticipants(v => !v), []);
  const toggleChat = useCallback(() => setShowChat(v => !v), []);
  const toggleScreenShare = useCallback(() => console.log('Screen share toggled'), []);

  const sendMessage = useCallback((content: string) => {
    const currentUser = mockParticipants.find(p => p.role === role);
    if (!currentUser) return;
    
    socketService.sendMessage({
      caseId,
      senderName: currentUser.name,
      senderRole: role,
      content,
      timestamp: new Date(),
    });
  }, [role]);

  const muteParticipant = useCallback((id: string) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, isMuted: !p.isMuted } : p));
  }, []);

  const removeParticipant = useCallback((id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  }, []);

  const grantSpeaking = useCallback((id: string) => {
    setParticipants(prev => prev.map(p => ({ ...p, isSpeaking: p.id === id })));
  }, []);

  const presentEvidence = useCallback((id: string) => {
    setEvidence(prev => prev.map(e => ({ ...e, isPresenting: e.id === id })));
  }, []);

  return (
    <CourtroomContext.Provider value={{
      caseId,
      courtStatus, elapsedSeconds, currentUserRole: role,
      participants, messages, evidence,
      isMicOn, isCameraOn, isHandRaised, showParticipants, showChat, activeRightTab,
      localStream, remoteStreams,
      setCourtStatus, toggleMic, toggleCamera, toggleHand, toggleParticipants, toggleChat,
      setActiveRightTab, sendMessage, muteParticipant, removeParticipant, grantSpeaking, presentEvidence,
      toggleScreenShare,
      localParticipantId,
      setParticipants
    }}>
      {children}
    </CourtroomContext.Provider>
  );
};
