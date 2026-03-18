package com.mits.chatmits.service;

import com.mits.chatmits.model.ChatMessage;
import com.mits.chatmits.repository.ChatMessageRepository;
import com.mits.chatmits.repository.ChatSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import java.time.LocalDateTime;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketEventListener {

    @Autowired
    private MatchmakingService matchmakingService;

    @Autowired
    private ChatSessionRepository chatSessionRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Maps WebSocket Session ID to User ID
    private final Map<String, String> sessionToUserId = new ConcurrentHashMap<>();
    
    // Maps User ID to exactly one active Chat Session ID
    private final Map<String, String> userToActiveSession = new ConcurrentHashMap<>();

    @EventListener
    public void handleWebSocketSubscribeListener(SessionSubscribeEvent event) {
        SimpMessageHeaderAccessor headers = SimpMessageHeaderAccessor.wrap(event.getMessage());
        String destination = headers.getDestination();
        if (destination != null) {
            if (destination.startsWith("/topic/match/")) {
                String userId = destination.substring("/topic/match/".length());
                String sessionId = headers.getSessionId();
                if (sessionId != null) {
                    System.out.println("User " + userId + " subscribed via session " + sessionId);
                    sessionToUserId.put(sessionId, userId);
                    matchmakingService.markUserConnected(userId);
                }
            } else if (destination.startsWith("/topic/session/")) {
                String chatSessionId = destination.substring("/topic/session/".length());
                String sessionId = headers.getSessionId();
                if (sessionId != null) {
                    String userId = sessionToUserId.get(sessionId);
                    if (userId != null) {
                        userToActiveSession.put(userId, chatSessionId);
                    }
                }
            }
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        if (sessionId != null) {
            String userId = sessionToUserId.remove(sessionId);
            if (userId != null) {
                System.out.println("Session " + sessionId + " disconnected, marking user " + userId + " as disconnected");
                matchmakingService.markUserDisconnected(userId);

                // Also check if they are in an active chat
                String chatSessionId = userToActiveSession.remove(userId);
                if (chatSessionId != null) {
                    endActiveSession(chatSessionId, userId);
                }
            }
        }
    }

    private void endActiveSession(String chatSessionId, String disconnectedUserId) {
        chatSessionRepository.findById(chatSessionId).ifPresent(session -> {
            if (!"closed".equals(session.getStatus())) {
                session.setStatus("closed");
                chatSessionRepository.save(session);

                ChatMessage chatMessage = new ChatMessage();
                chatMessage.setSessionId(chatSessionId);
                chatMessage.setSenderId(disconnectedUserId);
                chatMessage.setMessageType("SYSTEM_END_CHAT");
                chatMessage.setCreatedAt(LocalDateTime.now());
                chatMessageRepository.save(chatMessage);
                
                messagingTemplate.convertAndSend("/topic/session/" + chatSessionId, chatMessage);
            }
        });
    }
}
