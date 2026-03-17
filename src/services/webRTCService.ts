import socketService from './socketService';

class WebRTCService {
  private peerConnections: Record<string, RTCPeerConnection> = {};
  private iceCandidateQueues: Record<string, RTCIceCandidate[]> = {};
  private remoteStreams: Record<string, MediaStream> = {};
  private onRemoteStreamCallbacks: ((participantId: string, stream: MediaStream) => void)[] = [];
  private onConnectionStateChangeCallbacks: ((participantId: string, state: string) => void)[] = [];

  private config: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  async createPeerConnection(participantId: string, targetSocketId: string, localStream: MediaStream | null, isOffer: boolean) {
    // If a connection already exists, don't create a new one unless specifically asked
    // or if the existing one is closed.
    if (this.peerConnections[targetSocketId]) {
      const state = this.peerConnections[targetSocketId].connectionState;
      if (state !== 'closed' && state !== 'failed') {
        console.log(`Connection to ${targetSocketId} already exists in state: ${state}`);
        return this.peerConnections[targetSocketId];
      }
      this.peerConnections[targetSocketId].close();
    }

    console.log(`Creating peer connection for ${participantId} (${targetSocketId}), isOffer: ${isOffer}`);
    const pc = new RTCPeerConnection(this.config);
    this.peerConnections[targetSocketId] = pc;

    // Add local tracks to peer connection if available
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.getSocket()?.emit('webrtc_signal', {
          targetSocketId,
          signalData: { type: 'ice_candidate', candidate: event.candidate }
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote track from:', participantId, event.track.kind);
      
      if (!this.remoteStreams[participantId]) {
        this.remoteStreams[participantId] = new MediaStream();
        this.onRemoteStreamCallbacks.forEach(cb => cb(participantId, this.remoteStreams[participantId]));
      }

      const stream = this.remoteStreams[participantId];
      // Only add track if not already present
      if (!stream.getTracks().find(t => t.id === event.track.id)) {
        stream.addTrack(event.track);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${participantId} changed to: ${pc.connectionState}`);
      this.onConnectionStateChangeCallbacks.forEach(cb => cb(participantId, pc.connectionState));
    };

    if (isOffer) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketService.getSocket()?.emit('webrtc_signal', {
          targetSocketId,
          signalData: { type: 'offer', sdp: offer }
        });
      } catch (err) {
        console.error('Error creating offer:', err);
      }
    }

    return pc;
  }

  async renegotiate(targetSocketId: string) {
    const pc = this.peerConnections[targetSocketId];
    if (pc) {
      try {
        console.log(`Renegotiating with ${targetSocketId}`);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketService.getSocket()?.emit('webrtc_signal', {
          targetSocketId,
          signalData: { type: 'offer', sdp: offer }
        });
      } catch (err) {
        console.error('Error during re-negotiation:', err);
      }
    }
  }

  async handleSignal(senderSocketId: string, senderParticipantId: string, signalData: any, localStream: MediaStream | null) {
    let pc = this.peerConnections[senderSocketId];

    if (signalData.type === 'offer') {
      // If we receive an offer, we become the answerer (isOffer = false)
      pc = await this.createPeerConnection(senderParticipantId, senderSocketId, localStream, false);
      await pc.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
      
      // Process any queued candidates
      if (this.iceCandidateQueues[senderSocketId]) {
        console.log(`Processing ${this.iceCandidateQueues[senderSocketId].length} queued ICE candidates for ${senderSocketId}`);
        for (const candidate of this.iceCandidateQueues[senderSocketId]) {
          await pc.addIceCandidate(candidate);
        }
        delete this.iceCandidateQueues[senderSocketId];
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketService.getSocket()?.emit('webrtc_signal', {
        targetSocketId: senderSocketId,
        signalData: { type: 'answer', sdp: answer }
      });
    } else if (signalData.type === 'answer') {
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
        // Process any queued candidates
        if (this.iceCandidateQueues[senderSocketId]) {
          console.log(`Processing ${this.iceCandidateQueues[senderSocketId].length} queued ICE candidates for ${senderSocketId}`);
          for (const candidate of this.iceCandidateQueues[senderSocketId]) {
            await pc.addIceCandidate(candidate);
          }
          delete this.iceCandidateQueues[senderSocketId];
        }
      }
    } else if (signalData.type === 'ice_candidate') {
      const candidate = new RTCIceCandidate(signalData.candidate);
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(candidate);
        } catch (err) {
          console.error('Error adding ice candidate:', err);
        }
      } else {
        console.log(`Queueing ICE candidate for ${senderSocketId}`);
        if (!this.iceCandidateQueues[senderSocketId]) {
          this.iceCandidateQueues[senderSocketId] = [];
        }
        this.iceCandidateQueues[senderSocketId].push(candidate);
      }
    }
  }

  addLocalTracks(stream: MediaStream) {
    Object.keys(this.peerConnections).forEach(targetSocketId => {
      const pc = this.peerConnections[targetSocketId];
      let tracksAdded = false;
      stream.getTracks().forEach(track => {
        const alreadyAdded = pc.getSenders().find(s => s.track === track);
        if (!alreadyAdded) {
          pc.addTrack(track, stream);
          tracksAdded = true;
        }
      });
      if (tracksAdded) {
        this.renegotiate(targetSocketId);
      }
    });
  }

  closeConnection(socketId: string) {
    if (this.peerConnections[socketId]) {
      this.peerConnections[socketId].close();
      delete this.peerConnections[socketId];
    }
  }

  closeAll() {
    Object.keys(this.peerConnections).forEach(id => this.closeConnection(id));
  }

  onRemoteStream(callback: (participantId: string, stream: MediaStream) => void) {
    this.onRemoteStreamCallbacks.push(callback);
  }

  onConnectionStateChange(callback: (participantId: string, state: string) => void) {
    this.onConnectionStateChangeCallbacks.push(callback);
  }
}

const webRTCService = new WebRTCService();
export default webRTCService;
