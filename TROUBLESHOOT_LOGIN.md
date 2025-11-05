# 🔍 Khắc phục lỗi đăng nhập

## ❌ Triệu chứng
- Nhập username: `member2`
- Nhập password: `hashedpassword7`  
- Lỗi: **"Tên đăng nhập hoặc mật khẩu không đúng"**

## 🔎 Nguyên nhân có thể

### 1. Backend không chạy (Do lỗi Java version)
Backend đang yêu cầu Java 21 nhưng Maven không compile được.

**Giải pháp:** Đã sửa `pom.xml` xuống Java 17

### 2. Database không có user "member2"
Database có thể chưa có user này hoặc password không đúng.

### 3. Database chưa có Role "Member"
Register và Login đều cần Role "Member" tồn tại.

---

## ✅ CÁCH FIX TỪNG BƯỚC

### Bước 1: Kiểm tra Backend có compile được không

```bash
cd BE\swp391
.\mvnw.cmd clean compile
```

**Kết quả mong đợi:** `BUILD SUCCESS`

**Nếu lỗi Java version:**
- ✅ Đã sửa `pom.xml` thành Java 17
- Chạy lại compile

---

### Bước 2: Khởi động Backend

```bash
cd BE\swp391
.\mvnw.cmd spring-boot:run
```

**Kiểm tra:** Mở http://localhost:8080/api/users
- Nếu thấy danh sách JSON → Backend chạy OK
- Nếu lỗi connection → Backend chưa chạy

---

### Bước 3: Kiểm tra Database

#### 3.1. Kiểm tra có Role chưa
```sql
USE evtrading;
SELECT * FROM Role;
```

**Cần có:**
- Admin
- Moderator  
- Member

**Nếu chưa có, chạy:**
```sql
INSERT INTO Role (roleName) VALUES ('Admin');
INSERT INTO Role (roleName) VALUES ('Moderator');
INSERT INTO Role (roleName) VALUES ('Member');
```

#### 3.2. Kiểm tra có user "member2" chưa
```sql
SELECT u.*, r.roleName 
FROM users u 
LEFT JOIN Role r ON u.roleID = r.roleID 
WHERE u.username = 'member2';
```

**Nếu không có kết quả** → User chưa tồn tại, cần tạo mới.

#### 3.3. Tạo user "member2" (nếu chưa có)
```sql
-- Lấy roleID của Member
DECLARE @memberRoleID INT;
SELECT @memberRoleID = roleID FROM Role WHERE roleName = 'Member';

-- Tạo user
INSERT INTO users (username, email, password, status, roleID, createdAt)
VALUES ('member2', 'member2@example.com', 'hashedpassword7', 'Active', @memberRoleID, GETDATE());
```

---

### Bước 4: Test Login bằng Postman

```http
POST http://localhost:8080/api/users/login
Content-Type: application/json

{
  "username": "member2",
  "password": "hashedpassword7"
}
```

**Response thành công (200 OK):**
```json
{
  "userID": 1,
  "username": "member2",
  "email": "member2@example.com",
  "status": "Active",
  "role": {
    "roleID": 3,
    "roleName": "Member"
  }
}
```

**Response lỗi (401 Unauthorized):**
- Username hoặc password không đúng
- User chưa tồn tại

---

### Bước 5: Kiểm tra Frontend

1. **Mở Developer Console** (F12)
2. Vào tab **Network**
3. Thử đăng nhập
4. Xem request `/api/users/login`:
   - Status 200 → Thành công
   - Status 401 → Sai username/password
   - Status 500 → Lỗi server
   - Failed/Timeout → Backend không chạy

---

## 🛠️ Checklist Khắc Phục

- [ ] Backend compile thành công (`.\mvnw.cmd clean compile`)
- [ ] Backend đang chạy (`.\mvnw.cmd spring-boot:run`)
- [ ] Database có 3 roles: Admin, Moderator, Member
- [ ] Database có user "member2" với password "hashedpassword7"
- [ ] User "member2" có status = "Active" (không phải "Pending")
- [ ] Frontend kết nối được backend (http://localhost:8080)
- [ ] Vite proxy hoạt động (http://localhost:5173)

---

## 🎯 Quick Fix Script

Chạy SQL script này để tạo đầy đủ dữ liệu test:

```sql
USE evtrading;

-- Tạo roles nếu chưa có
IF NOT EXISTS (SELECT 1 FROM Role WHERE roleName = 'Admin')
    INSERT INTO Role (roleName) VALUES ('Admin');

IF NOT EXISTS (SELECT 1 FROM Role WHERE roleName = 'Moderator')
    INSERT INTO Role (roleName) VALUES ('Moderator');

IF NOT EXISTS (SELECT 1 FROM Role WHERE roleName = 'Member')
    INSERT INTO Role (roleName) VALUES ('Member');

-- Lấy roleID của Member
DECLARE @memberRoleID INT;
SELECT @memberRoleID = roleID FROM Role WHERE roleName = 'Member';

-- Xóa user cũ nếu có
DELETE FROM users WHERE username = 'member2';

-- Tạo user mới
INSERT INTO users (username, email, password, status, roleID, createdAt)
VALUES ('member2', 'member2@example.com', 'hashedpassword7', 'Active', @memberRoleID, GETDATE());

-- Kiểm tra kết quả
SELECT u.userID, u.username, u.email, u.password, u.status, r.roleName
FROM users u
JOIN Role r ON u.roleID = r.roleID
WHERE u.username = 'member2';
```

---

## ⚠️ Lưu ý quan trọng

1. **Password đang lưu plain text** (không an toàn!)
   - Backend check: `user.getPassword().equals(password)`
   - Nên dùng BCrypt hash trong production

2. **User phải có status = "Active"**
   - User mới register có status = "Pending"
   - Cần admin approve trước khi login

3. **CORS đã được config** ở backend
   - Cho phép http://localhost:5173

---

## 📞 Nếu vẫn lỗi

Gửi cho tôi:
1. Log console backend khi start
2. Response từ API `/api/users/login` (Network tab)
3. Kết quả query: `SELECT * FROM users WHERE username = 'member2'`

