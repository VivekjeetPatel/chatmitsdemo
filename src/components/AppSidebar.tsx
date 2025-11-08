import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { UserFilters } from "@/components/InterestFilterModal";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AppSidebarProps {
  onNewChat: () => void;
  onOpenFilters: () => void;
  isTimeWindowActive: boolean;
  filters?: UserFilters;
  onFiltersChange?: (filters: UserFilters) => void;
}

const FILTER_OPTIONS = {
  gender: ["He", "She"],
  topics: ["Sports", "Music", "Movies", "Gaming", "Technology", "Fashion", "Food", "Travel"],
  hobbies: ["Reading", "Writing", "Painting", "Dancing", "Cooking", "Photography", "Gardening", "Yoga"],
  interests: ["Science", "History", "Politics", "Philosophy", "Psychology", "Art", "Literature", "Nature"],
  profession: ["Student", "Engineer", "Doctor", "Teacher", "Designer", "Developer", "Artist", "Entrepreneur"]
};

export function AppSidebar({ onNewChat, isTimeWindowActive, filters, onFiltersChange }: AppSidebarProps) {
  const [localFilters, setLocalFilters] = useState<UserFilters>(filters || {
    gender: [],
    topics: [],
    hobbies: [],
    interests: [],
    profession: []
  });
  
  const [ageRange, setAgeRange] = useState<number[]>([16, 65]);

  const handleToggle = (category: keyof UserFilters, value: string) => {
    const newFilters = { ...localFilters };
    const currentValues = newFilters[category];
    
    // For gender, use single-select behavior
    if (category === 'gender') {
      if (currentValues.includes(value)) {
        newFilters[category] = [];
      } else {
        newFilters[category] = [value];
      }
    } else {
      // For other categories, use multi-select
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

  return (
    <Sidebar className="border-r-2 border-sidebar-border bg-sidebar">
      <SidebarContent className="bg-sidebar">
        {/* Logo and New Chat */}
        <div className="p-4 space-y-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.3513 29.6933C22.8676 28.7267 30 25.2576 30 16.2871C30 8.1237 23.1648 2.68773 18.2497 0.189967C17.1591 -0.364295 15.8824 0.364616 15.8824 1.46743V4.28823C15.8824 6.5126 14.8126 10.5728 11.84 12.2615C10.3223 13.1238 8.68327 11.8333 8.49882 10.2592L8.34736 8.9667C8.17129 7.46409 6.42072 6.55192 5.04699 7.46805C2.57906 9.11387 0 11.9959 0 16.2871C0 27.2574 9.33334 30 13.9999 30C14.2714 30 14.5567 29.9929 14.8537 29.9779C12.5494 29.8058 8.82353 28.5559 8.82353 24.5143C8.82353 21.3528 11.4619 19.214 13.4665 18.1744C14.0056 17.8947 14.6366 18.2579 14.6366 18.8058V19.7148C14.6366 20.4104 14.9444 21.4979 15.6769 22.2422C16.506 23.0845 17.7228 22.2021 17.8209 21.0943C17.8519 20.7449 18.2539 20.5221 18.6002 20.699C19.7319 21.2773 21.1765 22.5123 21.1765 24.5143C21.1765 27.6738 19.1841 29.1271 17.3513 29.6933Z" fill="#FF6200"/>
            </svg>
            <span className="font-bold text-xl text-sidebar-primary">ChatMITS</span>
          </div>
          
          <Button 
            onClick={onNewChat} 
            disabled={!isTimeWindowActive}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            <MessageSquarePlus className="h-5 w-5 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Filters */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            <h2 className="text-xl font-bold text-primary">Filters</h2>

            {/* Gender */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-primary">Gender</label>
              <div className="flex gap-2">
                {FILTER_OPTIONS.gender.map((option) => (
                  <Button
                    key={option}
                    onClick={() => handleToggle("gender", option)}
                    variant={isSelected("gender", option) ? "default" : "outline"}
                    className={`flex-1 ${
                      isSelected("gender", option) 
                        ? "bg-primary text-primary-foreground" 
                        : "border-primary text-primary hover:bg-primary/10"
                    }`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            {/* Age */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-primary">Age</label>
              <div className="space-y-2">
                <Slider
                  value={ageRange}
                  onValueChange={setAgeRange}
                  min={16}
                  max={65}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full font-semibold">
                    {ageRange[0]}
                  </span>
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full font-semibold">
                    {ageRange[1]}
                  </span>
                </div>
              </div>
            </div>

            {/* Mood (Topics) */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-primary">Mood</label>
              <div className="grid grid-cols-2 gap-2">
                {FILTER_OPTIONS.topics.map((option) => (
                  <Button
                    key={option}
                    onClick={() => handleToggle("topics", option)}
                    variant={isSelected("topics", option) ? "default" : "outline"}
                    size="sm"
                    className={`${
                      isSelected("topics", option) 
                        ? "bg-primary text-primary-foreground" 
                        : "border-primary text-primary hover:bg-primary/10"
                    }`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            {/* Hobbies */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-primary">Hobbies</label>
              <div className="grid grid-cols-2 gap-2">
                {FILTER_OPTIONS.hobbies.map((option) => (
                  <Button
                    key={option}
                    onClick={() => handleToggle("hobbies", option)}
                    variant={isSelected("hobbies", option) ? "default" : "outline"}
                    size="sm"
                    className={`${
                      isSelected("hobbies", option) 
                        ? "bg-primary text-primary-foreground" 
                        : "border-primary text-primary hover:bg-primary/10"
                    }`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-primary">Interests</label>
              <div className="grid grid-cols-2 gap-2">
                {FILTER_OPTIONS.interests.map((option) => (
                  <Button
                    key={option}
                    onClick={() => handleToggle("interests", option)}
                    variant={isSelected("interests", option) ? "default" : "outline"}
                    size="sm"
                    className={`${
                      isSelected("interests", option) 
                        ? "bg-primary text-primary-foreground" 
                        : "border-primary text-primary hover:bg-primary/10"
                    }`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            {/* Profession */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-primary">Profession</label>
              <div className="grid grid-cols-2 gap-2">
                {FILTER_OPTIONS.profession.map((option) => (
                  <Button
                    key={option}
                    onClick={() => handleToggle("profession", option)}
                    variant={isSelected("profession", option) ? "default" : "outline"}
                    size="sm"
                    className={`${
                      isSelected("profession", option) 
                        ? "bg-primary text-primary-foreground" 
                        : "border-primary text-primary hover:bg-primary/10"
                    }`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
