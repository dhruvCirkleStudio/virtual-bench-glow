import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Participant, ChatMessage, EvidenceItem, CourtStatus, Role } from '@/types/courtroom';
import { mockParticipants, mockMessages, mockEvidence } from '@/data/mockData';

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
}

const CourtroomContext = createContext<(CourtroomState & CourtroomActions) | null>(null);

export const useCourtroomContext = () => {
  const ctx = useContext(CourtroomContext);
  if (!ctx) throw new Error('useCourtroomContext must be used within CourtroomProvider');
  return ctx;
};

export const CourtroomProvider: React.FC<{ role: Role; children: React.ReactNode }> = ({ role, children }) => {
  const [courtStatus, setCourtStatus] = useState<CourtStatus>('live');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [evidence, setEvidence] = useState<EvidenceItem[]>(mockEvidence);
  const [isMicOn, setMicOn] = useState(true);
  const [isCameraOn, setCameraOn] = useState(true);
  const [isHandRaised, setHandRaised] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [activeRightTab, setActiveRightTab] = useState<'evidence' | 'chat'>('chat');

  useEffect(() => {
    if (courtStatus !== 'live') return;
    const interval = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [courtStatus]);

  const toggleMic = useCallback(() => setMicOn(v => !v), []);
  const toggleCamera = useCallback(() => setCameraOn(v => !v), []);
  const toggleHand = useCallback(() => setHandRaised(v => !v), []);
  const toggleParticipants = useCallback(() => setShowParticipants(v => !v), []);
  const toggleChat = useCallback(() => setShowChat(v => !v), []);

  const sendMessage = useCallback((content: string) => {
    const currentUser = participants.find(p => {
      if (role === 'judge') return p.role === 'judge';
      return p.role === role;
    });
    if (!currentUser) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      content,
      timestamp: new Date(),
    }]);
  }, [participants, role]);

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
      caseId: 'LB-2026-4521',
      courtStatus, elapsedSeconds, currentUserRole: role,
      participants, messages, evidence,
      isMicOn, isCameraOn, isHandRaised, showParticipants, showChat, activeRightTab,
      setCourtStatus, toggleMic, toggleCamera, toggleHand, toggleParticipants, toggleChat,
      setActiveRightTab, sendMessage, muteParticipant, removeParticipant, grantSpeaking, presentEvidence,
    }}>
      {children}
    </CourtroomContext.Provider>
  );
};
