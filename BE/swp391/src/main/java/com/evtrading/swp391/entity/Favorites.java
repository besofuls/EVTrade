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