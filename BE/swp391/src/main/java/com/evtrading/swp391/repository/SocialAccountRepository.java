package com.evtrading.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.evtrading.swp391.entity.SocialAccount;
import java.util.Optional;

public interface SocialAccountRepository extends JpaRepository<SocialAccount, Integer> {
    Optional<SocialAccount> findByProviderAndProviderUserId(String provider, String providerUserId);
    boolean existsByProviderAndProviderUserId(String provider, String providerUserId);
}
