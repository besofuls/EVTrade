package com.evtrading.swp391.entity;
import java.io.Serializable;
import java.util.Objects;
import jakarta.persistence.Embeddable;

@Embeddable
public class FavoritesId implements Serializable {
    private Integer userID;
    private Integer listingID;

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