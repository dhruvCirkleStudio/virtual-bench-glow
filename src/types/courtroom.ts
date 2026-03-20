export type Role = 'judge' | 'lawyer' | 'litigant' | 'observer';
export type CourtStatus = 'live' | 'paused' | 'closed';

export interface Participant {
  id: string;
  name: string;
  role: Role;
  isMuted: boolean;
  isSpeaking: boolean;
  hasCamera: boolean;
  avatarColor: string;
  side?: 'prosecution' | 'defense';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  content: string;
  timestamp: Date;
  hasAttachment?: boolean;
  attachmentName?: string;
}

export interface EvidenceItem {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'document';
  uploadedBy: string;
  uploadedAt: Date;
  isPresenting: boolean;
  url?: string;
  thumbnailUrl?: string;
}

export const ROLE_COLORS: Record<Role, string> = {
  judge: '#d4a542',
  lawyer: '#4a7fd4',
  litigant: '#c4c9d4',
  observer: '#777d88',
};

export const ROLE_LABELS: Record<Role, string> = {
  judge: 'Judge',
  lawyer: 'Lawyer',
  litigant: 'Litigant',
  observer: 'Observer',
};
