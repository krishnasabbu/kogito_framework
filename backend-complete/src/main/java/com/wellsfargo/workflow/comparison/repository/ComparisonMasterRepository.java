package com.wellsfargo.workflow.comparison.repository;

import com.wellsfargo.workflow.comparison.entity.ComparisonMasterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComparisonMasterRepository extends JpaRepository<ComparisonMasterEntity, String> {

    List<ComparisonMasterEntity> findAllByOrderByCreatedAtDesc();

    List<ComparisonMasterEntity> findByStatus(String status);

    List<ComparisonMasterEntity> findByChampionWorkflowIdAndChallengeWorkflowId(
            String championWorkflowId, String challengeWorkflowId);

    @Query("SELECT c FROM ComparisonMasterEntity c LEFT JOIN FETCH c.executionMappings WHERE c.id = :id")
    Optional<ComparisonMasterEntity> findByIdWithMappings(String id);
}
