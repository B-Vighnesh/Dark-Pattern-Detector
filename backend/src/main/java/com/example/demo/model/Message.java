package com.example.demo.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "feedback_seq")
    @SequenceGenerator(
            name = "feedback_seq",
            sequenceName = "feedback_sequence",
            initialValue = 10101,
            allocationSize = 1
    )
    private int id;

    private String message;
    private String url;
    private String issue;
    private String mail;

    @Temporal(TemporalType.DATE) // ✅ Only store the date (no time)
    private Date date;

    public Message() {
        // Automatically assign today's date when creating a new message
        this.date = new Date();
    }

    public Message(String message, String url, String issue, String mail) {
        this.message = message;
        this.url = url;
        this.issue = issue;
        this.mail = mail;
        this.date = new Date();
    }

    @PrePersist
    protected void onCreate() {
        if (this.date == null) {
            this.date = new Date();
        }
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getIssue() { return issue; }
    public void setIssue(String issue) { this.issue = issue; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getMail() { return mail; }
    public void setMail(String mail) { this.mail = mail; }

    public Date getDate() { return date; }
    public void setDate(Date date) { this.date = date; }
}
