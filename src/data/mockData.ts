import { Participant, ChatMessage, EvidenceItem } from '@/types/courtroom';

export const mockParticipants: Participant[] = [
  { id: '1', name: 'Hon. Justice Sharma', role: 'judge', isMuted: false, isSpeaking: true, hasCamera: true, avatarColor: '#d4a542' },
  { id: '2', name: 'Adv. Priya Mehta', role: 'lawyer', isMuted: false, isSpeaking: false, hasCamera: true, avatarColor: '#4a7fd4', side: 'prosecution' },
  { id: '3', name: 'Adv. Raj Kumar', role: 'lawyer', isMuted: false, isSpeaking: false, hasCamera: true, avatarColor: '#4a7fd4', side: 'defense' },
  { id: '4', name: 'Amit Patel', role: 'litigant', isMuted: true, isSpeaking: false, hasCamera: false, avatarColor: '#c4c9d4', side: 'prosecution' },
  { id: '5', name: 'Sunita Verma', role: 'litigant', isMuted: true, isSpeaking: false, hasCamera: false, avatarColor: '#c4c9d4', side: 'defense' },
  { id: '6', name: 'Press Reporter', role: 'observer', isMuted: true, isSpeaking: false, hasCamera: false, avatarColor: '#777d88' },
  { id: '7', name: 'Law Student', role: 'observer', isMuted: true, isSpeaking: false, hasCamera: false, avatarColor: '#777d88' },
];

export const mockMessages: ChatMessage[] = [
  { id: '1', senderId: '1', senderName: 'Hon. Justice Sharma', senderRole: 'judge', content: 'The court is now in session. Case #LB-2026-4521.', timestamp: new Date(Date.now() - 300000) },
  { id: '2', senderId: '2', senderName: 'Adv. Priya Mehta', senderRole: 'lawyer', content: 'Your Honor, I would like to present Exhibit A.', timestamp: new Date(Date.now() - 240000) },
  { id: '3', senderId: '3', senderName: 'Adv. Raj Kumar', senderRole: 'lawyer', content: 'I object to the admissibility of this document.', timestamp: new Date(Date.now() - 180000) },
  { id: '4', senderId: '1', senderName: 'Hon. Justice Sharma', senderRole: 'judge', content: 'Objection overruled. Please proceed.', timestamp: new Date(Date.now() - 120000) },
];

export const mockEvidence: EvidenceItem[] = [
  { id: '1', name: 'Contract_Agreement_2025.pdf', type: 'pdf', uploadedBy: 'Adv. Priya Mehta', uploadedAt: new Date(Date.now() - 600000), isPresenting: true },
  { id: '2', name: 'Property_Photo_01.jpg', type: 'image', uploadedBy: 'Adv. Priya Mehta', uploadedAt: new Date(Date.now() - 500000), isPresenting: false },
  { id: '3', name: 'Witness_Statement.pdf', type: 'pdf', uploadedBy: 'Adv. Raj Kumar', uploadedAt: new Date(Date.now() - 400000), isPresenting: false },
];
