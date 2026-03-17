package com.mits.chatmits.service;

import com.mits.chatmits.model.PlatformConfig;
import com.mits.chatmits.repository.PlatformConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Optional;

@Service
public class PlatformConfigService {

    @Autowired
    private PlatformConfigRepository repository;

    @Autowired
    private com.mits.chatmits.repository.PlatformFilterRepository filterRepository;

    public PlatformConfig getConfig() {
        return repository.findById(1L).orElseGet(() -> {
            // Default config: 8 PM to 12 AM UTC
            PlatformConfig defaultConfig = new PlatformConfig(
                LocalTime.of(20, 0),
                LocalTime.of(0, 0),
                "UTC",
                true
            );
            
            // Seed some default filters
            if (filterRepository.count() == 0) {
                filterRepository.save(new com.mits.chatmits.model.PlatformFilter("gender", "Male"));
                filterRepository.save(new com.mits.chatmits.model.PlatformFilter("gender", "Female"));
                filterRepository.save(new com.mits.chatmits.model.PlatformFilter("gender", "Other"));
                filterRepository.save(new com.mits.chatmits.model.PlatformFilter("mood", "Happy"));
                filterRepository.save(new com.mits.chatmits.model.PlatformFilter("mood", "Chill"));
            }

            return repository.save(defaultConfig);
        });
    }

    public PlatformConfig updateConfig(PlatformConfig config) {
        config.setId(1L);
        return repository.save(config);
    }

    public boolean isPlatformOpen() {
        PlatformConfig config = getConfig();
        if (!config.isEnabled()) return false;

        ZoneId zone = ZoneId.of(config.getTimezone() != null ? config.getTimezone() : "UTC");
        ZonedDateTime now = ZonedDateTime.now(zone);
        LocalTime currentTime = now.toLocalTime();
        LocalTime start = config.getDailyStartTime();
        LocalTime end = config.getDailyEndTime();

        // Handle overnight sessions (e.g., 10 PM to 4 AM)
        if (start.isBefore(end)) {
            return !currentTime.isBefore(start) && !currentTime.isAfter(end);
        } else {
            // End is on the next day
            return !currentTime.isBefore(start) || !currentTime.isAfter(end);
        }
    }
}
