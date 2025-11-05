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
    private String signerEmail;
    private String signerName;
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
    public String getSignerEmail() { return signerEmail; }
    public void setSignerEmail(String signerEmail) { this.signerEmail = signerEmail; }
    public String getSignerName() { return signerName; }
    public void setSignerName(String signerName) { this.signerName = signerName; }
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