import { useApp } from "@/context/AppContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertActionReportSchema, type InsertActionReport } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Alert } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ActionFormModal() {
  const { isActionModalOpen, setIsActionModalOpen, selectedZone } = useApp();
  const { toast } = useToast();

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  const activeZoneAlerts = alerts.filter(
    (alert) => alert.isActive && alert.zoneId === selectedZone?.id
  );

  const form = useForm<InsertActionReport & { alertId: string }>({
    resolver: zodResolver(
      insertActionReportSchema.extend({
        alertId: insertActionReportSchema.shape.alertId,
      })
    ),
    defaultValues: {
      alertId: "",
      actionTaken: "",
      userId: "system",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertActionReport) => {
      return await apiRequest("POST", "/api/action-reports", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/action-reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Action Logged",
        description: "Your mitigation action has been recorded successfully.",
      });
      form.reset();
      setIsActionModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log action. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertActionReport & { alertId: string }) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
      <DialogContent className="sm:max-w-md" data-testid="modal-action-form">
        <DialogHeader>
          <DialogTitle>Log Mitigation Action</DialogTitle>
          <DialogDescription>
            Document the actions taken in response to an alert for {selectedZone?.name}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="alertId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alert</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-alert">
                        <SelectValue placeholder="Select an alert" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeZoneAlerts.map((alert) => (
                        <SelectItem key={alert.id} value={alert.id}>
                          {alert.severity.toUpperCase()} - {alert.message.substring(0, 50)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="actionTaken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action Taken</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the mitigation action in detail..."
                      className="resize-none h-32"
                      data-testid="textarea-action"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsActionModalOpen(false)}
                data-testid="button-cancel-action"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                data-testid="button-submit-action"
              >
                {mutation.isPending ? "Logging..." : "Log Action"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
