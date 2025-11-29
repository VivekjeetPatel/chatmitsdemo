import { useState } from "react";
import { MessageSquarePlus, Menu } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { UserFilters } from "@/components/InterestFilterModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppSidebarProps {
  onNewChat: () => void;
  onOpenFilters: () => void;
  isTimeWindowActive: boolean;
  filters?: UserFilters;
  onFiltersChange?: (filters: UserFilters) => void;
}

const FILTER_OPTIONS = {
  gender: ["He", "She"],
  mood: ["Happy", "Relaxed", "Energetic", "Creative", "Focused", "Adventurous", "Thoughtful", "Playful", "Calm"],
  topics: ["Technology", "Sports", "Music", "Movies", "Books", "Travel", "Food", "Gaming", "Art"],
  hobbies: ["Reading", "Cooking", "Photography", "Dancing", "Hiking", "Painting", "Gardening", "Yoga", "Coding"],
  interests: ["AI/ML", "Startups", "Fitness", "Fashion", "Politics", "Environment", "History", "Philosophy", "Psychology"],
  profession: ["Student", "Engineer", "Designer", "Doctor", "Teacher", "Artist", "Entrepreneur", "Developer", "Marketing"]
};

export function AppSidebar({ onNewChat, isTimeWindowActive, filters, onFiltersChange }: AppSidebarProps) {
  const [localFilters, setLocalFilters] = useState<UserFilters>(filters || {
    gender: [],
    mood: [],
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

  const gridCols = useIsMobile() ? "grid-cols-2" : "grid-cols-3";

  return (
    <Sidebar collapsible = "offcanvas" className="border-r border-sidebar-border bg-sidebar lg:w-[25vw] md:w-[50vw] w-[85vw]">
      <SidebarContent className="bg-sidebar flex flex-col h-full">
        {/* Header with Logo and Close Button */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-sidebar-border">
          <svg width="24" height="24" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.3513 29.6933C22.8676 28.7267 30 25.2576 30 16.2871C30 8.1237 23.1648 2.68773 18.2497 0.189967C17.1591 -0.364295 15.8824 0.364616 15.8824 1.46743V4.28823C15.8824 6.5126 14.8126 10.5728 11.84 12.2615C10.3223 13.1238 8.68327 11.8333 8.49882 10.2592L8.34736 8.9667C8.17129 7.46409 6.42072 6.55192 5.04699 7.46805C2.57906 9.11387 0 11.9959 0 16.2871C0 27.2574 9.33334 30 13.9999 30C14.2714 30 14.5567 29.9929 14.8537 29.9779C12.5494 29.8058 8.82353 28.5559 8.82353 24.5143C8.82353 21.3528 11.4619 19.214 13.4665 18.1744C14.0056 17.8947 14.6366 18.2579 14.6366 18.8058V19.7148C14.6366 20.4104 14.9444 21.4979 15.6769 22.2422C16.506 23.0845 17.7228 22.2021 17.8209 21.0943C17.8519 20.7449 18.2539 20.5221 18.6002 20.699C19.7319 21.2773 21.1765 22.5123 21.1765 24.5143C21.1765 27.6738 19.1841 29.1271 17.3513 29.6933Z" fill="#FF6200"/>
          </svg>
          <SidebarTrigger className="text-foreground/70 hover:text-primary hover:bg-transparent" />
        </div>


        <ScrollArea className="flex-1">
        {/* New Chat Button */}
        <div className="p-6 ">
          <Button 
            onClick={onNewChat} 
            disabled={!isTimeWindowActive}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-full shadow-soft"
            >
            <MessageSquarePlus className="h-5 w-5 mr-2" />
            New Chat
          </Button>
        </div>
            {/* Filters */}
          <div className="px-6 pb-6 space-y-8">
            <h2 className="text-lg font-semibold text-foreground">Filters</h2>

            {/* Gender Toggle */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Gender</label>
              <div className="relative flex items-center bg-muted rounded-full p-1">
                {/* Sliding indicator */}
                <span
                  className={`absolute inset-y-1 w-1/2 rounded-full bg-primary transition-transform duration-300 ease-in-out ${
                    isSelected("gender", "She") ? "translate-x-full" : "translate-x-0"
                  }`}
                />

                <button
                  onClick={() => handleToggle("gender", "He")}
                  className={`relative z-10 flex-1 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isSelected("gender", "He") ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  He
                </button>

                <button
                  onClick={() => handleToggle("gender", "She")}
                  className={`relative z-10 flex-1 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isSelected("gender", "She") ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  She
                </button>
              </div>
            </div>

            {/* Age */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Age</label>
              <div className="space-y-3">
                <Slider
                  value={ageRange}
                  onValueChange={setAgeRange}
                  min={16}
                  max={65}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs">
                  <span className="bg-muted text-foreground px-3 py-1.5 rounded-full font-medium">
                    {ageRange[0]}
                  </span>
                  <span className="bg-muted text-foreground px-3 py-1.5 rounded-full font-medium">
                    {ageRange[1]}
                  </span>
                </div>
              </div>
            </div>

                        {/* Mood */}
                        <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Mood</label>
              <div className={`grid ${gridCols} gap-2`}>
                {FILTER_OPTIONS.mood.map((option) => (
                  <Button
                    key={option}
                    onClick={() => handleToggle("mood", option)}
                    variant="outline"
                    size="sm"
                    className={`rounded-full border transition-all ${
                      isSelected("mood", option) 
                        ? "bg-primary/10 border-primary text-primary font-medium" 
                        : "border-border text-foreground/70 hover:border-primary/50 hover:text-primary hover:bg-transparent"
                    }`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            {/* Topics */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Topics</label>
              <div className={`grid ${gridCols} gap-2`}>
                {FILTER_OPTIONS.topics.map((option) => (
                  <Button
                    key={option}
                    onClick={() => handleToggle("topics", option)}
                    variant="outline"
                    size="sm"
                    className={`rounded-full border transition-all ${
                      isSelected("topics", option) 
                        ? "bg-primary/10 border-primary text-primary font-medium" 
                        : "border-border text-foreground/70 hover:border-primary/50 hover:text-primary hover:bg-transparent"
                    }`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            {/* Hobbies */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Hobbies</label>
              <div className={`grid ${gridCols} gap-2`}>
                {FILTER_OPTIONS.hobbies.map((option) => (
                  <Button
                    key={option}
                    onClick={() => handleToggle("hobbies", option)}
                    variant="outline"
                    size="sm"
                    className={`rounded-full border transition-all ${
                      isSelected("hobbies", option) 
                        ? "bg-primary/10 border-primary text-primary font-medium" 
                        : "border-border text-foreground/70 hover:border-primary/50 hover:text-primary hover:bg-transparent"
                    }`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Interests</label>
              <div className={`grid ${gridCols} gap-2`}>
                {FILTER_OPTIONS.interests.map((option) => (
                  <Button
                    key={option}
                    onClick={() => handleToggle("interests", option)}
                    variant="outline"
                    size="sm"
                    className={`rounded-full border transition-all ${
                      isSelected("interests", option) 
                        ? "bg-primary/10 border-primary text-primary font-medium" 
                        : "border-border text-foreground/70 hover:border-primary/50 hover:text-primary hover:bg-transparent"
                    }`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            {/* Profession */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Profession</label>
              <div className={`grid ${gridCols} gap-2`}>
                {FILTER_OPTIONS.profession.map((option) => (
                  <Button
                    key={option}
                    onClick={() => handleToggle("profession", option)}
                    variant="outline"
                    size="sm"
                    className={`rounded-full border transition-all ${
                      isSelected("profession", option) 
                        ? "bg-primary/10 border-primary text-primary font-medium" 
                        : "border-border text-foreground/70 hover:border-primary/50 hover:text-primary hover:bg-transparent"
                    }`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
            </div>
        {/* Footer */}
        <div className="border-t border-sidebar-border px-6 py-4 shrink-0">
          <p className="text-xs text-muted-foreground text-center text-primary">
            <a href="https://v-labs.in" target="_blank" rel="noopener noreferrer">v-labs.in</a>
          </p>
        </div>
        </ScrollArea>


      </SidebarContent>
    </Sidebar>
  );
}
      