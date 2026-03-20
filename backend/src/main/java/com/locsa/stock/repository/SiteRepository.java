package com.locsa.stock.repository;

import com.locsa.stock.entity.City;
import com.locsa.stock.entity.Site;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SiteRepository extends JpaRepository<Site, Long> {
    List<Site> findByOrderByNameAsc();
    List<Site> findByCityOrderByNameAsc(City city);
    List<Site> findByActiveTrueOrderByNameAsc();
    List<Site> findByCityAndActiveTrueOrderByNameAsc(City city);
}
