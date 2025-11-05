package com.evtrading.swp391.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
public class Contract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer contractID;

    @OneToOne
    @JoinColumn(name = "orderID", unique = true)
    private Order order;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String content;

    private String docusealTemplateID;
    private String docusealEnvelopeID;
    private String sellerEmail;
    private String sellerName;
    private String sellerStatus;
    private String sellerSigningUrl;
    private Date sellerSignedAt;
    private String buyerEmail;
    private String buyerName;
    private String buyerStatus;
    private String buyerSigningUrl;
    private Date buyerSignedAt;
    private String status;
    private String signedFileUrl;
    private Date signedAt;
    private Date createAt;
    private Date updateAt;

    // Getters and Setters
    public Integer getContractID() { return contractID; }
    public void setContractID(Integer contractID) { this.contractID = contractID; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getDocusealTemplateID() { return docusealTemplateID; }
    public void setDocusealTemplateID(String docusealTemplateID) { this.docusealTemplateID = docusealTemplateID; }
    public String getDocusealEnvelopeID() { return docusealEnvelopeID; }
    public void setDocusealEnvelopeID(String docusealEnvelopeID) { this.docusealEnvelopeID = docusealEnvelopeID; }
    public String getSellerEmail() { return sellerEmail; }
    public void setSellerEmail(String sellerEmail) { this.sellerEmail = sellerEmail; }
    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }
    public String getSellerStatus() { return sellerStatus; }
    public void setSellerStatus(String sellerStatus) { this.sellerStatus = sellerStatus; }
    public String getSellerSigningUrl() { return sellerSigningUrl; }
    public void setSellerSigningUrl(String sellerSigningUrl) { this.sellerSigningUrl = sellerSigningUrl; }
    public Date getSellerSignedAt() { return sellerSignedAt; }
    public void setSellerSignedAt(Date sellerSignedAt) { this.sellerSignedAt = sellerSignedAt; }
    public String getBuyerEmail() { return buyerEmail; }
    public void setBuyerEmail(String buyerEmail) { this.buyerEmail = buyerEmail; }
    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }
    public String getBuyerStatus() { return buyerStatus; }
    public void setBuyerStatus(String buyerStatus) { this.buyerStatus = buyerStatus; }
    public String getBuyerSigningUrl() { return buyerSigningUrl; }
    public void setBuyerSigningUrl(String buyerSigningUrl) { this.buyerSigningUrl = buyerSigningUrl; }
    public Date getBuyerSignedAt() { return buyerSignedAt; }
    public void setBuyerSignedAt(Date buyerSignedAt) { this.buyerSignedAt = buyerSignedAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSignedFileUrl() { return signedFileUrl; }
    public void setSignedFileUrl(String signedFileUrl) { this.signedFileUrl = signedFileUrl; }
    public Date getSignedAt() { return signedAt; }
    public void setSignedAt(Date signedAt) { this.signedAt = signedAt; }
    public Date getCreateAt() { return createAt; }
    public void setCreateAt(Date createAt) { this.createAt = createAt; }
    public Date getUpdateAt() { return updateAt; }
    public void setUpdateAt(Date updateAt) { this.updateAt = updateAt; }
    
}