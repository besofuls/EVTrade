package com.evtrading.swp391.service;

import com.evtrading.swp391.dto.ProfileDTO;
import com.evtrading.swp391.entity.Profile;
import com.evtrading.swp391.entity.User;
import com.evtrading.swp391.repository.ProfileRepository;
import com.evtrading.swp391.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
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
            return null;
        }
        User user = userOptional.get();

        Profile profile = profileRepository.findByUser_UserID(userId).orElseGet(() -> {
            Profile p = new Profile();
            p.setCreatedAt(new Date());
            return p;
        });
        profile.setUser(user);

        if (profileDTO.getFullName() != null && !profileDTO.getFullName().isBlank()) {
            profile.setFullName(profileDTO.getFullName().trim());
        }
        if (profileDTO.getPhone() != null && !profileDTO.getPhone().isBlank()) {
            profile.setPhone(profileDTO.getPhone().trim());
        }
        if (profileDTO.getAddress() != null && !profileDTO.getAddress().isBlank()) {
            profile.setAddress(profileDTO.getAddress().trim());
        }
        if (profileDTO.getDateOfBirth() != null) {
            profile.setDateOfBirth(profileDTO.getDateOfBirth());
        }
        if (profileDTO.getGender() != null && !profileDTO.getGender().isBlank()) {
            profile.setGender(profileDTO.getGender().trim());
        }

        profile.setUpdatedAt(new Date());
        return profileRepository.save(profile);
    }
}
