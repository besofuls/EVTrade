# 🚀 Hướng dẫn chạy Backend Spring Boot - EVMARKETPLAY.VN

## ⚠️ **VẤN ĐỀ: "Không thể kết nối đến server"**

Nếu bạn gặp lỗi này, có nghĩa là **backend chưa chạy** hoặc **CORS chưa được cấu hình**.

---

## ✅ **GIẢI PHÁP - Các bước chi tiết:**

### **Bước 1: Kiểm tra SQL Server**

Backend Spring Boot của bạn kết nối đến SQL Server. Đảm bảo:

1. **SQL Server đang chạy** (port 1433)
2. **Database `swp391_evtrading_db` đã tồn tại**
3. **Username: `sa`, Password: `12345`** (theo `application.properties`)

```sql
-- Tạo database nếu chưa có
CREATE DATABASE swp391_evtrading_db;
```

---

### **Bước 2: Chạy Backend Spring Boot**

#### **Cách 1: Dùng Maven (Command Line)**

```bash
# Di chuyển vào thư mục backend
cd c:\Users\ADMIN\Documents\GitHub\SWP391-Group-2\BE\swp391

# Chạy ứng dụng
mvnw spring-boot:run

# Hoặc nếu dùng Maven toàn cục
mvn spring-boot:run
```

#### **Cách 2: Dùng IDE (IntelliJ IDEA / Eclipse)**

1. Mở thư mục `BE/swp391` trong IDE
2. Tìm file `Swp391Application.java`
3. Click chuột phải → **Run 'Swp391Application'**

#### **Cách 3: Chạy file JAR (sau khi build)**

```bash
# Build project
mvnw clean package

# Chạy file JAR
java -jar target/swp391-0.0.1-SNAPSHOT.jar
```

---

### **Bước 3: Kiểm tra Backend đã chạy chưa**

Sau khi chạy backend, bạn sẽ thấy:

```
[...]
Tomcat started on port(s): 8080 (http) with context path ''
Started Swp391Application in X.XXX seconds
```

**✅ Test API bằng trình duyệt:**

Mở: http://localhost:8080/api/users

Nếu thấy danh sách users (hoặc `[]`) → **Backend đã chạy thành công!**

---

### **Bước 4: Đã thêm CORS Configuration**

Tôi đã tạo file `CorsConfig.java` để cho phép frontend kết nối:

📁 **File:** `BE/swp391/src/main/java/com/evtrading/swp391/config/CorsConfig.java`

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        // Cho phép frontend (http://localhost:5173) kết nối
        // ...
    }
}
```

**⚠️ LƯU Ý:** Sau khi thêm file này, bạn cần **RESTART backend** để áp dụng!

---

### **Bước 5: Chạy Frontend**

```bash
# Di chuyển vào thư mục frontend
cd c:\Users\ADMIN\Documents\GitHub\SWP391-Group-2\Front-end

# Chạy frontend
npm run dev
```

---

## 🧪 **Test kết nối:**

### **1. Test từ trình duyệt:**

Mở Console (F12) → Tab Console → Chạy:

```javascript
fetch('http://localhost:8080/api/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'test', password: 'test123' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

### **2. Test từ Postman:**

**Request:**
```
POST http://localhost:8080/api/users/login
Content-Type: application/json

{
  "username": "test",
  "password": "test123"
}
```

**Response thành công (200 OK):**
```json
{
  "userID": 1,
  "username": "test",
  "email": "test@example.com",
  "password": "test123",
  "role": {
    "roleID": 2,
    "roleName": "User"
  },
  "status": "active",
  "createdAt": "2025-01-01T00:00:00.000+00:00"
}
```

**Response thất bại (401 Unauthorized):**
```
(Empty body, status 401)
```

---

## 📋 **Checklist troubleshooting:**

- [ ] **SQL Server đang chạy?**
  ```bash
  # Kiểm tra SQL Server service
  # Windows: Services → SQL Server (MSSQLSERVER) → Running
  ```

- [ ] **Database đã tồn tại?**
  ```sql
  USE swp391_evtrading_db;
  SELECT * FROM users;
  ```

- [ ] **Backend đang chạy tại port 8080?**
  ```
  Mở: http://localhost:8080/api/users
  ```

- [ ] **CORS đã được cấu hình?**
  ```
  Kiểm tra file: BE/swp391/src/main/java/com/evtrading/swp391/config/CorsConfig.java
  ```

- [ ] **Frontend đang chạy tại port 5173?**
  ```
  Mở: http://localhost:5173
  ```

- [ ] **Có user nào trong database chưa?**
  ```sql
  SELECT * FROM users;
  -- Nếu chưa có, thêm user test:
  INSERT INTO users (username, email, password, roleID, status, createdAt) 
  VALUES ('test', 'test@example.com', 'test123', 2, 'active', GETDATE());
  ```

---

## 🔥 **Các lỗi thường gặp:**

### **Lỗi 1: "Cannot connect to database"**

```
Caused by: java.sql.SQLException: Login failed for user 'sa'
```

**Giải pháp:**
- Kiểm tra SQL Server đang chạy
- Kiểm tra username/password trong `application.properties`
- Kiểm tra SQL Server Authentication mode (nên dùng Mixed Mode)

---

### **Lỗi 2: "Port 8080 already in use"**

```
Web server failed to start. Port 8080 was already in use.
```

**Giải pháp:**
```bash
# Tìm process đang dùng port 8080
netstat -ano | findstr :8080

# Kill process (thay <PID> bằng số process ID)
taskkill /PID <PID> /F
```

---

### **Lỗi 3: "CORS policy blocked"**

```
Access to XMLHttpRequest at 'http://localhost:8080/api/users/login' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Giải pháp:**
1. Đảm bảo file `CorsConfig.java` đã được tạo
2. Restart backend
3. Clear cache trình duyệt (Ctrl + Shift + Delete)

---

### **Lỗi 4: "Không thể kết nối đến server"**

**Frontend hiển thị:**
```
Không thể kết nối đến server. Vui lòng kiểm tra:
1. Backend có đang chạy tại http://localhost:8080?
2. CORS configuration đã được cấu hình chưa?
```

**Giải pháp:**
1. Chạy backend: `cd BE/swp391 && mvnw spring-boot:run`
2. Kiểm tra: http://localhost:8080/api/users
3. Xem console backend có báo lỗi gì không

---

## 🎯 **Tóm tắt - Quy trình đầy đủ:**

```bash
# 1. Chạy SQL Server (đảm bảo port 1433)

# 2. Tạo database
CREATE DATABASE swp391_evtrading_db;

# 3. Chạy Backend
cd c:\Users\ADMIN\Documents\GitHub\SWP391-Group-2\BE\swp391
mvnw spring-boot:run

# 4. Đợi backend khởi động (khoảng 10-30 giây)

# 5. Test backend
# Mở: http://localhost:8080/api/users

# 6. Chạy Frontend (terminal mới)
cd c:\Users\ADMIN\Documents\GitHub\SWP391-Group-2\Front-end
npm run dev

# 7. Mở trình duyệt
# http://localhost:5173/login

# 8. Đăng nhập với user trong database
```

---

## 📞 **Cần hỗ trợ thêm?**

Nếu vẫn không kết nối được, hãy:

1. **Chụp màn hình lỗi** trong Console (F12 → Console tab)
2. **Kiểm tra backend console** xem có lỗi gì không
3. **Chạy lệnh test API** (Postman hoặc fetch trong console)

---

**Chúc bạn thành công! 🎉**

