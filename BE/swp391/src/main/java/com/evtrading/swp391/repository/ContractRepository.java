package com.evtrading.swp391.repository;

import com.evtrading.swp391.entity.Contract;
import com.evtrading.swp391.entity.Order;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Integer> {
    Optional<Contract> findByOrder(Order order);
    Optional<Contract> findByOrder_OrderID(Integer orderID);
    Optional<Contract> findByDocusealEnvelopeID(String docusealEnvelopeID);
    Optional<Contract> findTopBySellerEmailOrderByUpdateAtDesc(String sellerEmail);
    Optional<Contract> findTopByBuyerEmailOrderByUpdateAtDesc(String buyerEmail);
}
