package com.locsa.stock.service;

import com.locsa.stock.dto.SiteRequest;
import com.locsa.stock.dto.SiteResponse;
import com.locsa.stock.entity.City;
import com.locsa.stock.entity.Site;
import com.locsa.stock.repository.SiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SiteService {

    private final SiteRepository siteRepository;

    public List<SiteResponse> getAllSites() {
        return siteRepository.findByOrderByNameAsc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<SiteResponse> getSitesByCity(City city) {
        return siteRepository.findByCityOrderByNameAsc(city)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<SiteResponse> getActiveSitesByCity(City city) {
        return siteRepository.findByCityAndActiveTrueOrderByNameAsc(city)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public SiteResponse createSite(SiteRequest request) {
        Site site = Site.builder()
                .name(request.getName().trim())
                .city(request.getCity())
                .active(request.isActive())
                .build();
        return toResponse(siteRepository.save(site));
    }

    public SiteResponse updateSite(Long id, SiteRequest request) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Site introuvable"));
        site.setName(request.getName().trim());
        site.setCity(request.getCity());
        site.setActive(request.isActive());
        return toResponse(siteRepository.save(site));
    }

    public void deleteSite(Long id) {
        if (!siteRepository.existsById(id)) {
            throw new RuntimeException("Site introuvable");
        }
        siteRepository.deleteById(id);
    }

    public SiteResponse toResponse(Site site) {
        return new SiteResponse(site.getId(), site.getName(), site.getCity(), site.isActive());
    }
}
