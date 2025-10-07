package com.wellsfargo.workflow.abtest.repository;

import com.wellsfargo.workflow.abtest.entity.ABTestExecutionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface ABTestExecutionRepository extends JpaRepository<ABTestExecutionEntity, String> {
    List<ABTestExecutionEntity> findByAbTestId(String abTestId);
    List<ABTestExecutionEntity> findByAbTestIdAndArmId(String abTestId, String armId);

    @Query("SELECT COUNT(e) FROM ABTestExecutionEntity e WHERE e.abTestId = :testId AND e.armId = :armId AND e.status = :status")
    long countByTestArmStatus(@Param("testId") String testId, @Param("armId") String armId, @Param("status") ABTestExecutionEntity.ExecutionStatus status);

    @Query("SELECT e.executionTimeMs FROM ABTestExecutionEntity e WHERE e.abTestId = :testId AND e.armId = :armId ORDER BY e.executionTimeMs")
    List<Long> getExecutionTimesForPercentile(@Param("testId") String testId, @Param("armId") String armId);
}
