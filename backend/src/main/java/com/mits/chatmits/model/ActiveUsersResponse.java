package com.mits.chatmits.model;

import java.util.List;
import java.util.Map;

public class ActiveUsersResponse {
    private int totalUsersInPlatform;
    private int totalHeSelected;
    private int totalSheSelected;
    
    // Using maps or objects
    private List<Map<String, Object>> idleUsers;
    private List<WaitingUser> queueUsers;
    private List<Map<String, Object>> chattingUsers;
    
    // Getters and Setters
    public int getTotalUsersInPlatform() { return totalUsersInPlatform; }
    public void setTotalUsersInPlatform(int totalUsersInPlatform) { this.totalUsersInPlatform = totalUsersInPlatform; }
    public int getTotalHeSelected() { return totalHeSelected; }
    public void setTotalHeSelected(int totalHeSelected) { this.totalHeSelected = totalHeSelected; }
    public int getTotalSheSelected() { return totalSheSelected; }
    public void setTotalSheSelected(int totalSheSelected) { this.totalSheSelected = totalSheSelected; }
    
    public List<Map<String, Object>> getIdleUsers() { return idleUsers; }
    public void setIdleUsers(List<Map<String, Object>> idleUsers) { this.idleUsers = idleUsers; }
    
    public List<WaitingUser> getQueueUsers() { return queueUsers; }
    public void setQueueUsers(List<WaitingUser> queueUsers) { this.queueUsers = queueUsers; }
    
    public List<Map<String, Object>> getChattingUsers() { return chattingUsers; }
    public void setChattingUsers(List<Map<String, Object>> chattingUsers) { this.chattingUsers = chattingUsers; }
}
