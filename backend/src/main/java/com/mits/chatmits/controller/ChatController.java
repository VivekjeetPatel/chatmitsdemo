package com.mits.chatmits.controller;

import com.mits.chatmits.model.ChatMessage;
import com.mits.chatmits.model.ChatSession;
import com.mits.chatmits.model.SignalingMessage;
import com.mits.chatmits.repository.ChatMessageRepository;
import com.mits.chatmits.repository.ChatSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private ChatSessionRepository chatSessionRepository;

    // Get chat history for a session
    @GetMapping("/{sessionId}/messages")
    public List<ChatMessage> getMessages(@PathVariable String sessionId) {
        return chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }

    // Handle incoming WebSocket messages
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        chatMessage.setCreatedAt(LocalDateTime.now());
        chatMessageRepository.save(chatMessage);
        
        // Broadcast the message to the session topic
        messagingTemplate.convertAndSend("/topic/session/" + chatMessage.getSessionId(), chatMessage);
    }

    // Handle ending a chat session
    @MessageMapping("/chat.endSession")
    public void endSession(@Payload ChatMessage chatMessage) {
        // Find and close the session in DB
        String sessionId = chatMessage.getSessionId();
        chatSessionRepository.findById(sessionId).ifPresent(session -> {
            session.setStatus("closed");
            chatSessionRepository.save(session);
        });

        // Set type so frontend knows it's a termination message
        chatMessage.setMessageType("SYSTEM_END_CHAT");
        chatMessage.setCreatedAt(LocalDateTime.now());
        chatMessageRepository.save(chatMessage);
        
        // Broadcast to both users
        messagingTemplate.convertAndSend("/topic/session/" + sessionId, chatMessage);
    }

    // Handle WebRTC signaling messages
    @MessageMapping("/chat.signal")
    public void signal(@Payload SignalingMessage signal) {
        // Broadcast the signaling message to the specific session signal topic
        messagingTemplate.convertAndSend("/topic/session/" + signal.getSessionId() + "/signal", signal);
    }
}
