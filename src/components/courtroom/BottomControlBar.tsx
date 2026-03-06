import { useCourtroomContext } from '@/context/CourtroomContext';
import { Mic, MicOff, Camera, CameraOff, Hand, MonitorUp, MessageSquare, Users, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const ControlButton = ({
  icon: Icon, label, active, danger, onClick
}: {
  icon: React.ElementType; label: string; active?: boolean; danger?: boolean; onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`group relative flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all ${
      danger ? 'text-destructive hover:bg-destructive/20' :
      active ? 'text-primary bg-primary/10 glow-gold' :
      'text-muted-foreground hover:text-foreground hover:bg-muted/60'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-4">
      {label}
    </span>
  </button>
);

const BottomControlBar = () => {
  const {
    isMicOn, isCameraOn, isHandRaised,
    toggleMic, toggleCamera, toggleHand, toggleParticipants, toggleChat,
  } = useCourtroomContext();

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="flex items-center gap-1 px-4 py-2 glass-panel-strong rounded-2xl">
        <ControlButton icon={isMicOn ? Mic : MicOff} label="Mic" active={isMicOn} onClick={toggleMic} />
        <ControlButton icon={isCameraOn ? Camera : CameraOff} label="Camera" active={isCameraOn} onClick={toggleCamera} />
        <div className="w-px h-8 bg-border/40 mx-1" />
        <ControlButton icon={Hand} label="Raise Hand" active={isHandRaised} onClick={toggleHand} />
        <ControlButton icon={MonitorUp} label="Share" onClick={() => {}} />
        <div className="w-px h-8 bg-border/40 mx-1" />
        <ControlButton icon={MessageSquare} label="Chat" onClick={toggleChat} />
        <ControlButton icon={Users} label="People" onClick={toggleParticipants} />
        <ControlButton icon={Settings} label="Settings" onClick={() => {}} />
      </div>
    </motion.div>
  );
};

export default BottomControlBar;
