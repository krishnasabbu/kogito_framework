package com.wellsfargo.abtest.repository;

import com.wellsfargo.abtest.entity.ABTestEntity;
import com.wellsfargo.abtest.entity.ABTestEntity.TestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ABTestRepository extends JpaRepository<ABTestEntity, String> {

    List<ABTestEntity> findAllByOrderByCreatedAtDesc();

    List<ABTestEntity> findByCreatedBy(String createdBy);

    List<ABTestEntity> findByStatus(TestStatus status);

    List<ABTestEntity> findByWorkflowId(String workflowId);

    @Query("SELECT t FROM ABTestEntity t WHERE t.createdAt BETWEEN :startDate AND :endDate")
    List<ABTestEntity> findByCreatedAtBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT t FROM ABTestEntity t LEFT JOIN FETCH t.arms WHERE t.id = :id")
    Optional<ABTestEntity> findByIdWithArms(@Param("id") String id);

    @Query("SELECT t FROM ABTestEntity t WHERE t.status = :status AND t.startedAt < :dateTime")
    List<ABTestEntity> findByStatusAndStartedAtBefore(
        @Param("status") TestStatus status,
        @Param("dateTime") LocalDateTime dateTime
    );

    long countByStatus(TestStatus status);

    @Query("SELECT COUNT(t) FROM ABTestEntity t WHERE t.status = 'RUNNING' AND t.createdBy = :userId")
    long countRunningTestsByUser(@Param("userId") String userId);

    @Query("SELECT t FROM ABTestEntity t WHERE t.name LIKE %:searchTerm% OR t.description LIKE %:searchTerm%")
    List<ABTestEntity> searchTests(@Param("searchTerm") String searchTerm);
}
