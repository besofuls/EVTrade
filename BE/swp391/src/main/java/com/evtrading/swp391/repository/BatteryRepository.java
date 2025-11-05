package com.evtrading.swp391.repository;

import com.evtrading.swp391.entity.Battery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BatteryRepository extends JpaRepository<Battery, Integer> {
}
