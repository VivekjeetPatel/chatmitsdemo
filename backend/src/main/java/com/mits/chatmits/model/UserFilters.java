package com.mits.chatmits.model;

import java.util.List;

public class UserFilters {
    private List<String> gender;
    private List<String> mood;
    private List<String> topics;
    private List<String> hobbies;
    private List<String> interests;
    private List<String> profession;
    private Integer minAge;

    // Getters and Setters
    public List<String> getGender() { return gender; }
    public void setGender(List<String> gender) { this.gender = gender; }
    
    public List<String> getMood() { return mood; }
    public void setMood(List<String> mood) { this.mood = mood; }
    
    public List<String> getTopics() { return topics; }
    public void setTopics(List<String> topics) { this.topics = topics; }
    
    public List<String> getHobbies() { return hobbies; }
    public void setHobbies(List<String> hobbies) { this.hobbies = hobbies; }
    
    public List<String> getInterests() { return interests; }
    public void setInterests(List<String> interests) { this.interests = interests; }
    
    public List<String> getProfession() { return profession; }
    public void setProfession(List<String> profession) { this.profession = profession; }

    public Integer getMinAge() { return minAge; }
    public void setMinAge(Integer minAge) { this.minAge = minAge; }
}
