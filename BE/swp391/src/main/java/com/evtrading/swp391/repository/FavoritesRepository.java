package com.evtrading.swp391.repository;

import com.evtrading.swp391.entity.Favorites;
import com.evtrading.swp391.entity.FavoritesId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavoritesRepository extends JpaRepository<Favorites, FavoritesId> {
    /**
     * Find all favorites belonging to a user (by the composite id.userID field).
     * This method uses Spring Data property traversal into the EmbeddedId.
     */
    List<Favorites> findByIdUserID(Integer userID);

    /**
     * Find all favorites that reference a particular listing id.
     */
    List<Favorites> findByIdListingID(Integer listingID);
}
