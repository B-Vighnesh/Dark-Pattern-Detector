package com.example.demo.service;

import com.example.demo.model.Message;
import com.example.demo.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackService {
    @Autowired
    FeedbackRepository feedbackRepository;
    public Message add(Message message) {
       return feedbackRepository.save(message);
    }

    public List<Message> getAll() {
        return feedbackRepository.findAll();
    }
}
