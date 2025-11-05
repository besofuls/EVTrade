package com.evtrading.swp391.entity;
import java.io.Serializable;
import java.util.Objects;
import jakarta.persistence.Embeddable;

@Embeddable
public class FavoritesId implements Serializable {
    private Integer userID;
    private Integer listingID;

    // Getters and setters
    public Integer getUserID() {
        return userID;
    }

    public void setUserID(Integer userID) {
        this.userID = userID;
    }

    public Integer getListingID() {
        return listingID;
    }

    public void setListingID(Integer listingID) {
        this.listingID = listingID;
    }

    // equals, hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FavoritesId)) return false;
        FavoritesId that = (FavoritesId) o;
        return Objects.equals(userID, that.userID) && Objects.equals(listingID, that.listingID);
    }
    @Override
    public int hashCode() {
        return Objects.hash(userID, listingID);
    }
}

/*
    Notes on FavoritesId:
    - This is the embedded composite key for Favorites with fields (userID, listingID).
    - equals() and hashCode() are essential because this type participates in
      primary-key equality comparisons and keys in collections/maps.
    - When constructing FavoritesId in code, make sure to set both fields before
      using it as a key (e.g., favoritesRepository.existsById(id)).
*/