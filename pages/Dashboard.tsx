import { useMemo, useState } from "react";
import { useUsageSessions, useGenerateSession, useCreateSession } from "../hooks/use-usage";
import { UsageChart } from "../components/UsageChart";
import { SessionList } from "../components/SessionList";
import { StatCard } from "../components/StatCard";
import { Button } from "../components/ui/button";
import { Clock, Tv, AlertCircle, RefreshCw, BarChart3, Film, Plus, Calendar as CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { format } from "date-fns";
import { cn } from "../lib/utils";

export default function Dashboard() {
  const { data: sessions = [], isLoading, isError } = useUsageSessions();
  const generateSession = useGenerateSession();
  const createSession = useCreateSession();
  const [isOpen, setIsOpen] = useState(false);
  
  // Form state
  const [showName, setShowName] = useState("");
  const [duration, setDuration] = useState("");
  const [date, setDate] = useState<Date>(new Date());

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showName || !duration) return;
    
    await createSession.mutateAsync({
      showName,
      durationMinutes: parseInt(duration),
      watchedAt: date,
    });
    
    setIsOpen(false);
    setShowName("");
    setDuration("");
    setDate(new Date());
  };

  // Calculate stats
  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const overLimitSessions = sessions.filter(s => s.durationMinutes > 180).length;
  const avgDuration = sessions.length ? Math.round(totalMinutes / sessions.length) : 0;

  const wittySubline = useMemo(() => {
    const lines = [
      "Ready to start your journey to a life outside of Netflix?",
      "We've reached critical mass. Please, step away from the screen.",
      "Your watch history is starting to look like a full-time job.",
      "A few slip-ups, but hey, at least you're not in the Upside Down.",
      "You've watched enough content to justify a PhD in Binge Studies.",
      "Impressive. You're actually seeing the sun today. Keep it up!",
      "Are you still watching? Because your couch misses you.",
      "The 'Skip Intro' button is your only cardio today.",
      "Your algorithm is confused. Maybe watch a documentary?",
      "Binge-watching is a marathon, not a sprint. Pace yourself.",
      "One more episode' is the biggest lie we tell ourselves.",
      "Your TV remote is basically an extension of your hand now."
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  }, []); // Empty dependency array means it changes only on refresh/remount

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-destructive">
        Error loading dashboard data.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-primary font-medium tracking-wide uppercase text-sm"
              >
                <Film className="w-4 h-4" />
                <span>Screen Time Analytics</span>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight"
              >
                Netflix Usage Tracker
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-primary font-medium italic mb-2"
              >
                "{wittySubline}"
              </motion.p>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground max-w-lg text-lg"
              >
                Monitor your digital wellbeing. Get notified when binge-watching goes too far.
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-4"
            >
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/25 rounded-full px-8 h-14 text-base transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Log Session
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Log Viewing Session</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Choose to auto-generate a session or enter details manually.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-6 py-4">
                    <div className="space-y-4">
                      <Button 
                        variant="secondary" 
                        className="w-full h-12 text-base font-semibold"
                        onClick={() => {
                          generateSession.mutate();
                          setIsOpen(false);
                        }}
                        disabled={generateSession.isPending}
                      >
                        {generateSession.isPending ? (
                          <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                          <Tv className="mr-2 h-5 w-5" />
                        )}
                        Auto-Generate with AI
                      </Button>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">Or Manual Entry</span>
                        </div>
                      </div>

                      <form onSubmit={handleManualSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="showName">Show Name</Label>
                          <Input 
                            id="showName" 
                            placeholder="e.g. Stranger Things" 
                            value={showName}
                            onChange={(e) => setShowName(e.target.value)}
                            className="bg-background border-border"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="duration">Duration (minutes)</Label>
                          <Input 
                            id="duration" 
                            type="number" 
                            placeholder="e.g. 45" 
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="bg-background border-border"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Date Watched</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal bg-background border-border",
                                  !date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => d && setDate(d)}
                                initialFocus
                                className="bg-card text-foreground"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full h-12 text-base font-semibold mt-4"
                          disabled={createSession.isPending}
                        >
                          {createSession.isPending ? (
                            <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                          ) : (
                            <Plus className="mr-2 h-5 w-5" />
                          )}
                          Save Session
                        </Button>
                      </form>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard
            title="Total Watch Time"
            value={`${totalHours}h ${totalMinutes % 60}m`}
            icon={<Clock size={40} />}
            delay={0.4}
            className="bg-card shadow-2xl"
          />
          <StatCard
            title="Avg. Session"
            value={`${Math.floor(avgDuration / 60)}h ${avgDuration % 60}m`}
            icon={<BarChart3 size={40} />}
            delay={0.5}
            className="bg-card shadow-2xl"
          />
          <StatCard
            title="Limit Breaches"
            value={overLimitSessions}
            icon={<AlertCircle size={40} />}
            trend={overLimitSessions > 0 ? "Needs Improvement" : "Good"}
            trendUp={overLimitSessions > 0}
            delay={0.6}
            className="bg-card shadow-2xl"
          />
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-foreground">Usage Trends</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                 <span className="w-3 h-3 rounded-full bg-primary" /> Over 3h
                 <span className="w-3 h-3 rounded-full bg-white/20 ml-2" /> Normal
              </div>
            </div>
            
            {isLoading ? (
              <div className="h-[400px] w-full bg-card/50 rounded-2xl animate-pulse" />
            ) : (
              <UsageChart sessions={sessions} />
            )}
          </div>

          {/* Recent History */}
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-foreground">Recent History</h2>
            {isLoading ? (
               <div className="space-y-4">
                 {[1,2,3].map(i => <div key={i} className="h-20 bg-card/50 rounded-xl animate-pulse" />)}
               </div>
            ) : (
              <SessionList sessions={sessions} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
