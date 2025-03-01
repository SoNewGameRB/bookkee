<template>
  <div>
    <h2>📅 記帳行事曆</h2>
    <button @click="toggleLanguage">切換語言（{{ locale === 'zh-tw' ? 'English' : '中文' }}）</button>

    <!-- 🔥 透過 `key` 來強制 FullCalendar 重新渲染 -->
    <FullCalendar :key="calendarKey" :options="calendarOptions" />
    
    <!-- 🔥 彈出視窗：當點擊日期時，顯示該天的記帳資訊 -->
    <div v-if="selectedDateRecords.length > 0" class="modal">
      <h3>📌 {{ selectedDate }} 記帳明細</h3>
      <ul>
        <li v-for="(record, index) in selectedDateRecords" :key="index">
          {{ record.subCategory }} - {{ record.amount }} 元
        </li>
      </ul>
      <button @click="closeModal">關閉</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

const db = getFirestore();
const auth = getAuth();
const events = ref([]);
const selectedDate = ref("");
const selectedDateRecords = ref([]);

// 🔹 `calendarKey` 讓 FullCalendar 重新渲染
const calendarKey = ref(0);
// 🔹 定義 `locale`（預設中文）
const locale = ref("zh-tw"); // "zh-tw" = 繁體中文, "en" = 英文

// ✅ FullCalendar 設定
const calendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: "dayGridMonth",
  locale: locale.value, // ✅ 初始語言
  events: events.value,
  dateClick: (info) => {
    console.log("📅 你點擊的日期:", info.dateStr);
    showRecordsForDate(info.dateStr);
  }
});

// 🔹 監聽 `locale` 變更，強制重新渲染 FullCalendar
watch(locale, (newLocale) => {
  console.log("🌍 語言變更為:", newLocale);
  calendarOptions.value.locale = newLocale;
  calendarKey.value++; // ✅ 讓 `key` 變更，強制 Vue 重新渲染 FullCalendar
});

// 🔹 切換語言
const toggleLanguage = () => {
  locale.value = locale.value === "zh-tw" ? "en" : "zh-tw";
};

// ✅ 讀取 Firestore 記帳資料
const loadRecords = async (userId) => {
  const querySnapshot = await getDocs(collection(db, "users", userId, "records"));
  const recordData = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  events.value = recordData.map(record => ({
    title: `${record.subCategory} - ${record.amount}元`,
    start: record.date,
    fullData: record // 🔥 存入完整數據
  }));

  // ✅ 確保行事曆事件更新
  calendarOptions.value.events = [...events.value];
  calendarKey.value++; // 🔥 強制刷新 FullCalendar
};

// ✅ 點擊某天時，顯示記帳明細
const showRecordsForDate = (date) => {
  selectedDate.value = date;
  selectedDateRecords.value = events.value
    .filter(event => event.start === date)
    .map(event => event.fullData);
  console.log("🔍 這天的記帳明細:", selectedDateRecords.value);
};

// ✅ 關閉彈出視窗
const closeModal = () => {
  selectedDateRecords.value = [];
};

// ✅ 檢查登入 & 讀取 Firestore 資料
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("✅ 使用者登入:", user.uid);
      loadRecords(user.uid);
    } else {
      console.warn("⚠️ 未登入，無法讀取記帳資料");
    }
  });
});
</script>

<style scoped>
h2 {
  text-align: center;
  margin-bottom: 20px;
}

/* 🔥 修正 modal 透明問題 */
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white; /* ✅ 設定背景為白色 */
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* ✅ 陰影讓視窗更明顯 */
  z-index: 999; /* ✅ 提升層級，避免被行事曆蓋住 */
  min-width: 300px; /* ✅ 確保寬度足夠 */
  max-width: 80%;
  text-align: center;
}

.modal ul {
  list-style-type: none;
  padding: 0;
}

.modal li {
  padding: 8px;
  border-bottom: 1px solid #ddd;
}

.modal button {
  margin-top: 10px;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.modal button:hover {
  background: #0056b3;
}
</style>
