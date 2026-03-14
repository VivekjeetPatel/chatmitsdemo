package com.mits.chatmits.model;

public class SignalingMessage {
    private String type; // e.g., "offer", "answer", "candidate", "end_call"
    private String senderId;
    private String sessionId;
    private Object payload; // Typically an SDP object or an ICE Candidate object

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public Object getPayload() {
        return payload;
    }

    public void setPayload(Object payload) {
        this.payload = payload;
    }
}
