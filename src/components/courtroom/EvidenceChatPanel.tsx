import { useState } from 'react';
import { useCourtroomContext } from '@/context/CourtroomContext';
import { ROLE_COLORS } from '@/types/courtroom';
import { ChevronRight, ChevronLeft, FileText, Image, Upload, Monitor, Send, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const EvidenceTab = () => {
  const { evidence, presentEvidence, currentUserRole } = useCourtroomContext();
  const canUpload = currentUserRole === 'lawyer' || currentUserRole === 'judge';

  return (
    <div className="flex flex-col h-full">
      {canUpload && (
        <div className="p-3 border-b border-border/30 grid grid-cols-2 gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted/80 text-xs font-medium text-foreground transition-colors">
            <Upload className="w-3.5 h-3.5" /> Upload
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted/80 text-xs font-medium text-foreground transition-colors">
            <Monitor className="w-3.5 h-3.5" /> Screen
          </button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {evidence.map(item => (
          <div key={item.id}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
              item.isPresenting ? 'bg-primary/10 glow-border-gold border' : 'hover:bg-muted/40'
            }`}
            onClick={() => presentEvidence(item.id)}
          >
            {item.type === 'image' ? (
              <Image className="w-4 h-4 text-primary" />
            ) : (
              <FileText className="w-4 h-4 text-deep-blue" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{item.name}</p>
              <p className="text-[10px] text-muted-foreground">{item.uploadedBy}</p>
            </div>
            {item.isPresenting && (
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Live</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ChatTab = () => {
  const { messages, sendMessage } = useCourtroomContext();
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-semibold" style={{ color: ROLE_COLORS[msg.senderRole] }}>
                {msg.senderName}
              </span>
              <span className="text-[10px] text-muted-foreground">{formatTime(msg.timestamp)}</span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">{msg.content}</p>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-border/30">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-muted/60 text-muted-foreground transition-colors">
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-muted/40 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border/30 focus:border-primary/40 transition-colors"
          />
          <button onClick={handleSend}
            className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const EvidenceChatPanel = () => {
  const { showChat, toggleChat, activeRightTab, setActiveRightTab } = useCourtroomContext();

  return (
    <>
      <AnimatePresence>
        {showChat && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 top-14 bottom-20 z-40 glass-panel border-l border-border/30 overflow-hidden"
          >
            <div className="w-[320px] h-full flex flex-col">
              {/* Tab headers */}
              <div className="flex border-b border-border/30">
                <button
                  onClick={() => setActiveRightTab('evidence')}
                  className={`flex-1 px-4 py-3 text-xs font-semibold tracking-wider uppercase transition-colors ${
                    activeRightTab === 'evidence'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Evidence
                </button>
                <button
                  onClick={() => setActiveRightTab('chat')}
                  className={`flex-1 px-4 py-3 text-xs font-semibold tracking-wider uppercase transition-colors ${
                    activeRightTab === 'chat'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Chat
                </button>
                <button onClick={toggleChat}
                  className="p-3 text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                {activeRightTab === 'evidence' ? <EvidenceTab /> : <ChatTab />}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {!showChat && (
        <button
          onClick={toggleChat}
          className="fixed right-2 top-1/2 -translate-y-1/2 z-40 p-2 glass-panel rounded-lg hover:bg-muted/60 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
    </>
  );
};

export default EvidenceChatPanel;
