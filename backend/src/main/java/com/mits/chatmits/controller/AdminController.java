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
@CrossOrigin(origins = "*") // Allow frontend access
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
        List<WaitingUser> users = matchmakingService.getWaitingUsers();
        return ResponseEntity.ok(users);
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
