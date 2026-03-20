package com.locsa.stock.service;

import com.locsa.stock.entity.ReferenceCounter;
import com.locsa.stock.repository.ReferenceCounterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ReferenceService {

    private final ReferenceCounterRepository referenceCounterRepository;

    public String generateReference(String prefix) {
        int year = LocalDate.now().getYear();

        Optional<ReferenceCounter> existing = referenceCounterRepository.findByPrefixAndYearForUpdate(prefix, year);

        ReferenceCounter counter;
        if (existing.isEmpty()) {
            counter = ReferenceCounter.builder()
                    .prefix(prefix)
                    .year(year)
                    .lastSequence(1L)
                    .build();
            referenceCounterRepository.save(counter);
        } else {
            counter = existing.get();
            counter.setLastSequence(counter.getLastSequence() + 1);
            referenceCounterRepository.save(counter);
        }

        return prefix + "-" + year + "-" + String.format("%04d", counter.getLastSequence());
    }
}
