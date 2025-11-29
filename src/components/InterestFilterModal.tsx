import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";

interface InterestFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: UserFilters) => void;
  currentFilters: UserFilters;
}

export interface UserFilters {
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
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters({
      gender: [],
      mood: [],
      topics: [],
      hobbies: [],
      interests: [],
      profession: []
    });
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-xl border border-border w-full max-w-2xl max-h-[85vh] overflow-hidden animate-in zoom-in-95 fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-2xl font-bold text-primary">Interest Filters</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
            <div className="space-y-8">
              {Object.entries(FILTER_OPTIONS).map(([category, options]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-primary mb-3 capitalize">
                    {category}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {options.map((option) => (
                      <div
                        key={option}
                        className={cn(
                          "flex items-center space-x-2 p-3 rounded-xl border-2 transition-all cursor-pointer hover:border-primary/50",
                          filters[category as keyof UserFilters].includes(option)
                            ? "border-primary bg-primary/10"
                            : "border-border bg-background"
                        )}
                        onClick={() => handleToggle(category as keyof UserFilters, option)}
                      >
                        <Checkbox
                          id={`${category}-${option}`}
                          checked={filters[category as keyof UserFilters].includes(option)}
                          onCheckedChange={() => handleToggle(category as keyof UserFilters, option)}
                        />
                        <Label
                          htmlFor={`${category}-${option}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-border">
            <Button variant="outline" onClick={handleClear}>
              Clear All
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleApply}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
