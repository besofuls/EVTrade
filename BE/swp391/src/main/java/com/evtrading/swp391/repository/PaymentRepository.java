package com.evtrading.swp391.repository;

import com.evtrading.swp391.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.evtrading.swp391.entity.Transaction;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    List<Payment> findByTransactionOrderByPaidAtDesc(Transaction transaction);
    Optional<Payment> findFirstByTransactionAndStatus(Transaction transaction, String status);
    Optional<Payment> findByTxnRef(String txnRef);
    List<Payment> findAllByStatus(String status);
    List<Payment> findByStatusAndPaidAtBefore(String status, Date before);

   
}