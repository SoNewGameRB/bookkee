<template>
  <div class="container">
    <!-- 漢堡選單按鈕（小螢幕） -->
    <button class="menu-btn" @click="toggleMenu">☰</button>

    <!-- 左側導覽列 -->
    <nav :class="['sidebar', { 'open': isMenuOpen }]">
      <h2>儀表板</h2>
      <ul>
        <li @click="currentView = 'home'">首頁</li>
        <li @click="currentView = 'addAccounting'">新增記帳</li>
        <li @click="currentView = 'report'">報表分析</li>
      </ul>
    </nav>

    <!-- 主要內容區 -->
    <div class="content">
      <header>
        <h2>歡迎來到後台！</h2>
      </header>

      <main>
        <div v-if="currentView === 'home'">
          <h2>這是首頁</h2>
          <p>歡迎來到記帳系統！</p>
        </div>

        <AddAccounting v-if="currentView === 'addAccounting'" />

        <div v-if="currentView === 'report'">
          <h2>報表分析</h2>
          <p>這裡會顯示收支統計圖表。</p>
        </div>
      </main>

      <footer>
        <p>版權所有</p>
      </footer>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import AddAccounting from './AddAccounting.vue'; // 確保路徑正確

export default {
  components: {
    AddAccounting,
  },
  setup() {
    const isMenuOpen = ref(false);
    const currentView = ref('home'); // 預設顯示首頁

    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value;
    };

    return { isMenuOpen, currentView, toggleMenu };
  },
};
</script>

<style scoped>
/* 讓整個畫面使用 Flexbox */
.container {
  display: flex;
  height: 100vh;
}

/* 左側導覽列 */
.sidebar {
  width: 200px;
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

/* 導覽列樣式 */
.sidebar h2 {
  font-size: 20px;
  margin-bottom: 10px;
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

.sidebar ul li:hover {
  background: #1abc9c;
}

/* 主要內容區域 */
.content {
  flex-grow: 1;
  margin-left: 200px;
  padding: 20px;
}

/* 頁面標頭 */
header {
  background-color: #ecf0f1;
  padding: 15px;
  border-bottom: 2px solid #ccc;
}

/* 主要內容區 */
main {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 80vh;
}

/* 頁腳 */
footer {
  text-align: center;
  padding: 10px;
  background-color: #ecf0f1;
}

/* ========== RWD 響應式設計 ========== */
/* 小螢幕 (手機版) */
@media (max-width: 768px) {
  /* 隱藏左側導覽列 */
  .sidebar {
    transform: translateX(-100%);
    width: 250px;
  }

  /* 主要內容區域不再受 margin-left 限制 */
  .content {
    margin-left: 0;
  }

  /* 當導覽列開啟時，滑出來 */
  .sidebar.open {
    transform: translateX(0);
  }

  /* 漢堡選單按鈕 */
  .menu-btn {
    position: fixed;
    top: 10px;
    left: 10px;
    background-color: #1abc9c;
    color: white;
    border: none;
    font-size: 24px;
    padding: 10px;
    cursor: pointer;
    z-index: 1000;
    border-radius: 5px;
  }
}
</style>
