package com.locsa.stock.repository;

import com.locsa.stock.entity.City;
import com.locsa.stock.entity.StockExit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface StockExitRepository extends JpaRepository<StockExit, Long> {

    List<StockExit> findAllByOrderByDateExitDesc();
    List<StockExit> findTop5ByOrderByDateExitDesc();
    List<StockExit> findByCreatedByOrderByDateExitDesc(String createdBy);

    List<StockExit> findByCityOrderByDateExitDesc(City city);
    List<StockExit> findByCreatedByAndCityOrderByDateExitDesc(String createdBy, City city);

    @Query("SELECT e FROM StockExit e WHERE e.dateExit BETWEEN :from AND :to ORDER BY e.dateExit ASC")
    List<StockExit> findByPeriod(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT e FROM StockExit e WHERE e.city = :city AND e.dateExit BETWEEN :from AND :to ORDER BY e.dateExit ASC")
    List<StockExit> findByPeriodAndCity(@Param("from") LocalDate from, @Param("to") LocalDate to, @Param("city") City city);

    @Query("SELECT COALESCE(SUM(e.quantity), 0) FROM StockExit e WHERE e.product.id = :productId AND e.city = :city")
    Long getTotalExitsByProductAndCity(@Param("productId") Long productId, @Param("city") City city);

    @Query("SELECT COALESCE(SUM(e.quantity), 0) FROM StockExit e WHERE e.city = :city")
    Long getTotalByCity(@Param("city") City city);
}
