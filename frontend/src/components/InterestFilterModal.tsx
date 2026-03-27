import { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import "./InterestFilterModal.css"; // Optional custom CSS for styling

interface InterestFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: UserFilters) => void;
  currentFilters: UserFilters;
}

export interface UserFilters {
  myGender?: string;
  gender: string[];
  mood: string[];
  topics: string[];
  hobbies: string[];
  interests: string[];
  profession: string[];
}

const FILTER_OPTIONS = {
  gender: ["Male", "Female", "Non-binary", "Prefer not to say"],
  mood: ["Happy", "Relaxed", "Energetic", "Creative", "Focused", "Adventurous", "Thoughtful", "Playful", "Calm"],
  topics: ["Technology", "Sports", "Music", "Movies", "Books", "Travel", "Food", "Gaming", "Art"],
  hobbies: ["Reading", "Cooking", "Photography", "Dancing", "Hiking", "Painting", "Gardening", "Yoga", "Coding"],
  interests: ["AI/ML", "Startups", "Fitness", "Fashion", "Politics", "Environment", "History", "Philosophy", "Psychology"],
  profession: ["Student", "Engineer", "Designer", "Doctor", "Teacher", "Artist", "Entrepreneur", "Developer", "Marketing"]
};

export const InterestFilterModal = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters
}: InterestFilterModalProps) => {
  const [filters, setFilters] = useState<UserFilters>(currentFilters);

  const handleToggle = (category: keyof UserFilters, value: string) => {
    setFilters(prev => {
      const arr = (prev[category] as string[]) || [];
      return {
        ...prev,
        [category]: arr.includes(value)
          ? arr.filter(item => item !== value)
          : [...arr, value]
      };
    });
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters({
      myGender: undefined,
      gender: [],
      mood: [],
      topics: [],
      hobbies: [],
      interests: [],
      profession: []
    });
  };

  return (
    <Modal show={isOpen} onHide={onClose} size="lg" centered scrollable>
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="fw-bold" style={{ color: 'var(--accent-color)' }}>Interest Filters</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="pt-3">
        <div className="d-flex flex-column gap-4">
          {/* My Gender Selection Removed */}

          {Object.entries(FILTER_OPTIONS).map(([category, options]) => (
            <div key={category}>
              <h5 className="text-capitalize mb-3" style={{ color: 'var(--accent-color)' }}>
                {category === 'gender' ? 'Looking For' : category}
              </h5>
              <div className="row g-2">
                {options.map((option) => {
                  const arr = (filters[category as keyof UserFilters] as string[]) || [];
                  const isChecked = arr.includes(option);
                  return (
                    <div className="col-sm-6 col-md-4" key={option}>
                      <div 
                        className={`p-2 border rounded-3 d-flex align-items-center gap-2 cursor-pointer transition-all ${isChecked ? 'shadow-sm' : ''}`}
                        style={{ 
                          borderColor: isChecked ? 'var(--accent-color)' : 'var(--border-color)', 
                          backgroundColor: isChecked ? 'color-mix(in srgb, var(--accent-color) 15%, transparent)' : 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer' 
                        }}
                        onClick={() => handleToggle(category as keyof UserFilters, option)}
                      >
                        <Form.Check 
                          type="checkbox"
                          id={`${category}-${option}`}
                          checked={isChecked}
                          onChange={() => {}} // handled by parent div click
                          className="mb-0 custom-checkbox"
                        />
                        <Form.Label htmlFor={`${category}-${option}`} className="mb-0 small flex-grow-1" style={{ cursor: 'pointer' }}>
                          {option}
                        </Form.Label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Modal.Body>

      <Modal.Footer className="justify-content-between border-top">
        <Button variant="outline-secondary" onClick={handleClear} className="rounded-pill px-4">
          Clear All
        </Button>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={onClose} className="rounded-pill px-4">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleApply} className="rounded-pill px-4 border-0" style={{ backgroundColor: 'var(--accent-color)', color: '#fff' }}>
            Apply Filters
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
