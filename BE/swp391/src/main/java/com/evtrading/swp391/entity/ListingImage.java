package com.evtrading.swp391.entity;

import jakarta.persistence.*;

@Entity
public class ListingImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer imageID;

    @ManyToOne
    @JoinColumn(name = "listingID", nullable = false)
    private Listing listing;

    private String imageURL;
    // Indicates if this image is the primary image for the listing
    private Boolean isPrimary;

    // Getters and Setters
    public Integer getImageID() { return imageID; }
    public void setImageID(Integer imageID) { this.imageID = imageID; }
    public Listing getListing() { return listing; }
    public void setListing(Listing listing) { this.listing = listing; }
    public String getImageURL() { return imageURL; }
    public void setImageURL(String imageURL) { this.imageURL = imageURL; }
    public Boolean getIsPrimary() { return isPrimary; }
    public void setIsPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; }

}