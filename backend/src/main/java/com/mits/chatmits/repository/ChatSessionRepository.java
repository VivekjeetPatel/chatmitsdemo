package com.mits.chatmits.repository;

import com.mits.chatmits.model.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import java.util.List;

public interface ChatSessionRepository extends JpaRepository<ChatSession, String> {
    List<ChatSession> findByStatus(String status);
}
