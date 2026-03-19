import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3001;

// Store active participants and their socket IDs
const participants = {}; // { socketId: { caseId, participantId, userName } }
const chatRooms = {}; // { caseId: [messages] }

const ROLE_LIMITS = {
  judge: 1,
  lawyer: 2,
  litigant: 2,
  observer: 9,
};

const ROLE_COLORS = {
  judge: "#d4a542",
  lawyer: "#4a7fd4",
  litigant: "#c4c9d4",
  observer: "#777d88",
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on(
    "join_room",
    ({ caseId, participantId, userName, role, side, hasCamera, hasMic }) => {
      // Check if participantId is already in use in this room
      console.log("client joined");
      const isIdTaken = Object.values(participants).some(
        (p) => p.caseId === caseId && p.participantId === participantId,
      );

      if (isIdTaken) {
        console.log(
          `Join rejected: Participant ID ${participantId} already taken in room ${caseId}`,
        );
        socket.emit("join_error", {
          message: "Participant ID already in use in this room.",
        });
        return;
      }

      // Check role limits
      const currentRoleCount = Object.values(participants).filter(
        (p) => p.caseId === caseId && p.role === role,
      ).length;

      const limit = ROLE_LIMITS[role] || 0;
      if (currentRoleCount >= limit) {
        console.log(
          `Join rejected: Limit reached for role ${role} in room ${caseId}`,
        );
        socket.emit("join_error", {
          message: `Limit reached for ${role}s in this courtroom.`,
        });
        return;
      }

      const avatarColor = ROLE_COLORS[role] || ROLE_COLORS.observer;

      socket.join(caseId);
      participants[socket.id] = {
        caseId,
        participantId,
        userName,
        role,
        side,
        hasCamera: hasCamera || false,
        hasMic: hasMic || false,
        avatarColor,
      };

      console.log(
        `User ${userName} (${participantId}) joined room ${caseId} as ${role}`,
      );

      // Send message history if it exists
      if (chatRooms[caseId]) {
        socket.emit("message_history", chatRooms[caseId]);
      } else {
        chatRooms[caseId] = [];
      }

      // Notify others in the room about the new participant
      socket.to(caseId).emit("participant_joined", {
        participantId,
        userName,
        role,
        side,
        hasCamera: hasCamera || false,
        hasMic: hasMic || false,
        socketId: socket.id,
        avatarColor,
      });

      // Send back current participants in the room to the new user
      const roomParticipants = Object.entries(participants)
        .filter(([id, data]) => data.caseId === caseId && id !== socket.id)
        .map(([id, data]) => ({ ...data, socketId: id }));

      socket.emit("room_participants", roomParticipants);
    },
  );

  socket.on("webrtc_signal", ({ targetSocketId, signalData }) => {
    const sender = participants[socket.id];
    if (sender) {
      io.to(targetSocketId).emit("webrtc_signal", {
        senderSocketId: socket.id,
        senderParticipantId: sender.participantId,
        signalData,
      });
    }
  });

  socket.on("camera_toggle", ({ caseId, participantId, hasCamera }) => {
    if (participants[socket.id]) {
      participants[socket.id].hasCamera = hasCamera;
    }
    socket
      .to(caseId)
      .emit("camera_status_changed", { participantId, hasCamera });
  });

  socket.on("mic_toggle", ({ caseId, participantId, hasMic }) => {
    if (participants[socket.id]) {
      participants[socket.id].hasMic = hasMic;
    }
    socket
      .to(caseId)
      .emit("mic_status_changed", { participantId, hasMic });
  });

  socket.on("send_message", (data) => {
    const { caseId, senderName, senderRole, content, timestamp } = data;
    const newMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderName,
      senderRole,
      content,
      timestamp,
    };

    if (!chatRooms[caseId]) {
      chatRooms[caseId] = [];
    }
    chatRooms[caseId].push(newMessage);

    // Broadcast to everyone in the room (including sender)
    io.to(caseId).emit("receive_message", newMessage);
    console.log(`Message in ${caseId} from ${senderName}: ${content}`);
  });

  socket.on("disconnect", () => {
    const p = participants[socket.id];
    if (p) {
      console.log(`User ${p.userName} (${p.participantId}) disconnected`);
      socket.to(p.caseId).emit("participant_left", {
        participantId: p.participantId,
        socketId: socket.id,
      });
      delete participants[socket.id];
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on http://localhost:${PORT}`);
});
