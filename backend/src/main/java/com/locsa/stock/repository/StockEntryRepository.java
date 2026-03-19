package com.locsa.stock.repository;

import com.locsa.stock.entity.City;
import com.locsa.stock.entity.StockEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface StockEntryRepository extends JpaRepository<StockEntry, Long> {

    List<StockEntry> findAllByOrderByDateEntryDesc();
    List<StockEntry> findTop5ByOrderByDateEntryDesc();
    List<StockEntry> findByCreatedByOrderByDateEntryDesc(String createdBy);

    List<StockEntry> findByCityOrderByDateEntryDesc(City city);
    List<StockEntry> findByCreatedByAndCityOrderByDateEntryDesc(String createdBy, City city);

    @Query("SELECT e FROM StockEntry e WHERE e.dateEntry BETWEEN :from AND :to ORDER BY e.dateEntry ASC")
    List<StockEntry> findByPeriod(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT e FROM StockEntry e WHERE e.city = :city AND e.dateEntry BETWEEN :from AND :to ORDER BY e.dateEntry ASC")
    List<StockEntry> findByPeriodAndCity(@Param("from") LocalDate from, @Param("to") LocalDate to, @Param("city") City city);

    @Query("SELECT COALESCE(SUM(e.quantity), 0) FROM StockEntry e WHERE e.product.id = :productId AND e.city = :city")
    Long getTotalEntriesByProductAndCity(@Param("productId") Long productId, @Param("city") City city);

    @Query("SELECT COALESCE(SUM(e.quantity), 0) FROM StockEntry e WHERE e.city = :city")
    Long getTotalByCity(@Param("city") City city);
}
