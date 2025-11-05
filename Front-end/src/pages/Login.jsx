import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import backgroundVideo from "../assets/33vfxVliVS7mnZQ8o2LDBHzOqvL.mp4";
import apiService from "../services/apiService";
import "./Login.css";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Load Facebook SDK
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: "785985914430887", // <-- Thay bằng appId của bạn
        cookie: true,
        xfbml: true,
        version: "v19.0",
      });
    };
    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }, []);

  const processAuthSuccess = (response) => {
    if (response && response.token) {
      window.dispatchEvent(new Event("storage"));
      setTimeout(() => {
        const role =
          response.role?.toUpperCase?.() ||
          response.roleName?.toUpperCase?.() ||
          (response.user && Array.isArray(response.user.roles)
            ? response.user.roles[0]
            : "");

        if (role === "ADMIN" || role === "MODERATOR") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 100);
    } else {
      setError("Đăng nhập thất bại");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!username || !password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);

    try {
      // Call API login - apiService sẽ tự động lưu token và user data
      const response = await apiService.login({
        username,
        password,
      });
      processAuthSuccess(response);
    } catch (err) {
      console.error("Login error:", err);
      setError("Tên đăng nhập hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    window.FB.login(
      function (response) {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          apiService
            .socialLogin({
              provider: "FACEBOOK",
              accessToken,
            })
            .then(processAuthSuccess)
            .catch((err) => {
              setError(err.message || "Đăng nhập Facebook thất bại");
            });
        } else {
          alert("Đăng nhập Facebook thất bại");
        }
      },
      { scope: "email" }
    );
  };

  return (
    <div className="login-page">
      {/* Video Background */}
      <video autoPlay loop muted playsInline className="background-video">
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      {/* Back to Home Button */}
      <button className="back-home-btn" onClick={() => navigate("/")}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span>Trang chủ</span>
      </button>

      {/* Website branding */}
      <div className="website-branding" onClick={() => navigate("/")}>
        EVMARKETPLAY.VN
      </div>

      <div className="container-fluid h-100">
        <div className="row h-100">
          <div className="col-12 d-flex align-items-center justify-content-center">
            <div className="login-card">
              {/* Language Selector */}
              <div className="language-selector">
                <span>Tiếng Việt (VIE)</span>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path
                    d="M1 1.5L6 6.5L11 1.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Login Content */}
              <div className="login-content">
                <h1 className="login-title">Đăng Nhập</h1>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form className="login-form" onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label">Tên tài khoản</label>
                    <input
                      type="text"
                      className="form-control custom-input"
                      placeholder=""
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label">MẬT KHẨU</label>
                    <div className="password-input">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control custom-input"
                        placeholder=""
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          {showPassword ? (
                            <>
                              <path
                                d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <circle
                                cx="12"
                                cy="12"
                                r="3"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                            </>
                          ) : (
                            <path
                              d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary login-button w-100"
                    disabled={loading}
                  >
                    {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
                  </button>
                </form>

                <div className="divider">
                  <span>Hoặc</span>
                </div>

                <div className="social-login">
                  {/* Google login */}
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      const accessToken = credentialResponse.credential;
                      apiService
                        .socialLogin({
                          provider: "GOOGLE",
                          accessToken,
                        })
                        .then(processAuthSuccess)
                        .catch((err) => {
                          setError(err.message || "Đăng nhập Google thất bại");
                        });
                    }}
                    onError={() => {
                      setError("Đăng nhập Google thất bại");
                    }}
                  />
                  {/* Facebook login */}
                  <button
                    className="btn social-button facebook"
                    onClick={handleFacebookLogin}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="#1877F2"
                      className="me-2"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Đăng nhập với Facebook
                  </button>
                </div>

                <div className="signup-link text-center mt-4">
                  Chưa có tài khoản ?{" "}
                  <a
                    href="#"
                    className="signup-text"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/register");
                    }}
                  >
                    Đăng ký
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
