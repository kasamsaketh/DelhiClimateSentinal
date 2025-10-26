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
import { insertCommunityReportSchema, type InsertCommunityReport } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function CommunityFormModal() {
  const { isCommunityModalOpen, setIsCommunityModalOpen, selectedZone } = useApp();
  const { toast } = useToast();

  const form = useForm<InsertCommunityReport>({
    resolver: zodResolver(insertCommunityReportSchema),
    defaultValues: {
      zoneId: selectedZone?.id || "",
      zoneName: selectedZone?.name || "",
      reportText: "",
      isVerified: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertCommunityReport) => {
      return await apiRequest("POST", "/api/community-reports", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community-reports"] });
      toast({
        title: "Report Submitted",
        description: "Thank you for your contribution. Your report is pending verification.",
      });
      form.reset();
      setIsCommunityModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCommunityReport) => {
    mutation.mutate({
      ...data,
      zoneId: selectedZone!.id,
      zoneName: selectedZone!.name,
    });
  };

  return (
    <Dialog open={isCommunityModalOpen} onOpenChange={setIsCommunityModalOpen}>
      <DialogContent className="sm:max-w-md" data-testid="modal-community-form">
        <DialogHeader>
          <DialogTitle>Community Report</DialogTitle>
          <DialogDescription>
            Share your environmental observations for {selectedZone?.name}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="reportText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observation Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what you've observed in the environment (air quality, water issues, pollution sources, etc.)..."
                      className="resize-none h-40"
                      data-testid="textarea-report"
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
                onClick={() => setIsCommunityModalOpen(false)}
                data-testid="button-cancel-report"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                data-testid="button-submit-report"
              >
                {mutation.isPending ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
