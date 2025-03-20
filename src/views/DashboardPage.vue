<template>
  <div class="container">
    <!-- 📌 桌機版左側導覽列 -->
    <nav v-if="!isMobile" :class="['sidebar', { 'open': isMenuOpen }]">
      <h2>儀表板</h2>
      <ul>
        <li
          v-for="(shortcut, index) in shortcuts"
          :key="index"
          @click="changeView(shortcut.view)"
          :class="{ active: currentView === shortcut.view }"
        >
          {{ shortcut.icon }} {{ shortcut.name }}
        </li>
      </ul>
      <button @click="logout">🚪 登出</button>
    </nav>

    <!-- 📌 主要內容區 -->
    <div class="content">
      <header>
       
      </header>

      <main>
        <div v-if="currentView === 'home'">

          <Calendar></Calendar>
        </div>

        <AddAccounting v-if="currentView === 'addAccounting'" />
        <ReportPage v-if="currentView === 'report'" />
        <DashboardSummary v-if="currentView === 'summary'" />
      </main>

      <footer>
        <p>丞 € 版權所有</p>
      </footer>
    </div>


<!-- 📌 手機版底部導航列 -->
<nav class="bottom-nav" v-if="isMobile">
  <ul>
    <li
      v-for="(shortcut, index) in shortcuts"
      :key="index"
      @click="changeView(shortcut.view)"
      :class="{ active: currentView === shortcut.view }"
    >
      <span>{{ shortcut.icon }}</span>
      <p>{{ shortcut.name }}</p>
    </li>

    <!-- ✅ 新增登出按鈕 -->
    <li @click="logout">
      <span>🚪</span>
      <p>登出</p>
    </li>
  </ul>

  <!-- ✅ 🔥 「+」按鈕現在跟隨 `bottom-nav`，不會穿越 -->
  <div @click="openModal" class="add-button">
    <span>➕</span>
  </div>
</nav>




<!-- 📌 🔥 記帳模擬視窗 -->
<div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
  <div class="modal-content">
    <AddRecordForm />
    <button class="close-btn" @click="closeModal">關閉</button>
  </div>
</div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import AddAccounting from './AddAccounting.vue';
import ReportPage from './ReportPage.vue';
import DashboardSummary from './DashboardSummary.vue';
import AddRecordForm from './AddRecordForm.vue';
import Calendar from './Calendar.vue';
const isModalOpen = ref(false); // ✅ 控制模擬視窗

const router = useRouter();
const auth = getAuth();
const isMenuOpen = ref(false);
const currentView = ref('home'); // 預設顯示首頁
const isMobile = ref(window.innerWidth < 768); // ✅ 修正動態偵測

const shortcuts = ref([
  { name: '首頁', icon: '🏠', view: 'home' },
 
  { name: '類別統計', icon: '📊', view: 'report' },
  { name: '月結餘', icon: '📈', view: 'summary' }
]);

const changeView = (view) => {
  currentView.value = view;
};
// ✅ 顯示/隱藏模擬視窗
const openModal = () => {
  isModalOpen.value = true;
};
const closeModal = () => {
  isModalOpen.value = false;
};

// ✅ 修正 Logout，確保 Firebase 立即登出
const logout = async () => {
  console.log("🚪 正在登出...");

  try {
    await signOut(auth); // 🔹 確保 Firebase 也登出
    console.log("✅ Firebase 已登出");

    // 🔥 清除所有本地儲存資料
    localStorage.clear();
    
    // ✅ 監聽 Firebase 確保登出成功後跳轉
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.log("🔄 Firebase 確認登出，跳轉回登入頁");
        router.push("/");
      }
    });
  } catch (error) {
    console.error("❌ 登出失敗:", error);
  }
};

// ✅ 確保 isMobile 可動態更新
onMounted(() => {
  window.addEventListener("resize", () => {
    isMobile.value = window.innerWidth < 768;
  });

  // ✅ 監聽 Firebase 登入狀態
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      console.log("❌ 未登入，回到首頁");
      router.push("/");
    } else {
      console.log("✅ 使用者已登入:", user.uid);
    }
  });

  // ✅ 檢查 LocalStorage 確保使用者狀態
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (!isLoggedIn) {
    router.push("/");
  }
});
</script>

<style scoped>
/* 主要佈局 */
.container {
  display: flex;
  height: 100vh;
}

/* 桌機版左側導覽列 */
.sidebar {
  width: 200px; 
  background-color: #34495e;
  color: white;
  padding: 15px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
  transition: width 0.3s ease-in-out;
  box-sizing: border-box; /* 避免 padding 影響寬度 */
}

.sidebar ul li {
  padding: 12px;
  font-size: 16px; /* 提高字體可讀性 */
}

.sidebar ul li:hover,
.sidebar ul li.active {
  background: #16a085; /* 改為更亮眼的綠色 */
  transform: scale(1.05); /* 增加 hover 放大效果 */
  transition: all 0.2s ease-in-out;
}


/* 主要內容區 */
.content {
  height: 100vh;
  width: 100%;  
  padding: 20px;
  transition: margin-left 0.3s ease-in-out;
}



/* 📌 手機版底部導航列 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #2c3e50;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 15px 0;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.2);
}

/* 📌 導覽列內的按鈕 */
.bottom-nav ul {
  display: flex;
  width: 100%;
  justify-content: space-around;
  padding: 0;
  margin: 0;
  list-style: none;
}

/* 📌 底部按鈕 */
.bottom-nav li {
  text-align: center;
  color: white;
  cursor: pointer;
  flex: 1;
  padding: 10px;
  font-size: 16px;
  transition: transform 0.2s ease-in-out, background 0.3s;
  position: relative;
}

.bottom-nav li:hover {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

/* 📌 + 按鈕 - 完美置中 */
.add-button {
  position: absolute;
  bottom: 20px; /* 與底部保持適當距離 */
  right:  5%;
  transform: translateX(-50%);
  background: #1abc9c;
  color: white;
  width: 65px;
  height: 65px;
  line-height: 65px;
  font-size: 36px;
  text-align: center;
  border-radius: 50%;
  box-shadow: 0px 4px 10px rgba(26, 188, 156, 0.5);
  transition: transform 0.2s ease-in-out;
  animation: waterDrop 1.5s infinite ease-in-out;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: none; /* 防止影響其他按鈕的佈局 */
}

/* 📌 點擊時動畫 */
.add-button:active {
  animation: waterSplash 0.5s ease-out;
}

/* 📌 水滴動畫 */
@keyframes waterDrop {
  0% {
    transform: translateX(-50%) scale(1);
  }
  50% {
    transform: translateX(-50%) scale(1.1);
  }
  100% {
    transform: translateX(-50%) scale(1);
  }
}

/* 📌 水墨擴散動畫 */
@keyframes waterSplash {
  0% {
    transform: translateX(-50%) scale(1);
    box-shadow: 0 0 10px rgba(26, 188, 156, 0.5);
  }
  50% {
    transform: translateX(-50%) scale(1.4);
    box-shadow: 0 0 25px rgba(26, 188, 156, 0.8);
  }
  100% {
    transform: translateX(-50%) scale(1);
    box-shadow: 0 0 10px rgba(26, 188, 156, 0.5);
  }
}

/* 📌 RWD 響應式修正 */
@media (max-width: 768px) {
  .bottom-nav {
    padding: 10px;
  }

  .add-button {
    position: absolute;
    bottom: 150px;
    width: 60px;
    height: 60px;
    line-height: 60px;
    font-size: 30px;
  }
}


  /* 📌 🔥 模擬視窗 (Modal) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 400px;
}

.close-btn {
  width: 100%;
  padding: 10px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.close-btn:hover {
  background: #c0392b;
}

</style>
