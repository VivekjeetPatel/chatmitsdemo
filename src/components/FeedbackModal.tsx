import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal = ({ isOpen, onClose }: FeedbackModalProps) => {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim()) {
      toast.success("Thank you for your feedback!");
      setFeedback("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-50 animate-in fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="w-full max-w-md bg-card rounded-3xl shadow-medium border-2 border-primary/20 p-8 space-y-6 pointer-events-auto animate-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary">Send us some feedback!</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label className="absolute -top-3 left-4 bg-card px-2 text-sm font-medium text-primary">
                message
              </label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[200px] border-2 border-primary/30 rounded-2xl focus-visible:ring-primary resize-none"
                placeholder="Tell us what you think..."
              />
            </div>

            <Button 
              type="submit"
              className="w-full py-6 text-lg font-semibold rounded-full shadow-soft hover:shadow-medium transition-all"
              disabled={!feedback.trim()}
            >
              Submit
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};
