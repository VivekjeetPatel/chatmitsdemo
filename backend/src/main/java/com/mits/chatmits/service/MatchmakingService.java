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
import java.util.stream.Collectors;

@Service
public class MatchmakingService {

    @Autowired
    private ChatSessionRepository chatSessionRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final Queue<WaitingUser> waitingUsers = new ConcurrentLinkedQueue<>();

    public void addUserToQueue(WaitingUser user) {
        // Remove if they are already in the queue to update their filters
        waitingUsers.removeIf(u -> u.getUserId().equals(user.getUserId()));
        waitingUsers.offer(user);
    }

    public void removeUserFromQueue(String userId) {
        waitingUsers.removeIf(u -> u.getUserId().equals(userId));
    }

    @Scheduled(fixedRate = 2000)
    public void processMatchmakingQueue() {
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

            for (int j = i + 1; j < usersList.size(); j++) {
                WaitingUser u2 = usersList.get(j);
                if (matchedIds.contains(u2.getUserId())) continue;

                int score = calculateCompatibility(u1.getFilters(), u2.getFilters());
                
                // score of -1 implies a hard constraint failed (e.g. wrong gender)
                if (score > highestScore) {
                    highestScore = score;
                    bestMatch = u2;
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
        
        // 1. Hard Constraints (Gender)
        // If user1 picked specific genders, user2 MUST be in that list.
        // Wait, the filter actually means "I am looking for *these* genders". 
        // We lack a "my gender is X" field right now, so we will skip hard constraints and just score it.
        
        int score = 0;
        
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
}
