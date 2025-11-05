package com.evtrading.swp391.dto;

import java.util.Date;

public class ContractDTO {
    private Integer contractId;
    private Integer orderId;
    private String templateId;
    private String envelopeId;
    private String status;
    private String signedFileUrl;
    private Date signedAt;
    private Date updateAt;
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

    public Integer getContractId() { return contractId; }
    public void setContractId(Integer contractId) { this.contractId = contractId; }
    public Integer getOrderId() { return orderId; }
    public void setOrderId(Integer orderId) { this.orderId = orderId; }
    public String getTemplateId() { return templateId; }
    public void setTemplateId(String templateId) { this.templateId = templateId; }
    public String getEnvelopeId() { return envelopeId; }
    public void setEnvelopeId(String envelopeId) { this.envelopeId = envelopeId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSignedFileUrl() { return signedFileUrl; }
    public void setSignedFileUrl(String signedFileUrl) { this.signedFileUrl = signedFileUrl; }
    public Date getSignedAt() { return signedAt; }
    public void setSignedAt(Date signedAt) { this.signedAt = signedAt; }
    public Date getUpdateAt() { return updateAt; }
    public void setUpdateAt(Date updateAt) { this.updateAt = updateAt; }
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
}
