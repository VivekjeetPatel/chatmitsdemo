import { X } from "lucide-react";
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal = ({ isOpen, onClose }: FeedbackModalProps) => {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim()) {
      alert("Thank you for your feedback!");
      setFeedback("");
      onClose();
    }
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Body className="p-4 rounded-4 shadow-lg border border-primary text-center">
        <h3 className="fw-bold mb-4" style={{ color: '#FF6200' }}>Send us some feedback!</h3>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4 text-start position-relative">
            <Form.Label className="position-absolute bg-white px-2 small fw-semibold" style={{ top: '-10px', left: '15px', color: '#FF6200' }}>
              message
            </Form.Label>
            <Form.Control 
              as="textarea"
              rows={6}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="rounded-4 border-2 p-3 shadow-none"
              style={{ borderColor: 'rgba(255, 98, 0, 0.3)', resize: 'none' }}
              placeholder="Tell us what you think..."
            />
          </Form.Group>
          <Button 
            type="submit" 
            className="w-100 py-3 rounded-pill fw-bold"
            disabled={!feedback.trim()}
            style={{ backgroundColor: '#FF6200', borderColor: '#FF6200' }}
          >
            Submit
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};
