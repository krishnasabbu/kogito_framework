package com.wellsfargo.workflow.comparison.repository;

import com.wellsfargo.workflow.comparison.entity.ExecutionComparisonEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExecutionComparisonRepository extends JpaRepository<ExecutionComparisonEntity, String> {

    List<ExecutionComparisonEntity> findByComparisonId(String comparisonId);

    List<ExecutionComparisonEntity> findByComparisonIdAndIncluded(String comparisonId, Boolean included);

    List<ExecutionComparisonEntity> findByComparisonIdAndOutlierFlag(String comparisonId, Boolean outlierFlag);

    Optional<ExecutionComparisonEntity> findByComparisonIdAndExecutionId(String comparisonId, String executionId);

    void deleteByComparisonIdAndExecutionId(String comparisonId, String executionId);
}
