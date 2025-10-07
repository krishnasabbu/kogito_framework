package com.wellsfargo.championchallenge.repository;

import com.wellsfargo.championchallenge.entity.ChampionChallengeExecutionEntity;
import com.wellsfargo.championchallenge.entity.ChampionChallengeExecutionEntity.ExecutionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChampionChallengeExecutionRepository extends JpaRepository<ChampionChallengeExecutionEntity, String> {

    List<ChampionChallengeExecutionEntity> findAllByOrderByCreatedAtDesc();

    List<ChampionChallengeExecutionEntity> findByCreatedBy(String createdBy);

    List<ChampionChallengeExecutionEntity> findByStatus(ExecutionStatus status);

    List<ChampionChallengeExecutionEntity> findByChampionWorkflowId(String championWorkflowId);

    List<ChampionChallengeExecutionEntity> findByChallengeWorkflowId(String challengeWorkflowId);

    @Query("SELECT e FROM ChampionChallengeExecutionEntity e WHERE e.createdAt BETWEEN :startDate AND :endDate")
    List<ChampionChallengeExecutionEntity> findByCreatedAtBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT e FROM ChampionChallengeExecutionEntity e LEFT JOIN FETCH e.metrics WHERE e.id = :id")
    Optional<ChampionChallengeExecutionEntity> findByIdWithMetrics(@Param("id") String id);

    long countByStatus(ExecutionStatus status);

    @Query("SELECT AVG(e.totalChampionTimeMs) FROM ChampionChallengeExecutionEntity e WHERE e.status = 'COMPLETED'")
    Double getAverageChampionTime();

    @Query("SELECT AVG(e.totalChallengeTimeMs) FROM ChampionChallengeExecutionEntity e WHERE e.status = 'COMPLETED'")
    Double getAverageChallengeTime();
}
