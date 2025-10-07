# A/B Testing Backend - Part 2 (Repositories, Services, Controllers)

## File: abtest/repository/ABTestRepository.java
```java
package com.wellsfargo.workflow.abtest.repository;

import com.wellsfargo.workflow.abtest.entity.ABTestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ABTestRepository extends JpaRepository<ABTestEntity, String> {
    List<ABTestEntity> findAllByOrderByCreatedAtDesc();
    List<ABTestEntity> findByCreatedBy(String createdBy);
    List<ABTestEntity> findByStatus(ABTestEntity.TestStatus status);

    @Query("SELECT t FROM ABTestEntity t LEFT JOIN FETCH t.arms WHERE t.id = :id")
    Optional<ABTestEntity> findByIdWithArms(@Param("id") String id);

    @Query("SELECT COUNT(t) FROM ABTestEntity t WHERE t.status = 'RUNNING' AND t.createdBy = :userId")
    long countRunningTestsByUser(@Param("userId") String userId);
}
```

## File: abtest/repository/ABTestArmRepository.java
```java
package com.wellsfargo.workflow.abtest.repository;

import com.wellsfargo.workflow.abtest.entity.ABTestArmEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ABTestArmRepository extends JpaRepository<ABTestArmEntity, String> {
    @Query("SELECT a FROM ABTestArmEntity a WHERE a.abTest.id = :testId")
    List<ABTestArmEntity> findByAbTestId(@Param("testId") String testId);

    @Query("SELECT a FROM ABTestArmEntity a WHERE a.abTest.id = :testId AND a.isControl = :isControl")
    Optional<ABTestArmEntity> findByAbTestIdAndIsControl(@Param("testId") String testId, @Param("isControl") Boolean isControl);

    @Query("SELECT SUM(a.totalExecutions) FROM ABTestArmEntity a WHERE a.abTest.id = :testId")
    Long getTotalExecutionsByTestId(@Param("testId") String testId);
}
```

## File: abtest/repository/ABTestExecutionRepository.java
```java
package com.wellsfargo.workflow.abtest.repository;

import com.wellsfargo.workflow.abtest.entity.ABTestExecutionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ABTestExecutionRepository extends JpaRepository<ABTestExecutionEntity, String> {
    List<ABTestExecutionEntity> findByAbTestId(String abTestId);
    List<ABTestExecutionEntity> findByArmId(String armId);
    List<ABTestExecutionEntity> findByAbTestIdAndArmId(String abTestId, String armId);

    @Query("SELECT COUNT(e) FROM ABTestExecutionEntity e WHERE e.abTestId = :testId AND e.armId = :armId")
    long countByAbTestIdAndArmId(@Param("testId") String testId, @Param("armId") String armId);

    @Query("SELECT COUNT(e) FROM ABTestExecutionEntity e WHERE e.abTestId = :testId AND e.armId = :armId AND e.status = :status")
    long countByAbTestIdAndArmIdAndStatus(@Param("testId") String testId, @Param("armId") String armId, @Param("status") ABTestExecutionEntity.ExecutionStatus status);

    @Query("SELECT AVG(e.executionTimeMs) FROM ABTestExecutionEntity e WHERE e.abTestId = :testId AND e.armId = :armId")
    Double getAverageExecutionTime(@Param("testId") String testId, @Param("armId") String armId);

    @Query("SELECT e.executionTimeMs FROM ABTestExecutionEntity e WHERE e.abTestId = :testId AND e.armId = :armId ORDER BY e.executionTimeMs")
    List<Long> getExecutionTimesForPercentile(@Param("testId") String testId, @Param("armId") String armId);
}
```

## File: abtest/service/ABTestService.java
```java
package com.wellsfargo.workflow.abtest.service;

import com.wellsfargo.workflow.abtest.dto.*;
import java.util.List;

public interface ABTestService {
    ABTestResponse createABTest(ABTestRequest request, String userId);
    ABTestResponse startABTest(String testId);
    ABTestResponse stopABTest(String testId);
    String executeABTest(String testId, ExecuteABTestRequest request);
    ABTestResponse getABTest(String testId);
    List<ABTestResponse> listABTests();
    ABTestAnalyticsResponse getAnalytics(String testId);
    void updateArmMetrics(String armId);
}
```

CONTINUED IN NEXT FILE DUE TO LENGTH...
