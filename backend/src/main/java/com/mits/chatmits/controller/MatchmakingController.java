package com.mits.chatmits.controller;

import com.mits.chatmits.model.UserFilters;
import com.mits.chatmits.model.WaitingUser;
import com.mits.chatmits.service.MatchmakingService;
import com.mits.chatmits.service.PlatformConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/matchmaking")
public class MatchmakingController {

    @Autowired
    private MatchmakingService matchmakingService;

    @Autowired
    private PlatformConfigService configService;

    // Inner DTO for receiving the request safely
    public static class MatchRequest {
        private String userId;
        private UserFilters filters;

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public UserFilters getFilters() { return filters; }
        public void setFilters(UserFilters filters) { this.filters = filters; }
    }

    @PostMapping("/find")
    public ResponseEntity<?> findMatch(@RequestBody MatchRequest request) {
        if (!configService.isPlatformOpen()) {
            return ResponseEntity.status(403).body(Map.of(
                "success", false,
                "error", "platform_closed",
                "message", "The platform is currently closed. Please check the schedule."
            ));
        }

        String userId = request.getUserId();
        UserFilters filters = request.getFilters();
        
        if (filters == null) {
            filters = new UserFilters();
        }

        WaitingUser user = new WaitingUser(userId, filters);
        matchmakingService.addUserToQueue(user);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "matched", false,
            "message", "Added to queue, establishing WebSocket connection to wait for a match..."
        ));
    }
    
    @PostMapping("/cancel")
    public ResponseEntity<?> cancelMatch(@RequestBody Map<String, Object> payload) {
        String userId = (String) payload.get("userId");
        matchmakingService.removeUserFromQueue(userId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Removed from queue"));
    }
}
