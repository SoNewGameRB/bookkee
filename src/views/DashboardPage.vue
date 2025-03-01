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
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import AddAccounting from './AddAccounting.vue';
import ReportPage from './ReportPage.vue';
import DashboardSummary from './DashboardSummary.vue';
import Calendar from './Calendar.vue';

const router = useRouter();
const auth = getAuth();
const isMenuOpen = ref(false);
const currentView = ref('home'); // 預設顯示首頁
const isMobile = ref(window.innerWidth < 768); // ✅ 修正動態偵測

const shortcuts = ref([
  { name: '首頁', icon: '🏠', view: 'home' },
  { name: '新增記帳', icon: '📒', view: 'addAccounting' },
  { name: '類別統計', icon: '📊', view: 'report' },
  { name: '月結餘', icon: '📈', view: 'summary' }
]);

const changeView = (view) => {
  currentView.value = view;
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
  margin-left: 200px; /* 確保與 Sidebar 一致 */
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
  padding: 10px 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 2px solid #1abc9c;
  padding: 15px 0; /* 增加上下內邊距 */
}

.bottom-nav ul {
  display: flex;
  width: 100%;
  justify-content: space-around;
  padding: 0;
  margin: 0;
  list-style: none;
  padding: 10px; /* 增加點擊區域 */
  font-size: 16px;
}

.bottom-nav li {
  text-align: center;
  color: white;
  cursor: pointer;
  flex: 1;
  padding: 8px;
  transition: background 0.3s;
}

.bottom-nav li.active {
  background: #1abc9c;
}

.bottom-nav li:hover {
  background: rgba(255, 255, 255, 0.2);
}

.bottom-nav li span {
  display: block;
  font-size: 24px;
  
}

.bottom-nav li p {
  margin: 0;
  font-size: 14px;
}

/* 📌 RWD 響應式修正 */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
  }


  .content {
    margin-left: auto;
    padding-bottom: 80px;
  }
}
</style>
