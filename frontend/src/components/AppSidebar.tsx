import { useState } from "react";
import { MessageSquarePlus, X } from "lucide-react";
import { Button, Form } from "react-bootstrap";
import { UserFilters } from "./InterestFilterModal";
import { useIsMobile } from "../hooks/use-mobile";
import "./AppSidebar.css"; // We'll add custom CSS if needed or just use inline styles/bootstrap utilities

interface AppSidebarProps {
  onNewChat: () => void;
  onOpenFilters: () => void;
  isTimeWindowActive: boolean;
  filters?: UserFilters;
  onFiltersChange?: (filters: UserFilters) => void;
  onClose?: () => void;
}

const FILTER_OPTIONS = {
  gender: ["He", "She"],
  mood: ["Happy", "Relaxed", "Energetic", "Creative", "Focused", "Adventurous", "Thoughtful", "Playful", "Calm"],
  topics: ["Technology", "Sports", "Music", "Movies", "Books", "Travel", "Food", "Gaming", "Art"],
  hobbies: ["Reading", "Cooking", "Photography", "Dancing", "Hiking", "Painting", "Gardening", "Yoga", "Coding"],
  interests: ["AI/ML", "Startups", "Fitness", "Fashion", "Politics", "Environment", "History", "Philosophy", "Psychology"],
  profession: ["Student", "Engineer", "Designer", "Doctor", "Teacher", "Artist", "Entrepreneur", "Developer", "Marketing"]
};

export function AppSidebar({ onNewChat, isTimeWindowActive, filters, onFiltersChange, onClose }: AppSidebarProps) {
  const [localFilters, setLocalFilters] = useState<UserFilters>(filters || {
    gender: [],
    mood: [],
    topics: [],
    hobbies: [],
    interests: [],
    profession: []
  });
  
  const [ageRange, setAgeRange] = useState<number>(16);

  const handleToggle = (category: keyof UserFilters, value: string) => {
    const newFilters = { ...localFilters };
    const currentValues = newFilters[category];
    
    if (category === 'gender') {
      if (currentValues.includes(value)) {
        newFilters[category] = [];
      } else {
        newFilters[category] = [value];
      }
    } else {
      if (currentValues.includes(value)) {
        newFilters[category] = currentValues.filter(v => v !== value);
      } else {
        newFilters[category] = [...currentValues, value];
      }
    }
    
    setLocalFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const isSelected = (category: keyof UserFilters, value: string) => {
    return localFilters[category].includes(value);
  };

  const isMobile = useIsMobile();
  const sidebarWidth = isMobile ? "100%" : "300px";

  return (
    <div className="d-flex flex-column h-100 border-end bg-light" style={{ width: sidebarWidth, overflowY: "auto" }}>
      {/* Header */}
      <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
        <svg width="24" height="24" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.3513 29.6933C22.8676 28.7267 30 25.2576 30 16.2871C30 8.1237 23.1648 2.68773 18.2497 0.189967C17.1591 -0.364295 15.8824 0.364616 15.8824 1.46743V4.28823C15.8824 6.5126 14.8126 10.5728 11.84 12.2615C10.3223 13.1238 8.68327 11.8333 8.49882 10.2592L8.34736 8.9667C8.17129 7.46409 6.42072 6.55192 5.04699 7.46805C2.57906 9.11387 0 11.9959 0 16.2871C0 27.2574 9.33334 30 13.9999 30C14.2714 30 14.5567 29.9929 14.8537 29.9779C12.5494 29.8058 8.82353 28.5559 8.82353 24.5143C8.82353 21.3528 11.4619 19.214 13.4665 18.1744C14.0056 17.8947 14.6366 18.2579 14.6366 18.8058V19.7148C14.6366 20.4104 14.9444 21.4979 15.6769 22.2422C16.506 23.0845 17.7228 22.2021 17.8209 21.0943C17.8519 20.7449 18.2539 20.5221 18.6002 20.699C19.7319 21.2773 21.1765 22.5123 21.1765 24.5143C21.1765 27.6738 19.1841 29.1271 17.3513 29.6933Z" fill="#FF6200"/>
        </svg>
        {onClose && (
          <Button variant="link" className="text-dark p-0 m-0" onClick={onClose}>
            <X size={24} />
          </Button>
        )}
      </div>

      <div className="flex-grow-1 p-3">
        <Button 
          variant="primary" 
          className="w-100 mb-4 rounded-pill d-flex align-items-center justify-content-center" 
          onClick={onNewChat} 
          disabled={!isTimeWindowActive}
          style={{ backgroundColor: '#FF6200', borderColor: '#FF6200' }}
        >
          <MessageSquarePlus className="me-2" size={20} /> New Chat
        </Button>

        <h5 className="mb-3">Filters</h5>

        {/* Gender */}
        <div className="mb-4">
          <label className="form-label fw-bold small">Gender</label>
          <div className="d-flex gap-2">
            {FILTER_OPTIONS.gender.map(g => (
              <Button 
                key={g}
                variant={isSelected("gender", g) ? "primary" : "outline-secondary"}
                className="flex-fill rounded-pill"
                size="sm"
                onClick={() => handleToggle("gender", g)}
              >
                {g}
              </Button>
            ))}
          </div>
        </div>

        {/* Age */}
        <div className="mb-4">
          <label className="form-label fw-bold small">Minimum Age: {ageRange}</label>
          <Form.Range value={ageRange} min={16} max={65} onChange={(e) => setAgeRange(Number(e.target.value))} />
        </div>

        {/* Other Filters mapped */}
        {["mood", "topics", "hobbies", "interests", "profession"].map((category) => (
          <div className="mb-4" key={category}>
            <label className="form-label fw-bold small text-capitalize">{category}</label>
            <div className="d-flex flex-wrap gap-2">
              {FILTER_OPTIONS[category as keyof UserFilters].map((option) => (
                <Button
                  key={option}
                  variant={isSelected(category as keyof UserFilters, option) ? "primary" : "outline-secondary"}
                  size="sm"
                  className="rounded-pill"
                  onClick={() => handleToggle(category as keyof UserFilters, option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-top p-3 text-center">
        <a href="https://v-labs.in" target="_blank" rel="noopener noreferrer" className="text-decoration-none small" style={{ color: '#FF6200' }}>v-labs.in</a>
      </div>
    </div>
  );
}