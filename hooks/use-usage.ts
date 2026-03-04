import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// Fetch usage history
export function useUsageSessions() {
  return useQuery({
    queryKey: [api.usage.list.path],
    queryFn: async () => {
      const res = await fetch(api.usage.list.path);
      if (!res.ok) throw new Error("Failed to fetch usage sessions");
      return api.usage.list.responses[200].parse(await res.json());
    },
  });
}

// Create a manual session
export function useCreateSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (session: any) => {
      const res = await fetch(api.usage.create.path, {
        method: api.usage.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
      });
      if (!res.ok) throw new Error("Failed to create session");
      return api.usage.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.usage.list.path] });
      
      if (data.durationMinutes > 180) {
        toast({
          title: "⚠️ Excessive Usage Alert!",
          description: `You've watched ${Math.floor(data.durationMinutes / 60)}h ${data.durationMinutes % 60}m of "${data.showName}". Time to take a break!`,
          variant: "destructive",
          duration: 6000,
        });
      } else {
        toast({
          title: "Session Logged",
          description: `Logged ${data.durationMinutes}m of "${data.showName}".`,
          className: "bg-primary text-primary-foreground border-none",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not log session. Please try again.",
        variant: "destructive",
      });
    },
  });
}

// Generate a random session (AI simulation)
export function useGenerateSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.usage.generate.path, {
        method: api.usage.generate.method,
      });
      if (!res.ok) throw new Error("Failed to generate session");
      return api.usage.generate.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.usage.list.path] });
      
      // Check for usage limit violation
      if (data.durationMinutes > 180) {
        toast({
          title: "⚠️ Excessive Usage Alert!",
          description: `You've watched ${Math.floor(data.durationMinutes / 60)}h ${data.durationMinutes % 60}m of "${data.showName}". Time to take a break!`,
          variant: "destructive",
          duration: 6000,
        });
      } else {
        toast({
          title: "Session Logged",
          description: `Logged ${data.durationMinutes}m of "${data.showName}".`,
          className: "bg-primary text-primary-foreground border-none",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not generate session. Please try again.",
        variant: "destructive",
      });
    },
  });
}

// Delete a session
export function useDeleteSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.usage.delete.path, { id });
      const res = await fetch(url, {
        method: api.usage.delete.method,
      });
      if (!res.ok) throw new Error("Failed to delete session");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.usage.list.path] });
      toast({
        title: "Session Deleted",
        description: "The usage record has been removed.",
      });
    },
  });
}
