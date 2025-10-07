package com.wellsfargo.championchallenge.repository;

import com.wellsfargo.championchallenge.entity.ExecutionNodeMetricEntity;
import com.wellsfargo.championchallenge.entity.ExecutionNodeMetricEntity.Variant;
import com.wellsfargo.championchallenge.entity.ExecutionNodeMetricEntity.MetricStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExecutionNodeMetricRepository extends JpaRepository<ExecutionNodeMetricEntity, String> {

    List<ExecutionNodeMetricEntity> findByExecutionId(String executionId);

    List<ExecutionNodeMetricEntity> findByExecutionIdAndVariant(String executionId, Variant variant);

    List<ExecutionNodeMetricEntity> findByExecutionIdAndStatus(String executionId, MetricStatus status);

    @Query("SELECT m FROM ExecutionNodeMetricEntity m WHERE m.execution.id = :executionId AND m.variant = :variant ORDER BY m.startedAt ASC")
    List<ExecutionNodeMetricEntity> findByExecutionIdAndVariantOrderedByStartTime(
        @Param("executionId") String executionId,
        @Param("variant") Variant variant
    );

    @Query("SELECT COUNT(m) FROM ExecutionNodeMetricEntity m WHERE m.execution.id = :executionId AND m.variant = :variant AND m.status = :status")
    long countByExecutionIdAndVariantAndStatus(
        @Param("executionId") String executionId,
        @Param("variant") Variant variant,
        @Param("status") MetricStatus status
    );

    @Query("SELECT SUM(m.executionTimeMs) FROM ExecutionNodeMetricEntity m WHERE m.execution.id = :executionId AND m.variant = :variant")
    Long sumExecutionTimeByExecutionIdAndVariant(
        @Param("executionId") String executionId,
        @Param("variant") Variant variant
    );

    @Query("SELECT AVG(m.executionTimeMs) FROM ExecutionNodeMetricEntity m WHERE m.execution.id = :executionId AND m.variant = :variant")
    Double avgExecutionTimeByExecutionIdAndVariant(
        @Param("executionId") String executionId,
        @Param("variant") Variant variant
    );

    void deleteByExecutionId(String executionId);
}
