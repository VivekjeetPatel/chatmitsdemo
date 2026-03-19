package com.mits.chatmits.controller;

import com.mits.chatmits.model.PlatformConfig;
import com.mits.chatmits.model.PlatformFilter;
import com.mits.chatmits.model.WaitingUser;
import com.mits.chatmits.repository.PlatformFilterRepository;
import com.mits.chatmits.service.MatchmakingService;
import com.mits.chatmits.service.PlatformConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private PlatformConfigService configService;

    @Autowired
    private PlatformFilterRepository filterRepository;

    @Autowired
    private MatchmakingService matchmakingService;

    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("open", configService.isPlatformOpen());
        status.put("config", configService.getConfig());
        status.put("serverTime", ZonedDateTime.now());
        return ResponseEntity.ok(status);
    }

    @PostMapping("/config")
    public ResponseEntity<?> updateConfig(@RequestBody PlatformConfig config) {
        return ResponseEntity.ok(configService.updateConfig(config));
    }

    @GetMapping("/users/active")
    public ResponseEntity<?> getActiveUsers() {
        com.mits.chatmits.model.ActiveUsersResponse response = new com.mits.chatmits.model.ActiveUsersResponse();
        
        java.util.Set<String> allUsers = matchmakingService.getConnectedUsers();
        java.util.Map<String, com.mits.chatmits.model.UserFilters> allFilters = matchmakingService.getConnectedUserFilters();
        List<WaitingUser> queue = matchmakingService.getWaitingUsers();
        List<com.mits.chatmits.model.ChatSession> activeSessions = matchmakingService.getActiveSessions();

        response.setTotalUsersInPlatform(allUsers.size());
        
        int heCount = 0;
        int sheCount = 0;
        for (com.mits.chatmits.model.UserFilters f : allFilters.values()) {
            if (f.getGender() != null) {
                if (f.getGender().contains("He")) heCount++;
                if (f.getGender().contains("She")) sheCount++;
            }
        }
        response.setTotalHeSelected(heCount);
        response.setTotalSheSelected(sheCount);
        
        response.setQueueUsers(queue);
        
        // Chatting users mapping
        List<Map<String, Object>> chattingList = new java.util.ArrayList<>();
        java.util.Set<String> chattingIds = new java.util.HashSet<>();
        
        for (com.mits.chatmits.model.ChatSession s : activeSessions) {
            Map<String, Object> sessionInfo = new HashMap<>();
            sessionInfo.put("sessionId", s.getId());
            sessionInfo.put("user1Id", s.getUser1Id());
            sessionInfo.put("user2Id", s.getUser2Id());
            sessionInfo.put("startedAt", s.getStartedAt());
            sessionInfo.put("user1Filters", allFilters.get(s.getUser1Id()));
            sessionInfo.put("user2Filters", allFilters.get(s.getUser2Id()));
            chattingList.add(sessionInfo);
            chattingIds.add(s.getUser1Id());
            chattingIds.add(s.getUser2Id());
        }
        response.setChattingUsers(chattingList);
        
        // Idle users mapping
        java.util.Set<String> queueIds = new java.util.HashSet<>();
        for (WaitingUser w : queue) queueIds.add(w.getUserId());
        
        List<Map<String, Object>> idleList = new java.util.ArrayList<>();
        for (String uid : allUsers) {
            if (!queueIds.contains(uid) && !chattingIds.contains(uid)) {
                Map<String, Object> idleInfo = new HashMap<>();
                idleInfo.put("userId", uid);
                idleInfo.put("filters", allFilters.get(uid));
                idleList.add(idleInfo);
            }
        }
        response.setIdleUsers(idleList);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/filters")
    public ResponseEntity<?> getFilters() {
        return ResponseEntity.ok(filterRepository.findAll());
    }

    @PostMapping("/filters")
    public ResponseEntity<?> addFilter(@RequestBody PlatformFilter filter) {
        return ResponseEntity.ok(filterRepository.save(filter));
    }

    @DeleteMapping("/filters/{id}")
    public ResponseEntity<?> deleteFilter(@PathVariable Long id) {
        filterRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
