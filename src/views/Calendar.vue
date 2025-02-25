<template>
    <div class="calendar-container">
      <!-- ✅ 桌機版 -->
      <div class="desktop-view" v-if="!isMobile">
        <div class="calendar-section">
          <vue-cal
            :events="formattedEvents"
            :time="false"
            default-view="month"
            hide-view-selector
            :locale="customLocale"
            @cell-click="selectDate"
            class="custom-calendar"
          />
        </div>
  
        <!-- ✅ 當月所有紀錄與盈餘 -->
        <div class="details-section">
          <h2>📅 {{ currentMonth }} 記帳紀錄</h2>
          <ul>
            <li v-for="(record, index) in currentMonthRecords" :key="index">
              {{ record.date }} - {{ record.subCategory }}: {{ record.amount }} 元
            </li>
          </ul>
          <p class="total">💰 當月盈餘：{{ monthlyBalance }} 元</p>
        </div>
      </div>
  
      <!-- ✅ 手機版 -->
      <div class="mobile-view" v-if="isMobile">

<vue-cal
            :events="formattedEvents"
            :time="false"
            default-view="month"
            hide-view-selector
            :locale="customLocale"
            @cell-click="openModal"
            class="custom-calendar mobile-calendar"
          />

  
        <div v-if="showModal" class="modal-overlay">
          <div class="modal">
            <h2>📅 {{ selectedDate }} 記帳紀錄</h2>
            <ul>
              <li v-for="(record, index) in selectedRecords" :key="index">
                {{ record.subCategory }} - {{ record.amount }} 元
              </li>
            </ul>
            <p class="total">💰 當日累積盈餘：{{ dailyBalance }} 元</p>
            <button @click="showModal = false" class="close-btn">關閉</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from "vue";
  import VueCal from "vue-cal";
  import "vue-cal/dist/vuecal.css";
  
  const records = ref([]);
  const selectedDate = ref("");
  const selectedRecords = ref([]);
  const showModal = ref(false);
  const isMobile = ref(window.innerWidth <= 768);
  const currentMonth = ref(""); // 當前月份
  
  const customLocale = {
    months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
    weekDays: ["日", "一", "二", "三", "四", "五", "六"],
    weekDaysShort: ["日", "一", "二", "三", "四", "五", "六"],
    weekStart: 0,
  };
  
  // **初始化從 LocalStorage 讀取記帳紀錄**
  onMounted(() => {
  const savedRecords = localStorage.getItem("records");
  if (savedRecords) {
    records.value = JSON.parse(savedRecords).map(r => ({
      ...r,
      date: new Date(r.date).toISOString().split("T")[0]
    }));
  }
});


  
  // **格式化記帳紀錄供行事曆使用**
  const formattedEvents = computed(() => {
    return records.value.map(record => ({
      start: new Date(record.date),
      end: new Date(record.date),
      title: record.category === "income" ? `🟢 收入：${record.amount}元` : `🔴 支出：${record.amount}元`,
      class: record.category === "income" ? "income-event" : "expense-event",
    }));
  });
  
  // **計算當前月份的盈餘**
  const currentMonthRecords = computed(() => {
    const today = new Date();
    const month = today.toISOString().slice(0, 7); // yyyy-mm
    currentMonth.value = `${month.split("-")[0]}年${month.split("-")[1]}月`;
  
    return records.value.filter(record => record.date.startsWith(month));
  });
  
  // **計算當前月份的總盈餘**
  const monthlyBalance = computed(() => {
    return currentMonthRecords.value.reduce((sum, record) => {
      return record.category === "income" ? sum + record.amount : sum - record.amount;
    }, 0);
  });
  
  // **計算當日累積盈餘**
  const dailyBalance = computed(() => {
    let total = 0;
    return selectedRecords.value.map(record => {
      total += record.category === "income" ? record.amount : -record.amount;
      return total;
    }).pop() || 0;
  });
  
  // **點擊日期時，顯示該日記錄**
  const selectDate = ({ date }) => {
    if (!date) return;
  
    let validDate = new Date(date);
    if (isNaN(validDate)) return;
  
    selectedDate.value = validDate.toISOString().split("T")[0];
    selectedRecords.value = records.value.filter(r => r.date === selectedDate.value);
  };
  
  // **手機版點擊日期後顯示 Modal**
  const openModal = (event) => {
  console.log("VueCal 傳遞的日期:", event);

  if (!event || isNaN(new Date(event))) {
    console.warn("❌ VueCal 傳遞的 `date` 無效:", event);
    return;
  }

  let validDate = new Date(event);
  
  // ✅ 使用當地時區，確保 `YYYY-MM-DD` 格式
  selectedDate.value = validDate.toLocaleDateString('sv-SE');

  console.log("修正時區後的 selectedDate:", selectedDate.value);

  // 🔹 確保 `records.value` 內的日期與 `selectedDate.value` 一致
  selectedRecords.value = records.value.filter(r => r.date === selectedDate.value);

  console.log("找到的記帳紀錄:", selectedRecords.value);

  if (selectedRecords.value.length > 0) {
    showModal.value = true;
  } else {
    alert("❌ 該日沒有記帳紀錄！");
  }
};




  </script>
  
  <style scoped>
  /* 📌 PC 版 */
  .calendar-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .desktop-view {
    display: flex;
    width: 95%;
    height: 800px;
    max-width: 1300px;
    gap: 30px;
  }
  
  .calendar-section {
    width: 65%;
  }
  
  .details-section {
    width: 35%;
    padding: 20px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0px 4px 10px rgba(0,0,0,0.1);
  }
  
  /* 📌 手機版 */
  .mobile-view {
    width: 100%;
    padding: 15px;
  }
  
  /* 📌 手機版行事曆放大 */
  .mobile-calendar {
    transform: scale(1.2);
    transform-origin: center;
    height: 300px;
  }
  
  /* 📌 手機版彈窗 */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .modal {
    background: white;
    padding: 5px;
    border-radius: 10px;
    width: 85%;
    font-size: 18px;
  }
  
  .close-btn {
    background: #dc3545;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 5px;
    margin-top: 15px;
  }
  
  /* 📌 記帳顏色 */
  .income-event {
    background-color: #28a745 !important;
    color: white;
  }
  
  .expense-event {
    background-color: #dc3545 !important;
    color: white;
  }
  </style>
  