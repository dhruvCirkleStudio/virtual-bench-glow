import { useState } from "react";
import { useCourtroomContext } from "@/context/CourtroomContext";
import {
  Play,
  Pause,
  Square,
  MicOff,
  Shield,
  Activity,
  ChevronRight,
  Settings2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const JudgeControlPanel = () => {
  const {
    currentUserRole,
    courtStatus,
    setCourtStatus,
    participants,
    muteParticipant,
  } = useCourtroomContext();
  const [isOpen, setIsOpen] = useState(true);

  if (currentUserRole !== "judge") return null;

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="toggle-open"
            initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="p-3.5 rounded-2xl bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all glow-gold flex items-center justify-center"
          >
            <Settings2 className="w-5 h-5" />
          </motion.button>
        ) : (
          <motion.div
            key="panel"
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="w-64 glass-panel-strong rounded-2xl border border-border/50 shadow-2xl overflow-hidden backdrop-blur-xl origin-top-right"
          >
            <div className="px-5 py-4 border-b border-border/40 bg-gradient-to-r from-primary/10 to-transparent flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-foreground tracking-tight">
                    Judge Controls
                  </h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Session Management
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="space-y-2">
                {courtStatus !== "live" ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCourtStatus("live")}
                    className="w-full group relative overflow-hidden flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 text-green-600 dark:text-green-400 font-semibold transition-all hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                  >
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 fill-current" />
                      <span className="text-sm">Start Hearing</span>
                    </div>
                    <Activity className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCourtStatus("paused")}
                    className="w-full group relative overflow-hidden flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold transition-all hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  >
                    <div className="flex items-center gap-2">
                      <Pause className="w-4 h-4 fill-current" />
                      <span className="text-sm">Pause Hearing</span>
                    </div>
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCourtStatus("closed")}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive font-semibold transition-all hover:bg-destructive text-sm hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <Square className="w-4 h-4 fill-current" />
                    <span>End Session</span>
                  </div>
                </motion.button>
              </div>

              <div className="h-px bg-border/40 w-full my-4" />

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  Participant Actions
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    participants.forEach(
                      (p) => p.role !== "judge" && muteParticipant(p.id),
                    )
                  }
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-muted/40 border border-border/50 text-foreground hover:bg-muted/80 text-sm font-medium transition-all"
                >
                  <div className="flex items-center gap-2">
                    <MicOff className="w-4 h-4 text-muted-foreground" />
                    <span>Mute All</span>
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JudgeControlPanel;
