package com.mits.chatmits.model;

import java.time.LocalDateTime;

public class WaitingUser {
    private String userId;
    private UserFilters filters;
    private LocalDateTime joinedAt;

    public WaitingUser(String userId, UserFilters filters) {
        this.userId = userId;
        this.filters = filters;
        this.joinedAt = LocalDateTime.now();
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public UserFilters getFilters() { return filters; }
    public void setFilters(UserFilters filters) { this.filters = filters; }
    
    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
}
