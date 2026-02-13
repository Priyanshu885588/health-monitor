package com.health.controller;

import com.health.model.HealthAlert;
import com.health.repository.AlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/alerts")
public class AlertController {

    @Autowired
    private AlertRepository repository;

    @PostMapping
    public ResponseEntity<String> receiveAlert(@RequestBody HealthAlert alert) {
        repository.save(alert);
        return ResponseEntity.ok("Alert processed and archived for user: " + alert.getUserId());
    }
}