package com.locsa.stock.service;

import com.locsa.stock.dto.PageResponse;
import com.locsa.stock.dto.ProductHistoryItem;
import com.locsa.stock.dto.ProductRequest;
import com.locsa.stock.dto.ProductResponse;
import com.locsa.stock.entity.City;
import com.locsa.stock.entity.Product;
import com.locsa.stock.repository.InventoryRepository;
import com.locsa.stock.repository.ProductRepository;
import com.locsa.stock.repository.StockEntryRepository;
import com.locsa.stock.repository.StockExitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final AuditService auditService;
    private final StockEntryRepository stockEntryRepository;
    private final StockExitRepository stockExitRepository;
    private final InventoryRepository inventoryRepository;

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getAllProductsForCity(City city) {
        // Batch queries — 2 queries total instead of 2×N
        Map<Long, Long> entriesMap = new HashMap<>();
        for (Object[] row : stockEntryRepository.getTotalEntriesPerProductForCity(city)) {
            entriesMap.put((Long) row[0], ((Number) row[1]).longValue());
        }
        Map<Long, Long> exitsMap = new HashMap<>();
        for (Object[] row : stockExitRepository.getTotalExitsPerProductForCity(city)) {
            exitsMap.put((Long) row[0], ((Number) row[1]).longValue());
        }
        return productRepository.findAll().stream().map(p -> {
            long cityStock = entriesMap.getOrDefault(p.getId(), 0L) - exitsMap.getOrDefault(p.getId(), 0L);
            return new ProductResponse(p.getId(), p.getName(), p.getDescription(),
                    cityStock, p.getCategory(), p.getMinQuantity());
        }).collect(Collectors.toList());
    }

    public PageResponse<ProductResponse> getAllProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        org.springframework.data.domain.Page<Product> productPage = productRepository.findAll(pageable);
        return PageResponse.of(productPage, productPage.getContent().stream().map(this::toResponse).collect(Collectors.toList()));
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return toResponse(product);
    }

    public ProductResponse createProduct(ProductRequest request) {
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .quantity(request.getQuantity())
                .category(request.getCategory() != null ? request.getCategory() : com.locsa.stock.entity.Category.C)
                .minQuantity(request.getMinQuantity() != null ? request.getMinQuantity() : 0L)
                .build();
        product = productRepository.save(product);
        auditService.log("PRODUCT", product.getId(), "CREATE", "system", "Produit créé: " + product.getName(), null);
        return toResponse(product);
    }

    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setQuantity(request.getQuantity());
        if (request.getCategory() != null) product.setCategory(request.getCategory());
        if (request.getMinQuantity() != null) product.setMinQuantity(request.getMinQuantity());
        product = productRepository.save(product);
        auditService.log("PRODUCT", id, "UPDATE", "system", "Produit modifié: " + product.getName(), null);
        return toResponse(product);
    }

    @Transactional
    public void deleteProduct(Long id, City city) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        String name = product.getName();

        if (city == null) {
            // Delete all — remove product entirely
            inventoryRepository.deleteByProductId(id);
            stockEntryRepository.deleteByProductId(id);
            stockExitRepository.deleteByProductId(id);
            auditService.log("PRODUCT", id, "DELETE", "system",
                    "Produit supprimé (toutes villes): " + name, null);
            productRepository.deleteById(id);
        } else {
            // Delete only records for the given city, adjust global stock
            Long cityEntries = stockEntryRepository.getTotalEntriesByProductAndCity(id, city);
            Long cityExits   = stockExitRepository.getTotalExitsByProductAndCity(id, city);
            long cityNet = (cityEntries == null ? 0 : cityEntries) - (cityExits == null ? 0 : cityExits);

            inventoryRepository.deleteByProductIdAndCity(id, city);
            stockEntryRepository.deleteByProductIdAndCity(id, city);
            stockExitRepository.deleteByProductIdAndCity(id, city);

            // Adjust global stock
            product.setQuantity(Math.max(0, product.getQuantity() - cityNet));
            productRepository.save(product);

            auditService.log("PRODUCT", id, "UPDATE", "system",
                    "Données supprimées pour ville " + city.name() + ": " + name, city);
        }
    }

    public PageResponse<ProductHistoryItem> getProductHistory(Long productId, City city, int page, int size) {
        productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produit introuvable"));

        List<ProductHistoryItem> history = new ArrayList<>();

        // Entries
        (city != null
                ? stockEntryRepository.findByProductIdAndCityOrderByDateEntryDesc(productId, city)
                : stockEntryRepository.findByProductIdOrderByDateEntryDesc(productId)
        ).forEach(e -> history.add(new ProductHistoryItem(
                "ENTRY", e.getReference(), e.getDateEntry(), e.getQuantity(),
                e.getCity() != null ? e.getCity().name() : null,
                e.getCreatedBy(),
                e.getStation() != null ? "Station: " + e.getStation() : e.getComment(),
                null
        )));

        // Exits
        (city != null
                ? stockExitRepository.findByProductIdAndCityOrderByDateExitDesc(productId, city)
                : stockExitRepository.findByProductIdOrderByDateExitDesc(productId)
        ).forEach(e -> history.add(new ProductHistoryItem(
                "EXIT", e.getReference(), e.getDateExit(), e.getQuantity(),
                e.getCity() != null ? e.getCity().name() : null,
                e.getCreatedBy(),
                e.getBeneficiary() != null ? "Bénéficiaire: " + e.getBeneficiary() : e.getComment(),
                null
        )));

        // Inventory
        inventoryRepository.findByProductIdOrderByDateInventoryDesc(productId)
                .forEach(i -> history.add(new ProductHistoryItem(
                        "INVENTORY", null, i.getDateInventory(), i.getRealQuantity(),
                        i.getCity() != null ? i.getCity().name() : null,
                        i.getCreatedBy(),
                        "Inventaire — écart: " + (i.getDifference() >= 0 ? "+" : "") + i.getDifference()
                                + (i.getAdjustmentComment() != null ? " (" + i.getAdjustmentComment() + ")" : ""),
                        i.getDifference()
                )));

        history.sort((a, b) -> b.getDate().compareTo(a.getDate()));

        int total = history.size();
        int totalPages = size > 0 ? (int) Math.ceil((double) total / size) : 1;
        int from = size > 0 ? page * size : 0;
        int to   = size > 0 ? Math.min(from + size, total) : total;
        List<ProductHistoryItem> pageContent = (from < total) ? history.subList(from, to) : List.of();

        return new PageResponse<>(pageContent, total, totalPages, page, size > 0 ? size : total);
    }

    public ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getQuantity(),
                product.getCategory(),
                product.getMinQuantity()
        );
    }
}
