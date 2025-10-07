package com.wellsfargo.abtest.repository;

import com.wellsfargo.abtest.entity.ABTestArmEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ABTestArmRepository extends JpaRepository<ABTestArmEntity, String> {

    List<ABTestArmEntity> findByAbTestId(String abTestId);

    Optional<ABTestArmEntity> findByAbTestIdAndIsControl(String abTestId, Boolean isControl);

    @Query("SELECT a FROM ABTestArmEntity a WHERE a.abTest.id = :abTestId ORDER BY a.trafficPercentage DESC")
    List<ABTestArmEntity> findByAbTestIdOrderByTrafficPercentage(@Param("abTestId") String abTestId);

    @Query("SELECT SUM(a.totalExecutions) FROM ABTestArmEntity a WHERE a.abTest.id = :abTestId")
    Long getTotalExecutionsByTestId(@Param("abTestId") String abTestId);

    @Query("SELECT AVG(a.successRate) FROM ABTestArmEntity a WHERE a.abTest.id = :abTestId")
    Double getAverageSuccessRateByTestId(@Param("abTestId") String abTestId);

    @Query("SELECT a FROM ABTestArmEntity a WHERE a.abTest.id = :abTestId AND a.successRate = (SELECT MAX(a2.successRate) FROM ABTestArmEntity a2 WHERE a2.abTest.id = :abTestId)")
    Optional<ABTestArmEntity> findBestPerformingArm(@Param("abTestId") String abTestId);

    void deleteByAbTestId(String abTestId);
}
