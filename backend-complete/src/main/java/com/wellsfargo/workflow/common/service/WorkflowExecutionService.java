package com.wellsfargo.workflow.common.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
@Slf4j
public class WorkflowExecutionService {

    private final Random random = new Random();

    public long simulateExecution(String bpmnFilePath) {
        long baseTime = 100 + random.nextInt(300);

        try {
            Thread.sleep(baseTime);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Execution interrupted", e);
        }

        if (random.nextDouble() < 0.1) {
            throw new RuntimeException("Simulated execution error for: " + bpmnFilePath);
        }

        return baseTime;
    }

    public long simulateNodeExecution(String nodeType, boolean isChallenge) {
        long baseTime = 100 + random.nextInt(300);

        if (isChallenge) {
            baseTime = (long) (baseTime * 1.3);
        }

        try {
            Thread.sleep(baseTime);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        if (!nodeType.contains("Event") && random.nextDouble() < 0.1) {
            throw new RuntimeException("Simulated node error in " + nodeType);
        }

        return baseTime;
    }
}
