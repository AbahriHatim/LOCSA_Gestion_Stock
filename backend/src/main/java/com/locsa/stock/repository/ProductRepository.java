package com.locsa.stock.repository;

import com.locsa.stock.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByNameIgnoreCase(String name);

    @Query("SELECT p FROM Product p WHERE p.minQuantity > 0 AND p.quantity <= p.minQuantity")
    List<Product> findLowStockProducts();

    @Query("SELECT SUM(p.quantity) FROM Product p")
    Long getTotalStock();
}
