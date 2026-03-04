import { useMemo, useState } from "react";
import { useUsageSessions, useGenerateSession, useCreateSession } from "../hooks/use-usage.ts"; // Added .ts
import { UsageChart } from "../components/UsageChart.tsx"; // Added .tsx
import { SessionList } from "../components/SessionList.tsx"; // Added .tsx
import { StatCard } from "../components/StatCard.tsx"; // Added .tsx
import { Button } from "../components/button.tsx"; // Removed /ui/ and added .tsx
import { Clock, Tv, AlertCircle, RefreshCw, BarChart3, Film, Plus, Calendar as CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../components/dialog.tsx"; // Removed /ui/ and added .tsx
import { Input } from "../components/input.tsx"; // Removed /ui/ and added .tsx
import { Label } from "../components/label.tsx"; // Removed /ui/ and added .tsx
import { Calendar } from "../components/calendar.tsx"; // Removed /ui/ and added .tsx
import { Popover, PopoverContent, PopoverTrigger } from "../components/popover.tsx"; // Removed /ui/ and added .tsx
import { format } from "date-fns";
import { cn } from "../lib/utils.ts"; // Added .ts
// Add "default" right here:
export default function Dashboard() { 
  const { data: sessions = [], isLoading, isError } = useUsageSessions();
  // ... the rest of your code
