<template>
  <div id="login-container">
    <div id="login-box">
      <img src="https://cdn-icons-png.flaticon.com/512/5264/5264565.png" alt="logo" id="logo" />

      <div class="marquee-wrapper">
  <div class="marquee-content">
    <h2>歡迎使用 記帳系統 🎉 歡迎使用 記帳系統 🎉</h2>
  </div>
</div>



      <button id="google-login" @click="googleLogin">使用 Google 登入</button>
      <button id="guest-mode" @click="guestLogin">訪客模式</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { auth, provider, signInWithPopup } from "../firebase";
import { getAuth, signInAnonymously } from "firebase/auth";

const router = useRouter();

const googleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // ✅ 儲存 Google 使用者資訊
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userId", user.uid);
    localStorage.setItem("userName", user.displayName);

    console.log("✅ Google 登入成功:", user);

    // 🔹 跳轉到記帳頁面
    router.push("/dashboard");
  } catch (error) {
    console.error("❌ Google 登入失敗:", error);
  }
};

// ✅ Firebase 匿名登入
const guestLogin = async () => {
  console.log("🚀 訪客模式登入中...");

  try {
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;

    console.log("✅ 訪客登入成功，UID:", user.uid);

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userRole", "guest");
    localStorage.setItem("userId", user.uid); // ✅ 記錄 Firebase 訪客 UID

    await router.push("/dashboard");
  } catch (error) {
    console.error("❌ 訪客登入失敗:", error);
  }
};
</script>

<script>
export default {
  methods: {
    googleLogin() {
      alert("Google 登入");
    },
    guestLogin() {
      alert("訪客模式登入");
    },
  },
};
</script>

<style scoped>

/* 背景動態變化 */
@keyframes gradientBG {
  0% { background: linear-gradient(135deg, #f0f0f0, #dfe9f3); }
  50% { background: linear-gradient(135deg, #e0eafc, #cfdef3); }
  100% { background: linear-gradient(135deg, #f0f0f0, #dfe9f3); }
}

#login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  animation: gradientBG 5s infinite alternate;
}

/* 登入框進場動畫 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(80px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

#login-box {
  width: 90%;
  max-width: 350px;
  background-color: #ffffff;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: fadeInUp 0.8s ease-out;
}

/* Logo 旋轉縮放進場 */
@keyframes logoEntry {
  0% { transform: scale(0.5) rotate(-10deg); opacity: 0; }
  50% { transform: scale(1.1) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0); }
}

#logo {
  width: 80px;
  height: 80px;
  margin-bottom: 15px;
  animation: logoEntry 0.8s ease-out;
}

.marquee-wrapper {
  width: 100%; /* 滿版寬度 */
  overflow: hidden;
  white-space: nowrap;
  position: relative;
  background: #fff; /* 讓背景不透 */
}

.marquee-content {
  display: flex;
  min-width: 200%; /* 讓內容寬度為 2 倍，確保無縫銜接 */
  animation: marqueeLoop 10s linear infinite;
}

@keyframes marqueeLoop {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); } /* 只移動 50% 確保無縫接軌 */
}



/* 按鈕基礎設計 */
#google-login,
#guest-mode {
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease-in-out;
}

@keyframes buttonFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Google 按鈕 */
#google-login {
  background-color: #4285f4;
  color: white;
  animation: buttonFadeIn 0.6s ease-out 0.5s both;
}
#google-login:hover {
  background-color: #357ae8;
}

/* 訪客模式按鈕 */
#guest-mode {
  background-color: #6c757d;
  color: white;
  animation: buttonFadeIn 0.6s ease-out 0.7s both;
}
#guest-mode:hover {
  background-color: #495057;
}

/* 按鈕點擊回饋動畫 */
#google-login:active,
#guest-mode:active {
  transform: scale(0.95);
}

@keyframes bounceBack {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

#google-login:focus,
#guest-mode:focus {
  animation: bounceBack 0.3s ease-out;
}

/* 響應式設計 */
@media (max-width: 480px) {
  #login-box {
    width: 90%;
    padding: 20px;
  }
}

</style>