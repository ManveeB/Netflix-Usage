import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { format, startOfDay, eachDayOfInterval, subDays, isSameDay } from "date-fns";
import type { UsageSession } from "@shared/schema";
import { motion } from "framer-motion";

interface UsageChartProps {
  sessions: UsageSession[];
}

export function UsageChart({ sessions }: UsageChartProps) {
  const data = useMemo(() => {
    // Generate last 7 days
    const today = new Date();
    const last7Days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    });

    return last7Days.map(day => {
      const daySessions = sessions.filter(s => isSameDay(new Date(s.watchedAt), day));
      const totalMinutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
      
      return {
        date: format(day, "EEE"),
        fullDate: format(day, "MMMM d, yyyy"),
        minutes: totalMinutes,
        isOverLimit: totalMinutes > 180,
        sessionsCount: daySessions.length
      };
    });
  }, [sessions]);

  if (sessions.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-2xl">
        No data available yet
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border p-3 rounded-xl shadow-xl">
          <p className="font-semibold text-foreground mb-1">{data.fullDate}</p>
          <p className="text-sm font-medium">
            Total Time: <span className="text-primary">{Math.floor(data.minutes / 60)}h {data.minutes % 60}m</span>
          </p>
          <p className="text-xs text-muted-foreground">Sessions: {data.sessionsCount}</p>
          {data.isOverLimit && (
             <p className="text-xs text-destructive font-bold mt-1">⚠️ Daily Limit Exceeded</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="h-[400px] w-full bg-card/50 rounded-2xl p-4 border border-border"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="rgba(0,0,0,0.4)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="rgba(0,0,0,0.4)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `${Math.floor(value / 60)}h`}
          />
          <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} content={<CustomTooltip />} />
          <ReferenceLine y={180} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label={{ value: 'Limit', position: 'right', fill: 'hsl(var(--destructive))', fontSize: 10 }} />
          <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.isOverLimit ? 'hsl(var(--primary))' : 'rgba(0, 0, 0, 0.1)'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
