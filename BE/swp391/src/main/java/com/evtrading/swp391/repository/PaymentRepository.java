package com.evtrading.swp391.repository;

import com.evtrading.swp391.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.evtrading.swp391.entity.Transaction;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    List<Payment> findByTransactionOrderByPaidAtDesc(Transaction transaction);
}