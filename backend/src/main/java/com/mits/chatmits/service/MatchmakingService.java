package com.mits.chatmits.service;

import com.mits.chatmits.model.ChatSession;
import com.mits.chatmits.model.UserFilters;
import com.mits.chatmits.model.WaitingUser;
import com.mits.chatmits.repository.ChatSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class MatchmakingService {

    @Autowired
    private ChatSessionRepository chatSessionRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final Queue<WaitingUser> waitingUsers = new ConcurrentLinkedQueue<>();
    private final Set<String> connectedUsers = ConcurrentHashMap.newKeySet();
    private final Map<String, UserFilters> connectedUserFilters = new ConcurrentHashMap<>();

    public void markUserConnected(String userId) {
        connectedUsers.add(userId);
    }

    public void markUserDisconnected(String userId) {
        connectedUsers.remove(userId);
        connectedUserFilters.remove(userId);
        removeUserFromQueue(userId);
    }

    public void addUserToQueue(WaitingUser user) {
        // Remove if they are already in the queue to update their filters
        waitingUsers.removeIf(u -> u.getUserId().equals(user.getUserId()));
        connectedUserFilters.put(user.getUserId(), user.getFilters());
        waitingUsers.offer(user);
    }

    public void removeUserFromQueue(String userId) {
        waitingUsers.removeIf(u -> u.getUserId().equals(userId));
    }

    @Scheduled(fixedRate = 2000)
    public void processMatchmakingQueue() {
        // Ghost User Cleanup: Remove users who didn't connect their WebSocket within 10 seconds of joining the queue
        waitingUsers.removeIf(u -> 
            u.getJoinedAt().isBefore(java.time.LocalDateTime.now().minusSeconds(10)) 
            && !connectedUsers.contains(u.getUserId())
        );

        if (waitingUsers.size() < 2) {
            return;
        }

        List<WaitingUser> usersList = new ArrayList<>(waitingUsers);
        Set<String> matchedIds = new HashSet<>();

        // Very basic N^2 match processing for MVP
        for (int i = 0; i < usersList.size(); i++) {
            WaitingUser u1 = usersList.get(i);
            if (matchedIds.contains(u1.getUserId())) continue;

            WaitingUser bestMatch = null;
            int highestScore = -1;

            // Limit iterations to prevent heavy N^2 lag
            int maxComparisons = Math.min(usersList.size(), i + 100);
            for (int j = i + 1; j < maxComparisons; j++) {
                WaitingUser u2 = usersList.get(j);
                if (matchedIds.contains(u2.getUserId())) continue;

                int score = calculateCompatibility(u1.getFilters(), u2.getFilters());
                
                // Check if this is a fallback match (score < 1000)
                if (score < 1000) {
                    // Impose a 5-second wait before allowing fallback matches
                    long waitA = java.time.Duration.between(u1.getJoinedAt(), java.time.LocalDateTime.now()).getSeconds();
                    long waitB = java.time.Duration.between(u2.getJoinedAt(), java.time.LocalDateTime.now()).getSeconds();
                    if (waitA < 5 && waitB < 5) {
                        continue; // Wait a bit longer to find a perfect match
                    }
                }

                if (score > highestScore) {
                    highestScore = score;
                    bestMatch = u2;
                }
                
                // Break early if we found a very good match
                if (highestScore >= 1000) {
                    break;
                }
            }

            if (bestMatch != null && highestScore >= 0) {
                // We have a match!
                matchedIds.add(u1.getUserId());
                matchedIds.add(bestMatch.getUserId());
                
                createAndBroadcastSession(u1.getUserId(), bestMatch.getUserId(), highestScore);
            }
        }

        // Remove matched users from the actual queue
        waitingUsers.removeIf(u -> matchedIds.contains(u.getUserId()));
    }

    private void createAndBroadcastSession(String user1Id, String user2Id, int score) {
        ChatSession session = new ChatSession();
        session.setUser1Id(user1Id);
        session.setUser2Id(user2Id);
        chatSessionRepository.save(session);

        Map<String, Object> payload1 = createPayload(session, true, user1Id, score);
        Map<String, Object> payload2 = createPayload(session, true, user2Id, score);

        // Send websocket events to the specific users
        messagingTemplate.convertAndSend("/topic/match/" + user1Id, (Object) payload1);
        messagingTemplate.convertAndSend("/topic/match/" + user2Id, (Object) payload2);
    }

    private Map<String, Object> createPayload(ChatSession session, boolean matched, String userId, int score) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("success", true);
        payload.put("matched", matched);
        payload.put("session", session);
        double percentage = Math.min(100, Math.max(0, score * 10)); // Arbitrary percentage calc
        payload.put("matchScore", percentage / 100.0); 
        return payload;
    }

    private int calculateCompatibility(UserFilters f1, UserFilters f2) {
        if (f1 == null || f2 == null) return 0;
        
        int score = 0;

        // Gender Priority Matching
        boolean f1PrefersF2 = f1.getGender() == null || f1.getGender().isEmpty() || f1.getGender().contains(f2.getMyGender() != null ? f2.getMyGender() : "");
        boolean f2PrefersF1 = f2.getGender() == null || f2.getGender().isEmpty() || f2.getGender().contains(f1.getMyGender() != null ? f1.getMyGender() : "");

        if (f1PrefersF2 && f2PrefersF1) {
            score += 1000; // Mutual preference met
        } else {
            score += 100; // Fallback score if gender preference mismatch
        }
        
        // We calculate overlap for smaller scoring preferences.
        score += calculateOverlap(f1.getGender(), f2.getGender()) * 5;
        score += calculateOverlap(f1.getMood(), f2.getMood()) * 1;
        score += calculateOverlap(f1.getTopics(), f2.getTopics()) * 2;
        score += calculateOverlap(f1.getHobbies(), f2.getHobbies()) * 3;
        score += calculateOverlap(f1.getInterests(), f2.getInterests()) * 3;
        score += calculateOverlap(f1.getProfession(), f2.getProfession()) * 2;
        
        // If neither selected any filters, it's a default generic match (score 0), which is fine.
        return score;
    }

    private int calculateOverlap(List<String> list1, List<String> list2) {
        if (list1 == null || list2 == null || list1.isEmpty() || list2.isEmpty()) {
            return 0;
        }
        Set<String> set1 = new HashSet<>(list1);
        set1.retainAll(list2);
        return set1.size();
    }

    public List<WaitingUser> getWaitingUsers() {
        return new ArrayList<>(waitingUsers);
    }

    public Map<String, UserFilters> getConnectedUserFilters() {
        return new HashMap<>(connectedUserFilters);
    }

    public Set<String> getConnectedUsers() {
        return new HashSet<>(connectedUsers);
    }

    public List<ChatSession> getActiveSessions() {
        return chatSessionRepository.findByStatus("active");
    }
    
    @Scheduled(fixedRate = 60000)
    public void cleanupStaleSessions() {
        // Runs every minute to clean up active sessions where both users have disconnected
        // e.g., due to a server restart
        List<ChatSession> activeSessions = chatSessionRepository.findByStatus("active");
        for (ChatSession session : activeSessions) {
            if (!connectedUsers.contains(session.getUser1Id()) && !connectedUsers.contains(session.getUser2Id())) {
                session.setStatus("closed");
                chatSessionRepository.save(session);
            }
        }
    }
}
