import { useEffect, useState } from "react";
import { Clock, Lock } from "lucide-react";
import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns";
import { Card } from "react-bootstrap";

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

      // Check if current time is between 10 PM and 12 AM IST
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
        // Calculate time until 10 PM
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
    <Card 
      className={`mx-auto mt-4 p-4 border-2 shadow-sm ${isActive ? 'bg-light' : 'bg-white'}`}
      style={{ maxWidth: '600px', borderColor: isActive ? '#FF6200' : '#dee2e6' }}
    >
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          {isActive ? (
            <Clock size={32} style={{ color: '#FF6200' }} />
          ) : (
            <Lock size={32} className="text-secondary" />
          )}
          <div>
            <p className="mb-0 small fw-medium text-secondary">
              {format(currentTime, "h:mm:ss a")} IST
            </p>
            <p className={`mb-0 fw-bold fs-5 ${isActive ? "" : ""}`} style={{ color: isActive ? '#FF6200' : '#212529' }}>
              {isActive ? "ChatMITS is Active" : "ChatMITS is Offline"}
            </p>
          </div>
        </div>
        <div className="text-end">
          <p className="mb-0 small fw-medium text-secondary">
            {isActive ? "Time Remaining" : "Opens In"}
          </p>
          <p className="mb-0 fw-bold fs-4" style={{ color: isActive ? '#FF6200' : '#212529' }}>
            {timeRemaining}
          </p>
        </div>
      </div>
      
      {!isActive && (
        <div className="mt-3 p-3 bg-light rounded-3 border text-center">
          <small className="text-secondary">
            ChatMITS is available from <strong style={{ color: '#FF6200' }}>10:00 PM</strong> to{" "}
            <strong style={{ color: '#FF6200' }}>12:00 AM</strong> IST daily
          </small>
        </div>
      )}
    </Card>
  );
};
