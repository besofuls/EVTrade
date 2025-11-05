package com.evtrading.swp391.service;

import com.evtrading.swp391.entity.Favorites;
import com.evtrading.swp391.entity.FavoritesId;
import com.evtrading.swp391.entity.Listing;
import com.evtrading.swp391.entity.User;
import com.evtrading.swp391.repository.FavoritesRepository;
import com.evtrading.swp391.repository.ListingRepository;
import com.evtrading.swp391.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FavoritesService {
    private final FavoritesRepository favoritesRepository;
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;

    public FavoritesService(FavoritesRepository favoritesRepository, UserRepository userRepository, ListingRepository listingRepository) {
        this.favoritesRepository = favoritesRepository;
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
    }

    /**
     * Thêm một listing vào danh sách yêu thích của user.
     *
     * Các bước thực hiện:
     * 1. Chuyển username -> entity User bằng userRepository.findByUsername(username).
     * 2. Lấy Listing bằng listingRepository.findById(listingId).
     * 3. Tạo composite key FavoritesId (userID, listingID).
     * 4. Nếu dòng Favorites đã tồn tại thì trả về false (hành vi idempotent).
     * 5. Ngược lại tạo Favorites entity, set EmbeddedId, set quan hệ (user, listing) và persist.
     *
     * Ghi chú/giả định:
     * - Phương thức giả sử caller đã được xác thực (controller truyền username từ Principal).
     * - Phải set cả EmbeddedId và trường quan hệ (user/listing) trước khi save vì mapping dùng @MapsId.
     * - Trả về boolean để controller chuyển thành HTTP code tương ứng.
     * - Các thao tác DB được bọc trong @Transactional để đảm bảo atomic.
     */
    @Transactional
    public boolean addFavoriteListing(String username, Integer listingId) {
        try {
            Optional<User> u = userRepository.findByUsername(username);
            if (u.isEmpty()) return false; // user not found
            Optional<Listing> l = listingRepository.findById(listingId);
            if (l.isEmpty()) return false; // listing not found

            FavoritesId id = new FavoritesId();
            id.setUserID(u.get().getUserID());
            id.setListingID(l.get().getListingID());

            if (favoritesRepository.existsById(id)) {
                return false; // already favorited
            }

            Favorites fav = new Favorites();
            // Must set both the id and the entity relationships because Favorites uses @MapsId
            fav.setId(id);
            fav.setUser(u.get());
            fav.setListing(l.get());
            fav.setCreatedAt(new java.util.Date());
            favoritesRepository.save(fav);
            return true;
        } catch (Exception ex) {
            // Log stacktrace for debugging; controller will return 500 if necessary
            ex.printStackTrace();
            return false;
        }
    }

    /**
     * Xóa favorite của user cho listing đã cho.
     * Trả về true khi có row bị xóa, false khi favorite không tồn tại hoặc có lỗi.
     */
    @Transactional
    public boolean removeFavoriteListing(String username, Integer listingId) {
        try {
            Optional<User> u = userRepository.findByUsername(username);
            if (u.isEmpty()) return false; // user not found

            FavoritesId id = new FavoritesId();
            id.setUserID(u.get().getUserID());
            id.setListingID(listingId);

            if (favoritesRepository.existsById(id)) {
                favoritesRepository.deleteById(id);
                return true;
            }
            return false; // nothing to delete
        } catch (Exception ex) {
            ex.printStackTrace();
            return false;
        }
    }

    /**
     * Trả về danh sách Listing mà user đã favorite.
     * Trả về danh sách rỗng nếu user không tồn tại hoặc user chưa có favorite nào.
     */
    public List<Listing> getFavoriteListings(String username) {
        Optional<User> u = userRepository.findByUsername(username);
        if (u.isEmpty()) return List.of();
        List<Favorites> favs = favoritesRepository.findByIdUserID(u.get().getUserID());
        return favs.stream().map(Favorites::getListing).collect(Collectors.toList());
    }
}
