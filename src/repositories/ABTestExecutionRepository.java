package com.wellsfargo.abtest.repository;

import com.wellsfargo.abtest.entity.ABTestExecutionEntity;
import com.wellsfargo.abtest.entity.ABTestExecutionEntity.ExecutionStatus;
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

    List<ABTestExecutionEntity> findByAbTestIdAndStatus(String abTestId, ExecutionStatus status);

    @Query("SELECT e FROM ABTestExecutionEntity e WHERE e.abTestId = :abTestId AND e.startedAt BETWEEN :startDate AND :endDate")
    List<ABTestExecutionEntity> findByAbTestIdAndDateRange(
        @Param("abTestId") String abTestId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT COUNT(e) FROM ABTestExecutionEntity e WHERE e.abTestId = :abTestId AND e.armId = :armId")
    long countByAbTestIdAndArmId(
        @Param("abTestId") String abTestId,
        @Param("armId") String armId
    );

    @Query("SELECT COUNT(e) FROM ABTestExecutionEntity e WHERE e.abTestId = :abTestId AND e.armId = :armId AND e.status = :status")
    long countByAbTestIdAndArmIdAndStatus(
        @Param("abTestId") String abTestId,
        @Param("armId") String armId,
        @Param("status") ExecutionStatus status
    );

    @Query("SELECT AVG(e.executionTimeMs) FROM ABTestExecutionEntity e WHERE e.abTestId = :abTestId AND e.armId = :armId")
    Double getAverageExecutionTime(
        @Param("abTestId") String abTestId,
        @Param("armId") String armId
    );

    @Query("SELECT MIN(e.executionTimeMs) FROM ABTestExecutionEntity e WHERE e.abTestId = :abTestId AND e.armId = :armId")
    Long getMinExecutionTime(
        @Param("abTestId") String abTestId,
        @Param("armId") String armId
    );

    @Query("SELECT MAX(e.executionTimeMs) FROM ABTestExecutionEntity e WHERE e.abTestId = :abTestId AND e.armId = :armId")
    Long getMaxExecutionTime(
        @Param("abTestId") String abTestId,
        @Param("armId") String armId
    );

    @Query("SELECT e.executionTimeMs FROM ABTestExecutionEntity e WHERE e.abTestId = :abTestId AND e.armId = :armId ORDER BY e.executionTimeMs")
    List<Long> getExecutionTimesForPercentileCalculation(
        @Param("abTestId") String abTestId,
        @Param("armId") String armId
    );

    @Query("SELECT e.errorMessage, COUNT(e) FROM ABTestExecutionEntity e WHERE e.abTestId = :abTestId AND e.armId = :armId AND e.status = 'ERROR' GROUP BY e.errorMessage ORDER BY COUNT(e) DESC")
    List<Object[]> getTopErrorsByArmId(
        @Param("abTestId") String abTestId,
        @Param("armId") String armId
    );

    void deleteByAbTestId(String abTestId);
}
