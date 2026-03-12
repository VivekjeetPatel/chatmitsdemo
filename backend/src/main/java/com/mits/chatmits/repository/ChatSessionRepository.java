package com.mits.chatmits.repository;

import com.mits.chatmits.model.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ChatSessionRepository extends JpaRepository<ChatSession, String> {
    // Basic queries can be added here
}
