package com.evtrading.swp391.service;

import com.evtrading.swp391.entity.Listing;
import com.evtrading.swp391.entity.ListingImage;
import com.evtrading.swp391.entity.User;
import com.evtrading.swp391.repository.ListingImageRepository;
import com.evtrading.swp391.repository.ListingRepository;
import com.evtrading.swp391.repository.SystemConfigRepository;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class SpamFilterService {
    private final ListingRepository listingRepository;
    private final ListingImageRepository listingImageRepository;
    private final SystemConfigRepository systemConfigRepository;

    // Simple banned keywords list (could be loaded from SystemConfig)
    private final List<String> bannedKeywords = List.of("liên hệ ngay", "hot deal", "siêu rẻ", "hot", "contact now", "sale");

    public SpamFilterService(ListingRepository listingRepository, ListingImageRepository listingImageRepository, SystemConfigRepository systemConfigRepository) {
        this.listingRepository = listingRepository;
        this.listingImageRepository = listingImageRepository;
        this.systemConfigRepository = systemConfigRepository;
    }

    public static class SpamResult {
        public boolean flagged = false;
        public List<String> reasons = new ArrayList<>();
    }

    public SpamResult check(Listing listing, List<String> imageUrls) {
        SpamResult result = new SpamResult();

        // 1) Duplicate title
        long sameTitle = listingRepository.countByTitleIgnoreCase(listing.getTitle());
        if (sameTitle > 0) {
            result.flagged = true;
            result.reasons.add("Duplicate title");
        }

        // 2) Duplicate images by exact URL match
        if (imageUrls != null) {
            for (String url : imageUrls) {
                // check if other listings have same image URL
                // naive: check all listing images
                List<ListingImage> hits = listingImageRepository.findAll().stream()
                        .filter(img -> img.getImageURL() != null && img.getImageURL().equals(url))
                        .toList();
                if (!hits.isEmpty()) {
                    result.flagged = true;
                    result.reasons.add("Duplicate image URL detected");
                    break;
                }
            }
        }

        // 3) Posting rate
        // Read threshold from SystemConfig or default to 5 per 24h
        int threshold = 5;
        try {
            var opt = systemConfigRepository.findByConfigKey("spam.maxPostsPer24h");
            if (opt.isPresent()) threshold = Integer.parseInt(opt.get().getConfigValue());
        } catch (Exception ignored) {}
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.HOUR, -24);
        Date since = cal.getTime();
        long recentCount = listingRepository.countByUserUserIDAndCreatedAtAfter(listing.getUser().getUserID(), since);
        if (recentCount >= threshold) {
            result.flagged = true;
            result.reasons.add("Too many posts in 24h");
        }

        // 4) Price anomaly: compare to average price in category
        if (listing.getCategory() != null) {
            List<Listing> sameCategory = listingRepository.findAllByCategoryCategoryID(listing.getCategory().getCategoryID());
            double avg = sameCategory.stream().filter(l -> l.getPrice() != null).mapToDouble(l -> l.getPrice().doubleValue()).average().orElse(0.0);
            if (avg > 0) {
                double price = listing.getPrice() != null ? listing.getPrice().doubleValue() : 0.0;
                if (price > 0 && (price < avg * 0.2 || price > avg * 5)) {
                    result.flagged = true;
                    result.reasons.add("Price anomalous compared to category average");
                }
            }
        }

        // 5) Banned keywords in title/description
        String combined = (listing.getTitle() == null ? "" : listing.getTitle()).toLowerCase() + " " + (listing.getDescription() == null ? "" : listing.getDescription()).toLowerCase();
        for (String kw : bannedKeywords) {
            Pattern p = Pattern.compile(Pattern.quote(kw.toLowerCase()));
            if (p.matcher(combined).find()) {
                result.flagged = true;
                result.reasons.add("Banned keyword: " + kw);
                break;
            }
        }

        return result;
    }
}
