import { useCourtroomContext } from '@/context/CourtroomContext';
import { LogOut, Signal, SignalHigh, SignalLow, SignalMedium } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const statusConfig = {
  live: { label: 'LIVE', dotClass: 'bg-green-500 animate-pulse-glow' },
  paused: { label: 'PAUSED', dotClass: 'bg-primary' },
  closed: { label: 'CLOSED', dotClass: 'bg-destructive' },
};

const TopBar = () => {
  const { caseId, courtStatus, elapsedSeconds } = useCourtroomContext();
  const navigate = useNavigate();
  const status = statusConfig[courtStatus];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel-strong border-b border-border/30"
      style={{ boxShadow: '0 1px 20px hsla(43, 80%, 55%, 0.05)' }}>
      <div className="flex items-center justify-between px-6 h-14">
        {/* Left: Brand + Case */}
        <div className="flex items-center gap-4">
          <span className="font-display font-bold text-primary text-lg tracking-tight">LawBlocks</span>
          <div className="h-5 w-px bg-border/50" />
          <span className="text-sm text-muted-foreground font-mono">Case {caseId}</span>
        </div>

        {/* Center: Timer + Status */}
        <div className="flex items-center gap-6">
          <div className="font-mono text-lg text-foreground tracking-widest">{formatTime(elapsedSeconds)}</div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/50">
            <span className={`w-2 h-2 rounded-full ${status.dotClass}`} />
            <span className="text-xs font-semibold tracking-wider text-foreground">{status.label}</span>
          </div>
        </div>

        {/* Right: Network + Exit */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <SignalHigh className="w-4 h-4 text-green-500" />
            <span className="text-xs">Strong</span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Exit
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
