package com.wellsfargo.workflow.abtest.repository;

import com.wellsfargo.workflow.abtest.entity.ABTestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface ABTestRepository extends JpaRepository<ABTestEntity, String> {
    List<ABTestEntity> findAllByOrderByCreatedAtDesc();

    @Query("SELECT t FROM ABTestEntity t LEFT JOIN FETCH t.arms WHERE t.id = :id")
    Optional<ABTestEntity> findByIdWithArms(@Param("id") String id);
}
