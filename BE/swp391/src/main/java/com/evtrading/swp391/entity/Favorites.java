package com.evtrading.swp391.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "Favorites")
public class Favorites {
    @EmbeddedId
    private FavoritesId id;

    @ManyToOne
    @MapsId("userID")
    @JoinColumn(name = "userID")
    private User user;

    @ManyToOne
    @MapsId("listingID")
    @JoinColumn(name = "listingID")
    private Listing listing;

    private Date createdAt;

    // Getters and Setters
    public FavoritesId getId() { return id; }
    public void setId(FavoritesId id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Listing getListing() { return listing; }
    public void setListing(Listing listing) { this.listing = listing; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}

/*
        Notes on Favorites mapping:
        - This entity uses a composite primary key implemented via @EmbeddedId -> FavoritesId.
        - The @MapsId("userID") and @MapsId("listingID") mappings tell Hibernate to use the
            values from the associated User and Listing entities to populate the embedded id.
            Therefore before persisting a Favorites entity you must set both
            - favorites.setId(...) and
            - favorites.setUser(userEntity) and favorites.setListing(listingEntity)
            or at minimum set the relations so that Hibernate can populate the foreign keys.
        - This pattern avoids a separate surrogate key and keeps the natural composite
            (userID, listingID) as the primary key.
*/