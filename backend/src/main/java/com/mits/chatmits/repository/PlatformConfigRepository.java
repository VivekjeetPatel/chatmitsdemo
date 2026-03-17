package com.mits.chatmits.repository;

import com.mits.chatmits.model.PlatformConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlatformConfigRepository extends JpaRepository<PlatformConfig, Long> {
}
