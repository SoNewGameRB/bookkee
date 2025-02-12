
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
    </div>
  </div>
</template>


<style scoped>
/* 設定整個畫面置中 */
#binbox {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 20px;
  background-color: #f0f0f0;
}

/* 登入框 */
#box {
  width: 90%;
  max-width: 400px; /* 限制最大寬度 */
  background-color: #c0c0c0;
  border: solid 1px black;
  border-radius: 15px;
  box-shadow: 10px 10px 20px rgba(0, 0, 0, 0.6);
  color: black;
  font-size: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

/* 輸入框與標籤 */
#box label {
  width: 100%;
  display: flex;
  flex-direction: column;
  font-size: 16px;
  margin-bottom: 10px;
}

#box input {
  border-radius: 10px;
  font-size: 16px;
  padding: 8px;
  border: 1px solid #333;
  width: 100%;
  box-sizing: border-box;
}

/* Logo 圖片 */
#logo {
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: filter 0.5s ease-in-out;
}

#logo:hover {
  filter: invert(60%) sepia(100%) hue-rotate(200deg);
}

/* 登入按鈕 */
#login {
  display: block;
  border: solid 2px black;
  border-radius: 25px;
  width: 100%;
  max-width: 300px;
  text-align: center;
  padding: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.4s;
  background-color: white;
  text-decoration: none;
  color: black;
  margin-top: 10px;
}

#login:hover {
  background-color: #8080ff;
  color: white;
}

/* ========== RWD 響應式設計 ========== */
/* 小螢幕（手機） */
@media (max-width: 768px) {
  #box {
    width: 95%; /* 讓表單更貼近螢幕寬度 */
  }

  #logo {
    width: 100px; /* 縮小 Logo */
    height: 100px;
  }

  #box input {
    font-size: 14px;
    padding: 6px;
  }

  #login {
    font-size: 16px;
    padding: 8px;
  }
}
</style>


  
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const router = useRouter();

// ✅ 進入頁面時檢查是否已登入
onMounted(() => {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (isLoggedIn === 'true') {
    router.push('/dashboard'); // 已登入，跳轉到儀表板
  }
});

const login = () => {
  const userData = { username: 'admin', password: '1234' };

  if (username.value === userData.username && password.value === userData.password) {
    alert('登入成功！');
    console.log('成功，開始跳轉');

    // ✅ 儲存登入狀態
    localStorage.setItem('isLoggedIn', 'true');

    router.push('/dashboard'); // ✅ 跳轉
  } else {
    alert('帳號或密碼錯誤');
  }
};
</script>


  