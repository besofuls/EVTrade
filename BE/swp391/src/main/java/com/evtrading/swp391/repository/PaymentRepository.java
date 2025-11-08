package com.evtrading.swp391.repository;

import com.evtrading.swp391.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.evtrading.swp391.entity.Transaction;
import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    List<Payment> findByTransactionOrderByPaidAtDesc(Transaction transaction);
    Optional<Payment> findFirstByTransactionAndStatus(Transaction transaction, String status);
    Optional<Payment> findByTxnRef(String txnRef);
    List<Payment> findAllByStatus(String status);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p " +
           "WHERE (:status IS NULL OR LOWER(p.status) = LOWER(:status)) " +
           "AND (:prefix IS NULL OR UPPER(p.txnRef) LIKE CONCAT(UPPER(:prefix), '%'))")
    BigDecimal sumAmountByTxnRefPrefixAndStatus(@Param("prefix") String prefix, @Param("status") String status);
}