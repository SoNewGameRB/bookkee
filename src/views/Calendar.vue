<template>
  <div class="container">
    <h2 class="title">📅 記帳行事曆</h2>

    <div class="controls">
      <!-- 🔹 年份選擇 -->
      <select v-model="selectedYear" @change="changeYear">
        <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
      </select>

      <!-- 🔹 月份選擇 -->
      <select v-model="selectedMonth" @change="changeMonth">
        <option v-for="(month, index) in months" :key="index" :value="index + 1">
          {{ month }}
        </option>
      </select>

      <!-- 🔹 語言切換 -->
      <button @click="toggleLanguage">
        切換語言（{{ locale === 'zh-tw' ? 'English' : '中文' }}）
      </button>
    </div>

    <!-- 🔹 FullCalendar -->
    <FullCalendar :key="calendarKey" :options="calendarOptions" />

    <!-- 🔹 記帳明細 Modal -->
    <div v-if="selectedDateRecords.length > 0" class="modal">
      <div class="modal-content">
        <h3>📌 {{ selectedDate }} 記帳明細</h3>
        <ul>
          <li v-for="(record, index) in selectedDateRecords" :key="index">
            {{ record.subCategory }} - {{ record.amount }} 元
          </li>
        </ul>
        <button @click="closeModal">關閉</button>
      </div>
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
// 🔹 年份 & 月份選擇
const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth() + 1);
const availableYears = ref([...Array(10)].map((_, i) => new Date().getFullYear() - 5 + i));
const months = ref([
  "一月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "十一月", "十二月"
]);

// ✅ 切換年份
const changeYear = () => {
  updateCalendarDate();
};

// ✅ 切換月份
const changeMonth = () => {
  updateCalendarDate();
};
// ✅ 更新行事曆顯示時間
const updateCalendarDate = () => {
  const formattedMonth = selectedMonth.value.toString().padStart(2, "0");
  calendarOptions.value.initialDate = `${selectedYear.value}-${formattedMonth}-01`;
  calendarKey.value++;
};
// ✅ FullCalendar 設定
const calendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: "dayGridMonth",
  locale: locale.value,
  events: events.value,
  dateClick: (info) => {
    console.log("📅 你點擊的日期:", info.dateStr);
    showRecordsForDate(info.dateStr);
  },
  eventContent: function (arg) {
    const fullRecords = arg.event.extendedProps.fullRecords || [];
    const firstRecord = fullRecords.length > 0 ? fullRecords[0] : null;
    const moreCount = fullRecords.length - 1;

    if (firstRecord) {
      return {
        html: `<div>${firstRecord.subCategory} - ${firstRecord.amount}元${moreCount > 0 ? " ..." : ""}</div>`
      };
    }
    return {};
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

  // 🔹 按日期分組
  const groupedRecords = {};
  recordData.forEach(record => {
    const date = record.date;
    if (!groupedRecords[date]) {
      groupedRecords[date] = [];
    }
    groupedRecords[date].push(record);
  });

  // 🔹 只存每天的第一筆記帳記錄
  events.value = Object.keys(groupedRecords).map(date => {
    const firstRecord = groupedRecords[date][0]; // 取第一筆
    const moreCount = groupedRecords[date].length - 1; // 計算還有多少筆
    return {
      title: `${firstRecord.subCategory} - ${firstRecord.amount}元${moreCount > 0 ? " ..." : ""}`,
      start: date,
      extendedProps: {
        fullRecords: groupedRecords[date] // 🔥 儲存當日所有記帳資料
      }
    };
  });

  // ✅ 更新 FullCalendar
  calendarOptions.value.events = [...events.value];
  calendarKey.value++; // 🔥 強制刷新 FullCalendar
};


// ✅ 點擊某天時，顯示記帳明細
const showRecordsForDate = (date) => {
  selectedDate.value = date;

  // 🔥 找到該日期的完整記帳資料
  const eventForDate = events.value.find(event => event.start === date);
  selectedDateRecords.value = eventForDate ? eventForDate.extendedProps.fullRecords : [];

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
/* 🔹 版面整體設定 */
.container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 🔹 標題 */
.title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

/* 🔹 選擇年份 & 月份區塊 */
.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

/* 🔹 選擇框 */
select {
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: white;
  cursor: pointer;
}

/* 🔹 按鈕 */
button {
  padding: 8px 12px;
  font-size: 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease-in-out;
}

button:hover {
  background: #0056b3;
}

/* 🔹 行事曆置中 */
.calendar-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

/* 🔹 FullCalendar 樣式 */
.fc {
  max-width: 100%;
  width: 100%;
}

/* 🔹 彈出視窗（Modal） */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  z-index: 5;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  border-bottom: 1px solid #ddd;
  padding: 10px;
}

/* 🔹 RWD - 手機適配 */
@media (max-width: 768px) {
  .controls {
   width: 100%;
    gap: 5px;
  }

  select {
    width: 100%;
  }

  button {
    width: 100%;
    font-size: 10px;
  }
}

/* 🔹 RWD - 行事曆調整 */
@media (max-width: 480px) {
  .fc {
    font-size: 12px;
  }
}

</style>
