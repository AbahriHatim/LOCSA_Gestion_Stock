package com.locsa.stock.repository;

import com.locsa.stock.entity.ReferenceCounter;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ReferenceCounterRepository extends JpaRepository<ReferenceCounter, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM ReferenceCounter r WHERE r.prefix = :prefix AND r.year = :year")
    Optional<ReferenceCounter> findByPrefixAndYearForUpdate(@Param("prefix") String prefix, @Param("year") int year);
}
