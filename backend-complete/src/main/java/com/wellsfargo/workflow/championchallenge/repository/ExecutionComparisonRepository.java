package com.wellsfargo.workflow.championchallenge.repository;

import com.wellsfargo.workflow.championchallenge.entity.ExecutionComparisonEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface ExecutionComparisonRepository extends JpaRepository<ExecutionComparisonEntity, String> {
    @Query("SELECT c FROM ExecutionComparisonEntity c WHERE c.execution.id = :executionId")
    List<ExecutionComparisonEntity> findByExecutionId(@Param("executionId") String executionId);
}
