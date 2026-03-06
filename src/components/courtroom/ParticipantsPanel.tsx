import { useCourtroomContext } from '@/context/CourtroomContext';
import { ROLE_COLORS, ROLE_LABELS, type Participant } from '@/types/courtroom';
import { ChevronLeft, ChevronRight, Mic, MicOff, UserMinus, Hand } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ParticipantRow = ({ participant }: { participant: Participant }) => {
  const { currentUserRole, muteParticipant, removeParticipant, grantSpeaking } = useCourtroomContext();
  const isAdmin = currentUserRole === 'judge';
  const roleColor = ROLE_COLORS[participant.role];

  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
      participant.isSpeaking ? 'bg-muted/80 glow-border-gold border' : 'hover:bg-muted/40'
    }`}>
      {/* Avatar */}
      <div className="relative">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
          style={{ backgroundColor: roleColor + '22', color: roleColor }}
        >
          {participant.name.charAt(0)}
        </div>
        {participant.isSpeaking && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{participant.name}</p>
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: roleColor }}>
          {ROLE_LABELS[participant.role]}
        </span>
      </div>

      {/* Status */}
      <div className="flex items-center gap-1">
        {participant.isMuted && <MicOff className="w-3.5 h-3.5 text-destructive/70" />}
      </div>

      {/* Admin controls */}
      {isAdmin && participant.role !== 'judge' && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => muteParticipant(participant.id)}
            className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors">
            {participant.isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => grantSpeaking(participant.id)}
            className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-primary transition-colors">
            <Hand className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => removeParticipant(participant.id)}
            className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
            <UserMinus className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

const ParticipantsPanel = () => {
  const { showParticipants, toggleParticipants, participants } = useCourtroomContext();

  return (
    <>
      <AnimatePresence>
        {showParticipants && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed left-0 top-14 bottom-20 z-40 glass-panel border-r border-border/30 overflow-hidden"
          >
            <div className="w-[280px] h-full flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
                <h3 className="font-display font-semibold text-sm text-foreground">
                  Participants <span className="text-muted-foreground ml-1">({participants.length})</span>
                </h3>
                <button onClick={toggleParticipants}
                  className="p-1 rounded hover:bg-muted/60 text-muted-foreground transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                {participants.map(p => (
                  <div key={p.id} className="group">
                    <ParticipantRow participant={p} />
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {!showParticipants && (
        <button
          onClick={toggleParticipants}
          className="fixed left-2 top-1/2 -translate-y-1/2 z-40 p-2 glass-panel rounded-lg hover:bg-muted/60 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
    </>
  );
};

export default ParticipantsPanel;
