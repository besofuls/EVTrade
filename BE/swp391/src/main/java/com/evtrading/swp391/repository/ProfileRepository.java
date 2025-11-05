package com.evtrading.swp391.repository;

import com.evtrading.swp391.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Integer> {
    Optional<Profile> findByUser_UserID(Integer userId);
}
