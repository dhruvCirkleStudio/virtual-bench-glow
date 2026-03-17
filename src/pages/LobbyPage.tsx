import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Role, ROLE_LABELS } from "@/types/courtroom";
import { Scale, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { ModeToggle } from "@/components/mode-toggle";

const roles: Role[] = ["judge", "lawyer", "litigant", "observer"];

const roleDescriptions: Record<Role, string> = {
  judge: "Full court controls, manage hearing flow",
  lawyer: "Present evidence, examine witnesses",
  litigant: "Participate as a party in the case",
  observer: "View-only access to proceedings",
};

const LobbyPage = () => {
  const [selectedRole, setSelectedRole] = useState<Role>("judge");
  const [selectedSide, setSelectedSide] = useState<"prosecution" | "defense">("prosecution");
  const [userName, setUserName] = useState("");
  const [caseId, setCaseId] = useState("LB-2026-4521");
  const navigate = useNavigate();

  const handleEnter = () => {
    const finalName = userName || (selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) + " " + Math.floor(Math.random() * 100));
    navigate(`/courtroom?role=${selectedRole}&caseId=${caseId}&side=${selectedSide}&userName=${encodeURIComponent(finalName)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute top-6 right-6">
        <ModeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Scale className="w-8 h-8 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground">
              LawBlocks
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Virtual Courtroom Platform
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel-strong rounded-2xl p-6 space-y-6">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Your Name
            </label>
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-muted/40 rounded-xl px-4 py-3 text-foreground font-semibold text-sm border border-border/50 focus:border-primary/50 outline-none transition-colors"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Case ID
            </label>
            <input
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              className="w-full bg-muted/40 rounded-xl px-4 py-3 text-foreground font-mono text-sm border border-border/50 focus:border-primary/50 outline-none transition-colors"
              placeholder="Enter Case ID"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`flex flex-col items-start p-3 rounded-xl border transition-all text-left ${
                    selectedRole === role
                      ? "border-primary/50 bg-primary/10 glow-gold"
                      : "border-border/40 bg-muted/20 hover:bg-muted/40"
                  }`}
                >
                  <span
                    className={`text-sm font-semibold ${selectedRole === role ? "text-primary" : "text-foreground"}`}
                  >
                    {ROLE_LABELS[role]}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    {roleDescriptions[role]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {(selectedRole === "lawyer" || selectedRole === "litigant") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3"
            >
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Select Side
              </label>
              <div className="flex gap-2">
                {["prosecution", "defense"].map((side) => (
                  <button
                    key={side}
                    onClick={() => setSelectedSide(side as any)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-sm font-semibold transition-all ${
                      selectedSide === side
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border/40 bg-muted/20 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    {side.charAt(0).toUpperCase() + side.slice(1)}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <button
            onClick={handleEnter}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity glow-gold"
          >
            Enter Courtroom <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-6">
          Powered by LawBlocks • Web3 Legal Technology
        </p>
      </motion.div>
    </div>
  );
};

export default LobbyPage;
