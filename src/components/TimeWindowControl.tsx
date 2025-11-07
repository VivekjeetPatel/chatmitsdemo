import { useEffect, useState } from "react";
import { Clock, Lock } from "lucide-react";
import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns";

interface TimeWindowControlProps {
  onTimeStatusChange: (isActive: boolean) => void;
}

const IST_TIMEZONE = "Asia/Kolkata";
const START_HOUR = 22; // 10 PM
const END_HOUR = 24; // 12 AM (midnight)

export const TimeWindowControl = ({ onTimeStatusChange }: TimeWindowControlProps) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    const checkTimeWindow = () => {
      const now = new Date();
      const istTime = toZonedTime(now, IST_TIMEZONE);
      const hours = istTime.getHours();
      const minutes = istTime.getMinutes();
      const seconds = istTime.getSeconds();

      setCurrentTime(istTime);

      // Check if current time is between 9 PM and 12 AM IST
      const active = hours >= START_HOUR && hours < END_HOUR;
      setIsActive(active);
      onTimeStatusChange(active);

      if (active) {
        // Calculate time remaining until midnight
        const endTime = new Date(istTime);
        endTime.setHours(END_HOUR, 0, 0, 0);
        const diff = endTime.getTime() - istTime.getTime();
        
        const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
        const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);
        
        setTimeRemaining(`${hoursLeft}h ${minutesLeft}m ${secondsLeft}s`);
      } else {
        // Calculate time until 9 PM
        const startTime = new Date(istTime);
        if (hours >= END_HOUR) {
          startTime.setDate(startTime.getDate() + 1);
        }
        startTime.setHours(START_HOUR, 0, 0, 0);
        const diff = startTime.getTime() - istTime.getTime();
        
        const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
        const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeRemaining(`${hoursLeft}h ${minutesLeft}m`);
      }
    };

    checkTimeWindow();
    const interval = setInterval(checkTimeWindow, 1000);

    return () => clearInterval(interval);
  }, [onTimeStatusChange]);

  return (
    <div className={`w-full max-w-2xl mx-auto p-6 rounded-2xl border-2 transition-all ${
      isActive 
        ? "bg-primary/10 border-primary shadow-soft" 
        : "bg-card border-border"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isActive ? (
            <Clock className="h-6 w-6 text-primary animate-pulse" />
          ) : (
            <Lock className="h-6 w-6 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {format(currentTime, "h:mm:ss a")} IST
            </p>
            <p className={`text-lg font-bold ${isActive ? "text-primary" : "text-foreground"}`}>
              {isActive ? "ChatMITS is Active" : "ChatMITS is Offline"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-muted-foreground">
            {isActive ? "Time Remaining" : "Opens In"}
          </p>
          <p className={`text-2xl font-bold ${isActive ? "text-primary" : "text-foreground"}`}>
            {timeRemaining}
          </p>
        </div>
      </div>
      
      {!isActive && (
        <div className="mt-4 p-4 bg-background rounded-xl border border-border">
          <p className="text-sm text-center text-muted-foreground">
            ChatMITS is available from <span className="font-bold text-primary">10:00 PM</span> to{" "}
            <span className="font-bold text-primary">12:00 AM</span> IST daily
          </p>
        </div>
      )}
    </div>
  );
};
