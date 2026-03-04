import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  delay?: number;
}

export function StatCard({ title, value, icon, trend, trendUp, className, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay }}
      className={cn(
        "bg-card border border-border rounded-2xl p-6 relative overflow-hidden group",
        "hover:border-primary/20 transition-colors duration-300",
        className
      )}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-primary">
        {icon}
      </div>
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-bold font-display text-foreground tracking-tight">
            {value}
          </h3>
        </div>
        
        {trend && (
          <div className="mt-4 flex items-center gap-2">
            <span className={cn(
              "text-xs font-bold px-2 py-0.5 rounded-full",
              trendUp ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"
            )}>
              {trend}
            </span>
            <span className="text-xs text-muted-foreground">vs last week</span>
          </div>
        )}
      </div>
      
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}
