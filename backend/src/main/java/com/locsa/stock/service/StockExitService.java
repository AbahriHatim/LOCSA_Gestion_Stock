package com.locsa.stock.service;

import com.locsa.stock.dto.StockExitRequest;
import com.locsa.stock.dto.StockExitResponse;
import com.locsa.stock.entity.City;
import com.locsa.stock.entity.Product;
import com.locsa.stock.entity.StockExit;
import com.locsa.stock.repository.ProductRepository;
import com.locsa.stock.repository.StockEntryRepository;
import com.locsa.stock.repository.StockExitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockExitService {

    private final StockExitRepository stockExitRepository;
    private final StockEntryRepository stockEntryRepository;
    private final ProductRepository productRepository;

    public List<StockExitResponse> getAllExits(String username, boolean isAdmin, City city) {
        List<StockExit> exits;
        if (city != null) {
            exits = isAdmin
                    ? stockExitRepository.findByCityOrderByDateExitDesc(city)
                    : stockExitRepository.findByCreatedByAndCityOrderByDateExitDesc(username, city);
        } else {
            exits = isAdmin
                    ? stockExitRepository.findAllByOrderByDateExitDesc()
                    : stockExitRepository.findByCreatedByOrderByDateExitDesc(username);
        }
        return exits.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public StockExitResponse createExit(StockExitRequest request, String username, City forcedCity) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Produit introuvable"));

        City city = forcedCity != null ? forcedCity : request.getCity();
        if (city == null) throw new RuntimeException("La ville est requise");

        // Validate against per-city stock
        Long cityEntries = stockEntryRepository.getTotalEntriesByProductAndCity(product.getId(), city);
        Long cityExits   = stockExitRepository.getTotalExitsByProductAndCity(product.getId(), city);
        Long cityStock   = cityEntries - cityExits;

        if (cityStock < request.getQuantity()) {
            throw new RuntimeException(
                "Stock insuffisant à " + city.name().charAt(0) + city.name().substring(1).toLowerCase()
                + ". Disponible : " + cityStock + ", Demandé : " + request.getQuantity()
            );
        }

        StockExit exit = StockExit.builder()
                .product(product)
                .dateExit(request.getDateExit())
                .quantity(request.getQuantity())
                .beneficiary(request.getBeneficiary())
                .comment(request.getComment())
                .createdBy(username)
                .city(city)
                .build();

        stockExitRepository.save(exit);
        product.setQuantity(product.getQuantity() - request.getQuantity());
        productRepository.save(product);

        return toResponse(exit);
    }

    public StockExitResponse toResponse(StockExit exit) {
        return new StockExitResponse(
                exit.getId(),
                exit.getProduct().getName(),
                exit.getDateExit(),
                exit.getQuantity(),
                exit.getBeneficiary(),
                exit.getComment(),
                exit.getCreatedBy(),
                exit.getCity()
        );
    }

    public List<StockExitResponse> getRecentExits() {
        return stockExitRepository.findTop5ByOrderByDateExitDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}
