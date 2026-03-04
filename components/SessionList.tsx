import { format } from "date-fns";
import type { UsageSession } from "../shared/schema.ts"; // Changed @shared to ../shared
import { Trash2, Clock, AlertTriangle } from "lucide-react";
import { Button } from "./button.tsx"; // Changed @/components/ui/ to ./ (same folder)
import { useDeleteSession } from "../hooks/use-usage.ts"; // Changed @/hooks/ to ../hooks/
import { motion, AnimatePresence } from "framer-motion";

interface SessionListProps {
  sessions: UsageSession[];
}

export function SessionList({ sessions }: SessionListProps) {
  const deleteSession = useDeleteSession();

  // Sort by newest first
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
  );

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-card/30 rounded-2xl border border-dashed border-border">
        <p>No viewing history yet. Generate some data!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {sortedSessions.map((session) => (
          <motion.div
            key={session.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className={`
              relative group flex items-center justify-between p-4 rounded-xl border
              ${session.durationMinutes > 180 
                ? 'bg-destructive/5 border-destructive/20 hover:bg-destructive/10' 
                : 'bg-card border-border hover:border-primary/20 hover:bg-card/80'}
              transition-all duration-200
            `}
          >
            <div className="flex items-start gap-4">
              <div className={`
                p-2.5 rounded-lg shrink-0
                ${session.durationMinutes > 180 ? 'bg-destructive/20 text-destructive' : 'bg-primary/10 text-primary'}
              `}>
                {session.durationMinutes > 180 ? <AlertTriangle size={20} /> : <Clock size={20} />}
              </div>
              <div>
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  {session.showName}
                  {session.durationMinutes > 180 && (
                    <span className="text-[10px] uppercase font-bold bg-destructive text-white px-1.5 py-0.5 rounded tracking-wide">
                      Over Limit
                    </span>
                  )}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span>{format(new Date(session.watchedAt), "MMM d, yyyy • h:mm a")}</span>
                  <span className="w-1 h-1 rounded-full bg-black/10" />
                  <span className={session.durationMinutes > 180 ? "text-destructive font-medium" : ""}>
                    {Math.floor(session.durationMinutes / 60)}h {session.durationMinutes % 60}m
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              onClick={() => deleteSession.mutate(session.id)}
              disabled={deleteSession.isPending}
            >
              <Trash2 size={18} />
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
