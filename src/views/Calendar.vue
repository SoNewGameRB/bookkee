<script setup>
import { ref, onMounted, nextTick } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

// ✅ 事件列表（響應式）
const events = ref([
  { title: 'event 1', start: '2025-03-01' },
  { title: 'event 2', start: '2025-03-02' }
]);

// ✅ FullCalendar 設定
const calendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  events: events.value, // 🔹 讓 Vue 追蹤事件變化
  dateClick: (info) => {
    console.log("📅 你點擊的日期:", info.dateStr);
  }
});

// ✅ 確保 Vue 掛載時正確更新行事曆
onMounted(() => {
  console.log("🚀 初始化 FullCalendar");
  console.log("📅 載入的事件:", events.value);

  nextTick(() => {
    if (calendarOptions.value) {
      calendarOptions.value.events = [...events.value]; // 強制更新
    }
  });
});
</script>

<template>
  <FullCalendar :options="calendarOptions" />
</template>
