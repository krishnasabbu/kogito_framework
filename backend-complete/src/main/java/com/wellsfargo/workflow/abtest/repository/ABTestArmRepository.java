package com.wellsfargo.workflow.abtest.repository;

import com.wellsfargo.workflow.abtest.entity.ABTestArmEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface ABTestArmRepository extends JpaRepository<ABTestArmEntity, String> {
    @Query("SELECT a FROM ABTestArmEntity a WHERE a.abTest.id = :testId")
    List<ABTestArmEntity> findByAbTestId(@Param("testId") String testId);
}
