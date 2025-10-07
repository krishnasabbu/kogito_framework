package com.wellsfargo.championchallenge.service;

import com.wellsfargo.championchallenge.entity.ExecutionNodeMetricEntity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class WorkflowExecutionService {

    private final ObjectMapper objectMapper;

    public List<ExecutionNodeMetricEntity> executeWorkflow(
        String executionId,
        String workflowId,
        JsonNode requestPayload,
        ExecutionNodeMetricEntity.Variant variant
    ) {
        log.info("Executing workflow: {} for execution: {} (variant: {})", workflowId, executionId, variant);

        List<ExecutionNodeMetricEntity> metrics = new ArrayList<>();

        List<WorkflowNode> nodes = getWorkflowNodes(workflowId);

        for (WorkflowNode node : nodes) {
            LocalDateTime startTime = LocalDateTime.now();

            try {
                long executionTime = simulateNodeExecution(node, variant);
                LocalDateTime endTime = LocalDateTime.now();

                JsonNode requestData = createRequestData(node, requestPayload);
                JsonNode responseData = createResponseData(node, executionTime);
                JsonNode metadata = createMetadata();

                ExecutionNodeMetricEntity metric = new ExecutionNodeMetricEntity();
                metric.setVariant(variant);
                metric.setNodeId(node.getId());
                metric.setNodeName(node.getName());
                metric.setNodeType(node.getType());
                metric.setRequestData(requestData.toString());
                metric.setResponseData(responseData.toString());
                metric.setExecutionTimeMs(executionTime);
                metric.setStatus(ExecutionNodeMetricEntity.MetricStatus.SUCCESS);
                metric.setStartedAt(startTime);
                metric.setCompletedAt(endTime);
                metric.setMetadata(metadata.toString());

                metrics.add(metric);

            } catch (Exception e) {
                log.error("Error executing node: {} in workflow: {}", node.getName(), workflowId, e);

                ExecutionNodeMetricEntity metric = new ExecutionNodeMetricEntity();
                metric.setVariant(variant);
                metric.setNodeId(node.getId());
                metric.setNodeName(node.getName());
                metric.setNodeType(node.getType());
                metric.setExecutionTimeMs(0L);
                metric.setStatus(ExecutionNodeMetricEntity.MetricStatus.ERROR);
                metric.setErrorMessage(e.getMessage());
                metric.setStartedAt(startTime);
                metric.setCompletedAt(LocalDateTime.now());

                metrics.add(metric);
            }
        }

        return metrics;
    }

    private List<WorkflowNode> getWorkflowNodes(String workflowId) {
        return Arrays.asList(
            new WorkflowNode("start", "Start Event", "startEvent"),
            new WorkflowNode("validate", "Validate Payment", "serviceTask"),
            new WorkflowNode("check-fraud", "Fraud Detection", "serviceTask"),
            new WorkflowNode("process-payment", "Process Payment", "serviceTask"),
            new WorkflowNode("gateway", "Payment Gateway", "exclusiveGateway"),
            new WorkflowNode("send-confirmation", "Send Confirmation", "serviceTask"),
            new WorkflowNode("update-ledger", "Update Ledger", "serviceTask"),
            new WorkflowNode("end", "End Event", "endEvent")
        );
    }

    private long simulateNodeExecution(WorkflowNode node, ExecutionNodeMetricEntity.Variant variant) {
        Random random = new Random();
        long baseTime = 100 + random.nextInt(300);

        if (variant == ExecutionNodeMetricEntity.Variant.CHALLENGE) {
            baseTime = (long) (baseTime * 1.3);
        }

        if (random.nextDouble() < 0.1 && !node.getType().equals("startEvent") && !node.getType().equals("endEvent")) {
            throw new RuntimeException("Simulated error in " + node.getName());
        }

        try {
            Thread.sleep(baseTime);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        return baseTime;
    }

    private JsonNode createRequestData(WorkflowNode node, JsonNode originalPayload) {
        try {
            Map<String, Object> requestData = new HashMap<>();
            requestData.put("transactionId", "TXN-" + UUID.randomUUID().toString().substring(0, 9));
            requestData.put("amount", 1250.75);
            requestData.put("currency", "USD");
            requestData.put("customerId", "CUST-12345");
            requestData.put("timestamp", LocalDateTime.now().toString());
            requestData.put("nodeName", node.getName());

            return objectMapper.valueToTree(requestData);
        } catch (Exception e) {
            return objectMapper.createObjectNode();
        }
    }

    private JsonNode createResponseData(WorkflowNode node, long executionTime) {
        try {
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("status", "approved");
            responseData.put("processingTime", executionTime);
            responseData.put("transactionId", "TXN-" + UUID.randomUUID().toString().substring(0, 9));
            responseData.put("timestamp", LocalDateTime.now().toString());
            responseData.put("code", 200);

            return objectMapper.valueToTree(responseData);
        } catch (Exception e) {
            return objectMapper.createObjectNode();
        }
    }

    private JsonNode createMetadata() {
        try {
            Random random = new Random();
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("memoryUsed", 20 + random.nextDouble() * 80);
            metadata.put("cpuUsage", 10 + random.nextDouble() * 70);
            metadata.put("requestSize", 1000 + random.nextInt(4000));
            metadata.put("responseSize", 2000 + random.nextInt(6000));

            return objectMapper.valueToTree(metadata);
        } catch (Exception e) {
            return objectMapper.createObjectNode();
        }
    }

    private static class WorkflowNode {
        private final String id;
        private final String name;
        private final String type;

        public WorkflowNode(String id, String name, String type) {
            this.id = id;
            this.name = name;
            this.type = type;
        }

        public String getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public String getType() {
            return type;
        }
    }
}
