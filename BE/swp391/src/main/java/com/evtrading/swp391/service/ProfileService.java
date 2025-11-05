package com.evtrading.swp391.service;

import com.evtrading.swp391.dto.ProfileDTO;
import com.evtrading.swp391.entity.Profile;
import com.evtrading.swp391.entity.User;
import com.evtrading.swp391.repository.ProfileRepository;
import com.evtrading.swp391.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class ProfileService {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    public Optional<Profile> getProfileByUserId(Integer userId) {
        return profileRepository.findByUser_UserID(userId);
    }

    public Profile updateProfile(Integer userId, ProfileDTO profileDTO) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return null; // Or throw an exception
        }
        User user = userOptional.get();

        Profile profile = profileRepository.findByUser_UserID(userId).orElse(new Profile());
        profile.setUser(user);

        // Partial update: only set fields provided (non-null & not blank)
        if (profileDTO.getFullName() != null && !profileDTO.getFullName().isBlank()) {
            profile.setFullName(profileDTO.getFullName());
        }
        if (profileDTO.getPhone() != null && !profileDTO.getPhone().isBlank()) {
            profile.setPhone(profileDTO.getPhone());
        }
        if (profileDTO.getAddress() != null && !profileDTO.getAddress().isBlank()) {
            profile.setAddress(profileDTO.getAddress());
        }

        return profileRepository.save(profile);
    }
}
