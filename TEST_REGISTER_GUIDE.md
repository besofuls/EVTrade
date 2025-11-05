# ✅ API Register đã được gắn vào chức năng đăng ký

## 📡 Endpoint
```
POST http://localhost:8080/api/users/register
```

## 🔗 Luồng hoạt động

```
Frontend (Register.jsx)
    ↓
POST /api/users/register
    ↓
Vite Proxy: /api → http://localhost:8080
    ↓
Backend: UserController.register()
    ↓
Response: User object (status 201 Created)
```

## 📝 Dữ liệu gửi đi

```javascript
{
  "username": "string",
  "email": "string", 
  "password": "string"
}
```

**Lưu ý:** 
- ✅ Đã xóa field `role: 'USER'` (backend không cần)
- Backend tự động set role = "Member"
- Backend tự động set status = "Pending" (cần admin approve)

---

## 🧪 CÁCH TEST

### Bước 1: Chuẩn bị Database

Chạy SQL script để tạo Role:

```sql
USE evtrading;

-- Tạo 3 roles cần thiết
INSERT INTO Role (roleName) VALUES ('Admin');
INSERT INTO Role (roleName) VALUES ('Moderator');
INSERT INTO Role (roleName) VALUES ('Member');

-- Kiểm tra
SELECT * FROM Role;
```

**File SQL:** `BE/swp391/src/main/resources/create_test_user.sql`

---

### Bước 2: Khởi động Backend

```bash
cd BE\swp391
.\mvnw.cmd spring-boot:run
```

Đợi thấy: `Started Swp391Application...`

**Kiểm tra backend đang chạy:**
- Mở: http://localhost:8080/api/users
- Phải thấy response JSON

---

### Bước 3: Khởi động Frontend

```bash
cd Front-end
npm run dev
```

---

### Bước 4: Test Đăng ký

1. Mở trình duyệt: **http://localhost:5173/register**

2. Mở **Developer Tools** (F12) → Tab **Console**

3. Điền form:
   - **Tên tài khoản:** testuser123
   - **Email:** test@example.com
   - **Mật khẩu:** 123456
   - **Xác nhận mật khẩu:** 123456

4. Click **TẠO TÀI KHOẢN**

5. Kiểm tra Console, sẽ thấy:
   ```
   Sending register request to: http://localhost:8080/api/users/register
   Request data: {username: "testuser123", email: "test@example.com", password: "123456"}
   Register response: {userID: 1, username: "testuser123", ...}
   ```

6. Sẽ hiện alert: **"Đăng ký thành công! Tài khoản của bạn đang chờ admin phê duyệt."**

7. Tự động chuyển về trang login

---

## ✅ Test Cases

### Test Case 1: Đăng ký thành công
**Input:**
- Username: newuser1
- Email: newuser1@test.com
- Password: 123456

**Expected:**
- ✅ Status 201 Created
- ✅ Alert: "Đăng ký thành công! Tài khoản đang chờ admin phê duyệt"
- ✅ Redirect về /login
- ✅ Database có user mới với status="Pending"

---

### Test Case 2: Username đã tồn tại
**Input:**
- Username: newuser1 (đã tồn tại)
- Email: different@test.com
- Password: 123456

**Expected:**
- ❌ Status 400 Bad Request
- ❌ Error: "Tên tài khoản hoặc email đã tồn tại"

---

### Test Case 3: Email đã tồn tại
**Input:**
- Username: differentuser
- Email: newuser1@test.com (đã tồn tại)
- Password: 123456

**Expected:**
- ❌ Status 400 Bad Request
- ❌ Error: "Tên tài khoản hoặc email đã tồn tại"

---

### Test Case 4: Mật khẩu không khớp
**Input:**
- Password: 123456
- Confirm Password: 654321

**Expected:**
- ❌ Error: "Mật khẩu xác nhận không khớp"
- ❌ Không gọi API

---

### Test Case 5: Mật khẩu quá ngắn
**Input:**
- Password: 123

**Expected:**
- ❌ Error: "Mật khẩu phải có ít nhất 6 ký tự"
- ❌ Không gọi API

---

### Test Case 6: Backend không chạy
**Scenario:** Backend tắt

**Expected:**
- ❌ Error: "Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy ở http://localhost:8080"

---

### Test Case 7: Database chưa có Role "Member"
**Scenario:** Database chưa có Role

**Expected:**
- ❌ Status 500
- ❌ Error: "Lỗi: Database chưa có Role 'Member'. Vui lòng liên hệ admin."

---

## 🔍 Debug với Postman

### Request
```http
POST http://localhost:8080/api/users/register
Content-Type: application/json

{
  "username": "postmantest",
  "email": "postman@test.com",
  "password": "123456"
}
```

### Response Success (201 Created)
```json
{
  "userID": 2,
  "username": "postmantest",
  "email": "postman@test.com",
  "password": "123456",
  "status": "Pending",
  "role": {
    "roleID": 3,
    "roleName": "Member"
  },
  "createdAt": "2025-10-13T02:30:00.000+00:00"
}
```

### Response Error - Username tồn tại (400)
```json
(empty body)
```
Status: 400 Bad Request

### Response Error - Role không tồn tại (500)
```json
{
  "error": "Role 'Member' không tồn tại trong database. Vui lòng chạy script khởi tạo dữ liệu."
}
```

---

## 📊 Kiểm tra Database

Sau khi đăng ký thành công:

```sql
-- Xem user vừa tạo
SELECT u.userID, u.username, u.email, u.status, r.roleName, u.createdAt
FROM users u
JOIN Role r ON u.roleID = r.roleID
ORDER BY u.createdAt DESC;
```

**Kết quả mong đợi:**
- username: testuser123
- email: test@example.com
- status: **Pending**
- roleName: **Member**

---

## ⚠️ Lưu ý quan trọng

1. **User mới có status = "Pending"**
   - Không thể login ngay
   - Cần admin approve: `POST /api/users/{id}/approve`

2. **Password lưu plain text** (chưa hash)
   - ⚠️ Không an toàn cho production
   - Nên dùng BCrypt trong tương lai

3. **Validation ở Frontend:**
   - Username, email, password bắt buộc
   - Password tối thiểu 6 ký tự
   - Password phải khớp với confirm password

4. **Backend tự động:**
   - Set role = "Member"
   - Set status = "Pending"
   - Set createdAt = current timestamp

---

## 🆘 Troubleshooting

### Lỗi: "Không thể kết nối đến server"
**Fix:** Kiểm tra backend có chạy ở port 8080 không
```bash
cd BE\swp391
.\mvnw.cmd spring-boot:run
```

### Lỗi: "Database chưa có Role 'Member'"
**Fix:** Chạy SQL script tạo roles
```sql
INSERT INTO Role (roleName) VALUES ('Admin');
INSERT INTO Role (roleName) VALUES ('Moderator');
INSERT INTO Role (roleName) VALUES ('Member');
```

### Lỗi: "BUILD FAILURE" khi start backend
**Fix:** Đã sửa pom.xml xuống Java 17
```bash
.\mvnw.cmd clean compile
```

---

## ✨ Tóm tắt

✅ **API đã được gắn:** `POST /api/users/register`  
✅ **Request body:** `{username, email, password}`  
✅ **Response:** User object với status="Pending", role="Member"  
✅ **Validation:** Frontend check trước khi gọi API  
✅ **Error handling:** Hiển thị message lỗi rõ ràng  

**Next steps:**
- [ ] Test đăng ký với nhiều cases khác nhau
- [ ] Tạo admin user để approve users mới
- [ ] Implement BCrypt password hashing
- [ ] Add JWT token authentication

