import { useCourtroomContext } from '@/context/CourtroomContext';
import { Play, Pause, Square, MicOff, Hand } from 'lucide-react';
import { motion } from 'framer-motion';

const JudgeControlPanel = () => {
  const { currentUserRole, courtStatus, setCourtStatus, participants, muteParticipant, grantSpeaking } = useCourtroomContext();
  if (currentUserRole !== 'judge') return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-20 right-4 z-50 w-56 glass-panel-strong rounded-xl border glow-border-gold overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-border/30 bg-primary/5">
        <h3 className="font-display font-semibold text-sm text-primary">Court Controls</h3>
      </div>
      <div className="p-3 space-y-2">
        {courtStatus !== 'live' && (
          <button onClick={() => setCourtStatus('live')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 text-sm font-medium transition-colors">
            <Play className="w-4 h-4" /> Start Hearing
          </button>
        )}
        {courtStatus === 'live' && (
          <button onClick={() => setCourtStatus('paused')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium transition-colors">
            <Pause className="w-4 h-4" /> Pause Hearing
          </button>
        )}
        <button onClick={() => setCourtStatus('closed')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 text-sm font-medium transition-colors">
          <Square className="w-4 h-4" /> End Session
        </button>
        <div className="h-px bg-border/30 my-1" />
        <button onClick={() => participants.forEach(p => p.role !== 'judge' && muteParticipant(p.id))}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-foreground hover:bg-muted/80 text-sm font-medium transition-colors">
          <MicOff className="w-4 h-4" /> Mute All
        </button>
      </div>
    </motion.div>
  );
};

export default JudgeControlPanel;
