<template>
  <div id="binbox">
    <div id="box">
      <img src="https://cdn-icons-png.flaticon.com/512/5264/5264565.png" alt="logo" id="logo" />

      <label for="accont">帳號:
        <input type="text" name="accont" id="accont" v-model="username" placeholder="帳號" @keyup.enter="login" />
      </label>

      <label for="password">密碼:
        <input type="password" name="password" id="password" v-model="password" placeholder="密碼" @keyup.enter="login" />
      </label>

      <button id="login" @click="login">登入</button>
      <button id="guest-mode" @click="guestLogin">訪客模式</button>

      <!-- ✅ Google 登入按鈕 -->
      <div id="googleSignInButton"></div>
    </div>
  </div>
</template>
  

<style scoped>
/* 讓畫面置中，並使用漸層背景 */
#binbox {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #f0f0f0, #dfe9f3);
}

/* 登入框 */
#box {
  width: 90%;
  max-width: 400px;
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
  color: #333;
  font-size: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 25px;
  transition: transform 0.3s ease-in-out;
}

#box:hover {
  transform: scale(1.02);
}

/* Logo 圖片 */
#logo {
  width: 100px;
  height: 100px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: transform 0.3s ease-in-out;
}

#logo:hover {
  transform: scale(1.1);
}

/* 輸入框與標籤 */
#box label {
  width: 100%;
  display: flex;
  flex-direction: column;
  font-size: 16px;
  margin-bottom: 12px;
  font-weight: 500;
}

#box input {
  border-radius: 8px;
  font-size: 16px;
  padding: 10px;
  border: 1px solid #ccc;
  width: 100%;
  box-sizing: border-box;
  transition: border 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

#box input:focus {
  border-color: #4a90e2;
  box-shadow: 0px 0px 8px rgba(74, 144, 226, 0.4);
  outline: none;
}

/* 登入按鈕 */
#login {
  display: block;
  border: none;
  border-radius: 8px;
  width: 100%;
  max-width: 300px;
  text-align: center;
  padding: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease-in-out;
  background-color: #4a90e2;
  color: white;
  text-decoration: none;
  margin-top: 15px;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
}

#login:hover {
  background-color: #357abd;
  box-shadow: 0px 5px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}
/* 訪客模式按鈕（右上角） */
#guest-mode {
  position: absolute;
  margin: 0px 0px 0px 220px;
  /* width: 100px; */
  background-color: #6c757d;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: 0.3s;
}

#guest-mode:hover {
  background-color: #495057;
}

/* 響應式設計 */
@media (max-width: 768px) {
  #box {
    width: 95%;
    padding: 20px;
  }

  #logo {
    width: 80px;
    height: 80px;
  }

  #box input {
    font-size: 14px;
    padding: 8px;
  }

  #login {
    font-size: 15px;
    padding: 10px;
  }
}

</style>


  
<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const username = ref("");
const password = ref("");
const router = useRouter();
const clientId = "188944110530-5dupttvorlfgbb87455u0mueat8ov8qv.apps.googleusercontent.com"; // ✅ 替換成你的 Client ID

// ✅ 進入頁面時檢查是否已登入
onMounted(() => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn === "true") {
    router.push("/dashboard"); // 已登入，跳轉到儀表板
  }

  // ✅ 確保 `google` 物件存在
  if (window.google && window.google.accounts) {
    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
    });

    google.accounts.id.renderButton(
      document.getElementById("googleSignInButton"),
      { theme: "outline", size: "large" }
    );
  } else {
    console.error("Google SDK 未載入，請確認 `index.html` 是否包含 `gsi/client`");
  }
});

// ✅ Google 登入回調函式
const handleCredentialResponse = (response) => {
  console.log("Google 登入成功:", response);

  // 解析 Google JWT Token
  const userData = JSON.parse(atob(response.credential.split(".")[1]));
  console.log("Google 使用者:", userData);

  // ✅ 儲存登入狀態
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userRole", "google");
  localStorage.setItem("userName", userData.name);

  // ✅ 跳轉至 Dashboard
  router.push("/dashboard");
};

// ✅ 手動帳密登入
const login = () => {
  const userData = { username: "admin", password: "1234" };

  if (username.value === userData.username && password.value === userData.password) {
    alert("登入成功！");

    // ✅ 儲存登入狀態
    localStorage.setItem("isLoggedIn", "true");

    router.push("/dashboard"); // ✅ 跳轉
  } else {
    alert("帳號或密碼錯誤");
  }
};

// ✅ 訪客模式登入
const guestLogin = () => {
  alert("以訪客模式登入！");
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userRole", "guest"); // ✅ 設定訪客身份
  router.push("/dashboard");
};
</script>


  