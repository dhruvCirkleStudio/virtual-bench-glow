import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL);
      console.log('Connecting to socket server at:', SOCKET_URL);
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  joinRoom(caseId: string, participantId: string, userName: string, role: string, side?: string, hasCamera?: boolean, hasMic?: boolean) {
    if (this.socket) {
      this.socket.emit('join_room', { caseId, participantId, userName, role, side, hasCamera, hasMic });
    }
  }

  sendMessage(messageData: {
    caseId: string;
    senderName: string;
    senderRole: string;
    content: string;
    timestamp: Date;
  }) {
    if (this.socket) {
      this.socket.emit('send_message', messageData);
    }
  }

  onMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('receive_message', callback);
    }
  }

  onMessageHistory(callback: (history: any[]) => void) {
    if (this.socket) {
      this.socket.on('message_history', callback);
    }
  }

  onParticipantJoined(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('participant_joined', callback);
    }
  }
}

const socketService = new SocketService();
export default socketService;
