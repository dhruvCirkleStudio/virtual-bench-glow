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
}

export const ROLE_COLORS: Record<Role, string> = {
  judge: 'hsl(43, 80%, 55%)',
  lawyer: 'hsl(220, 60%, 55%)',
  litigant: 'hsl(210, 20%, 85%)',
  observer: 'hsl(215, 15%, 55%)',
};

export const ROLE_LABELS: Record<Role, string> = {
  judge: 'Judge',
  lawyer: 'Lawyer',
  litigant: 'Litigant',
  observer: 'Observer',
};
