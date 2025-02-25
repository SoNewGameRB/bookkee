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
        <h2>歡迎來到後台！</h2>
      </header>

      <main>
        <div v-if="currentView === 'home'">
          <h2>🏠 首頁</h2>
          <p>歡迎來到記帳系統！</p>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AddAccounting from './AddAccounting.vue';
import ReportPage from './ReportPage.vue';
import DashboardSummary from './DashboardSummary.vue'; // 新增「月結餘」組件
import Calendar from './Calendar.vue';
const router = useRouter();
const isMenuOpen = ref(false);
const currentView = ref('home'); // 預設顯示首頁

// ✅ 修正 isMobile，確保動態變更
const isMobile = ref(window.innerWidth < 768);

const shortcuts = ref([
  { name: '首頁', icon: '🏠', view: 'home' },
  { name: '新增記帳', icon: '📒', view: 'addAccounting' },
  { name: '類別統計', icon: '📊', view: 'report' },
  { name: '月結餘', icon: '📈', view: 'summary' }
]);

const changeView = (view) => {
  currentView.value = view;
};

// ✅ 修正 Logout，確保狀態刷新
const logout = () => {
  localStorage.removeItem('isLoggedIn');
  router.push('/');
  location.reload();
};

// ✅ 確保 isMobile 可動態更新
onMounted(() => {
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768;
  });

  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (isLoggedIn !== 'true') {
    router.push('/');
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
  width: 150px;
  background-color: #2c3e50;
  color: white;
  padding: 20px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
  transition: transform 0.3s ease-in-out;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar ul li {
  margin-bottom: 10px;
  cursor: pointer;
  padding: 10px;
  border-radius: 5px;
  transition: background 0.3s;
}

.sidebar ul li:hover,
.sidebar ul li.active {
  background: #1abc9c;
}

/* 主要內容區 */
.content {
  flex-grow: 1;
  margin-left: 200px;
  padding: 0px 0px 100px 0px ;
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
}

.bottom-nav ul {
  display: flex;
  width: 100%;
  justify-content: space-around;
  padding: 0;
  margin: 0;
  list-style: none;
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
  font-size: 20px;
}

.bottom-nav li p {
  margin: 0;
  font-size: 14px;
}

/* 📌 RWD 響應式設計 */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }

  .content {
    margin-left: 0;
    padding-bottom: 80px; /* 預留空間給底部導覽列 */
  }
}
</style>
