# Spring Boot Backend Folder Structure

```
backend/
├── src/main/java/com/wellsfargo/workflow/
│   │
│   ├── abtest/
│   │   ├── controller/
│   │   │   └── ABTestController.java
│   │   ├── service/
│   │   │   ├── ABTestService.java
│   │   │   └── ABTestServiceImpl.java
│   │   ├── repository/
│   │   │   ├── ABTestRepository.java
│   │   │   ├── ABTestArmRepository.java
│   │   │   └── ABTestExecutionRepository.java
│   │   ├── entity/
│   │   │   ├── ABTestEntity.java
│   │   │   ├── ABTestArmEntity.java
│   │   │   └── ABTestExecutionEntity.java
│   │   ├── dto/
│   │   │   ├── ABTestRequest.java
│   │   │   ├── ABTestResponse.java
│   │   │   ├── ABTestAnalyticsResponse.java
│   │   │   ├── ExecuteABTestRequest.java
│   │   │   └── ExecutionResultResponse.java
│   │   └── exception/
│   │       └── ABTestException.java
│   │
│   ├── championchallenge/
│   │   ├── controller/
│   │   │   └── ChampionChallengeController.java
│   │   ├── service/
│   │   │   ├── ChampionChallengeService.java
│   │   │   └── ChampionChallengeServiceImpl.java
│   │   ├── repository/
│   │   │   ├── ChampionChallengeExecutionRepository.java
│   │   │   └── ExecutionNodeMetricRepository.java
│   │   ├── entity/
│   │   │   ├── ChampionChallengeExecutionEntity.java
│   │   │   └── ExecutionNodeMetricEntity.java
│   │   ├── dto/
│   │   │   ├── ExecutionRequest.java
│   │   │   ├── ExecutionResponse.java
│   │   │   ├── NodeMetricResponse.java
│   │   │   └── AnalyticsResponse.java
│   │   └── exception/
│   │       └── ChampionChallengeException.java
│   │
│   ├── common/
│   │   ├── service/
│   │   │   └── WorkflowExecutionService.java
│   │   ├── dto/
│   │   │   └── ErrorResponse.java
│   │   └── config/
│   │       ├── H2Config.java
│   │       └── WebConfig.java
│   │
│   └── WorkflowApplication.java
│
└── src/main/resources/
    ├── application.yml
    ├── application-dev.yml
    ├── schema.sql
    └── data.sql
```
