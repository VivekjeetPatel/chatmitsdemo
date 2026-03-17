package com.mits.chatmits.repository;

import com.mits.chatmits.model.PlatformFilter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlatformFilterRepository extends JpaRepository<PlatformFilter, Long> {
    List<PlatformFilter> findByCategory(String category);
}
