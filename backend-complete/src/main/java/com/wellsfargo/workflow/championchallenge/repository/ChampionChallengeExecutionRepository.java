package com.wellsfargo.workflow.championchallenge.repository;

import com.wellsfargo.workflow.championchallenge.entity.ChampionChallengeExecutionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface ChampionChallengeExecutionRepository extends JpaRepository<ChampionChallengeExecutionEntity, String> {
    List<ChampionChallengeExecutionEntity> findAllByOrderByCreatedAtDesc();

    @Query("SELECT e FROM ChampionChallengeExecutionEntity e LEFT JOIN FETCH e.nodeMetrics WHERE e.id = :id")
    Optional<ChampionChallengeExecutionEntity> findByIdWithMetrics(@Param("id") String id);
}
