package com.locsa.stock.repository;

import com.locsa.stock.entity.City;
import com.locsa.stock.entity.Inventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    List<Inventory> findAllByOrderByDateInventoryDesc();
    List<Inventory> findByCreatedByOrderByDateInventoryDesc(String createdBy);
    List<Inventory> findByCityOrderByDateInventoryDesc(City city);
    List<Inventory> findByCreatedByAndCityOrderByDateInventoryDesc(String createdBy, City city);

    Page<Inventory> findAllByOrderByDateInventoryDesc(Pageable pageable);
    Page<Inventory> findByCityOrderByDateInventoryDesc(City city, Pageable pageable);
    Page<Inventory> findByCreatedByOrderByDateInventoryDesc(String createdBy, Pageable pageable);
    Page<Inventory> findByCreatedByAndCityOrderByDateInventoryDesc(String createdBy, City city, Pageable pageable);

    List<Inventory> findByProductIdOrderByDateInventoryDesc(Long productId);

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.difference < 0")
    long countNegativeGap();

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.difference > 0")
    long countPositiveGap();
}
