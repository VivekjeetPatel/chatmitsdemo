package com.mits.chatmits.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalTime;

@Entity
@Table(name = "platform_config")
public class PlatformConfig {

    @Id
    private Long id = 1L; // Singleton config for now

    private LocalTime dailyStartTime;
    private LocalTime dailyEndTime;
    private String timezone;
    private boolean enabled;

    public PlatformConfig() {}

    public PlatformConfig(LocalTime dailyStartTime, LocalTime dailyEndTime, String timezone, boolean enabled) {
        this.dailyStartTime = dailyStartTime;
        this.dailyEndTime = dailyEndTime;
        this.timezone = timezone;
        this.enabled = enabled;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalTime getDailyStartTime() { return dailyStartTime; }
    public void setDailyStartTime(LocalTime dailyStartTime) { this.dailyStartTime = dailyStartTime; }

    public LocalTime getDailyEndTime() { return dailyEndTime; }
    public void setDailyEndTime(LocalTime dailyEndTime) { this.dailyEndTime = dailyEndTime; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
}
