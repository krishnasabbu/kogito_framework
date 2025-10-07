package com.wellsfargo.workflow.championchallenge.repository;

import com.wellsfargo.workflow.championchallenge.entity.ExecutionNodeMetricEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface ExecutionNodeMetricRepository extends JpaRepository<ExecutionNodeMetricEntity, String> {
    @Query("SELECT m FROM ExecutionNodeMetricEntity m WHERE m.execution.id = :executionId")
    List<ExecutionNodeMetricEntity> findByExecutionId(@Param("executionId") String executionId);

    @Query("SELECT m FROM ExecutionNodeMetricEntity m WHERE m.execution.id = :executionId AND m.variant = :variant")
    List<ExecutionNodeMetricEntity> findByExecutionIdAndVariant(@Param("executionId") String executionId, @Param("variant") String variant);
}
