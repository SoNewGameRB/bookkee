<template>
  <div class="report-container">
    <h2>📊 收支類別統計</h2>

    <!-- 📌 選擇月份 -->
    <div class="filter-box">
      <label>📅 選擇月份：</label>
      <input type="month" v-model="selectedMonth" @change="updateCharts" class="input-field" />
    </div>

    <!-- 📌 選擇顯示模式 -->
    <div class="filter-box">
      <label>📊 顯示模式：</label>
      <select v-model="displayMode" @change="updateCharts" class="input-field">
        <option value="combined">混合模式</option>
        <option value="separate">分開模式</option>
        <option value="all">同時顯示</option>
      </select>
    </div>

    <!-- 📌 選擇圖表類型 -->
    <div class="filter-box">
      <label>📊 圖表類型：</label>
      <select v-model="chartType" @change="updateCharts" class="input-field">
        <option value="pie">圓餅圖</option>
        <option value="bar">長條圖</option>
      </select>
    </div>

    <div class="charts">
      <!-- 📌 混合模式 -->
      <div v-if="displayMode === 'combined' || displayMode === 'all'" class="chart-box">
        <h3>🔄 收支整體比例</h3>
        <canvas ref="combinedChartRef"></canvas>
        <p v-if="isEmpty(combinedData)">⚠️ 沒有資料可顯示</p>
      </div>

      <!-- 📌 分開模式 -->
      <div v-if="displayMode === 'separate' || displayMode === 'all'">
        <div class="chart-box">
          <h3>💰 支出類別比例</h3>
          <canvas ref="expenseChartRef"></canvas>
          <p v-if="isEmpty(expenseData)">⚠️ 沒有支出資料</p>
        </div>
        <div class="chart-box">
          <h3>💵 收入類別比例</h3>
          <canvas ref="incomeChartRef"></canvas>
          <p v-if="isEmpty(incomeData)">⚠️ 沒有收入資料</p>
        </div>
      </div>
    </div>
  </div>
</template>



<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// 📌 參考元素（Vue 3 使用 ref 代替 getElementById）
const combinedChartRef = ref(null);
const expenseChartRef = ref(null);
const incomeChartRef = ref(null);

const records = ref([]);
const selectedMonth = ref(new Date().toISOString().slice(0, 7));
const displayMode = ref('combined'); // 預設為混合模式
const chartType = ref('pie'); // 預設顯示圓餅圖

let combinedChart = null;
let expenseChart = null;
let incomeChart = null;

// 📌 計算當月的記帳紀錄
const filteredRecords = computed(() => {
  return records.value.filter(record => record.date.startsWith(selectedMonth.value));
});

// 📌 計算支出類別
const expenseData = computed(() => {
  const categories = {};
  filteredRecords.value.forEach(record => {
    if (record.category === 'expense') {
      categories[record.subCategory] = (categories[record.subCategory] || 0) + record.amount;
    }
  });
  return categories;
});

// 📌 計算收入類別
const incomeData = computed(() => {
  const categories = {};
  filteredRecords.value.forEach(record => {
    if (record.category === 'income') {
      categories[record.subCategory] = (categories[record.subCategory] || 0) + record.amount;
    }
  });
  return categories;
});

// 📌 計算「收入+支出」整體類別比例
const combinedData = computed(() => {
  const categories = {};
  filteredRecords.value.forEach(record => {
    const key = `${record.category === 'income' ? '收入' : '支出'} - ${record.subCategory}`;
    categories[key] = (categories[key] || 0) + record.amount;
  });
  return categories;
});

// 📌 檢查是否為空物件
const isEmpty = (data) => Object.keys(data).length === 0;

// 📌 更新圖表
const updateCharts = async () => {
  await nextTick(); // ✅ 確保 `canvas` 已經存在

  if (combinedChart) combinedChart.destroy();
  if (expenseChart) expenseChart.destroy();
  if (incomeChart) incomeChart.destroy();

  const chartOptions = {
    plugins: {
      datalabels: {
        color: 'black',
        font: { weight: 'bold', size: 14 },
        formatter: (value, ctx) => {
          const sum = ctx.dataset.data.reduce((a, b) => a + b, 0);
          return ((value / sum) * 100).toFixed(1) + '%';
        }
      }
    }
  };

  if ((displayMode.value === 'combined' || displayMode.value === 'all') && combinedChartRef.value) {
    combinedChart = new Chart(combinedChartRef.value, {
      type: chartType.value,
      data: {
        labels: Object.keys(combinedData.value),
        datasets: [{ data: Object.values(combinedData.value), backgroundColor: ['#4BC0C0', '#FF6384', '#36A2EB', '#FF9F40', '#FFCD56'] }]
      },
      options: chartOptions,
      plugins: [ChartDataLabels]
    });
  }

  if ((displayMode.value === 'separate' || displayMode.value === 'all') && expenseChartRef.value) {
    expenseChart = new Chart(expenseChartRef.value, {
      type: chartType.value,
      data: {
        labels: Object.keys(expenseData.value),
        datasets: [{ data: Object.values(expenseData.value), backgroundColor: ['#FF6384', '#FF9F40', '#FFCD56', '#4BC0C0', '#36A2EB'] }]
      },
      options: chartOptions,
      plugins: [ChartDataLabels]
    });
  }

  if ((displayMode.value === 'separate' || displayMode.value === 'all') && incomeChartRef.value) {
    incomeChart = new Chart(incomeChartRef.value, {
      type: chartType.value,
      data: {
        labels: Object.keys(incomeData.value),
        datasets: [{ data: Object.values(incomeData.value), backgroundColor: ['#42A5F5', '#66BB6A', '#FFEB3B', '#9E9E9E'] }]
      },
      options: chartOptions,
      plugins: [ChartDataLabels]
    });
  }
};

onMounted(() => {
  const savedRecords = localStorage.getItem('records');
  if (savedRecords) {
    records.value = JSON.parse(savedRecords);
  }
  updateCharts();
});

watch(selectedMonth, updateCharts);
watch(displayMode, updateCharts);
watch(chartType, updateCharts);
</script>





<style scoped>
.report-container {
  max-width: 900px;
  margin: auto;
  text-align: center;
  padding-bottom: 100px;
}

.filter-box {
  margin-bottom: 20px;
}

.input-field {
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
  width: 100%;
  max-width: 300px;
}

.charts {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.chart-box {
  width: 45%;
  min-width: 300px;
  padding: 10px;
  background: #fff;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
</style>
