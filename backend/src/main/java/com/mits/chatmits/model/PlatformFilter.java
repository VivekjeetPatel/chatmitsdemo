package com.mits.chatmits.model;

import jakarta.persistence.*;

@Entity
@Table(name = "platform_filters")
public class PlatformFilter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String category; // e.g., "gender", "mood", "topic"
    private String value;

    public PlatformFilter() {}

    public PlatformFilter(String category, String value) {
        this.category = category;
        this.value = value;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
}
