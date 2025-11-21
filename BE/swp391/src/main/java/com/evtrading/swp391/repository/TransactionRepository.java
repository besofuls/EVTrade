package com.evtrading.swp391.repository;

import com.evtrading.swp391.entity.Transaction;
import com.evtrading.swp391.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.evtrading.swp391.entity.Order;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
    Optional<Transaction> findByOrder(Order order);

    // Thêm methods mới cho Report
    List<Transaction> findByOrder_BuyerAndCreatedAtBetween(User buyer, Date fromDate, Date toDate);
    List<Transaction> findByOrder_Buyer(User buyer);
    List<Transaction> findByCreatedAtBetween(Date fromDate, Date toDate);
    List<Transaction> findByDueTimeBeforeAndStatusNot(Date now, String status);
    List<Transaction> findByStatusAndPayoutDoneFalse(String status);
    // Bạn cần implement custom query hoặc thêm trường boolean "payoutDone" vào entity Transaction để lọc

    @Query("SELECT COALESCE(SUM(t.totalAmount), 0) FROM Transaction t WHERE t.referenceType = :referenceType AND t.status = :status")
    BigDecimal sumAmountByReferenceTypeAndStatus(@Param("referenceType") String referenceType, @Param("status") String status);

    List<Transaction> findByReferenceType(String referenceType);
}