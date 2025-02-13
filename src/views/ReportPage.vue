<template>
    <div class="report-container">
      <h2>📊 收支類別統計</h2>
  
      <!-- 選擇月份 -->
      <div class="filter-box">
        <label>📅 選擇月份：</label>
        <input type="month" v-model="selectedMonth" @change="updateCharts" class="input-field" />
      </div>
  
      <div class="charts">
        <!-- 圓餅圖 -->
        <div class="chart-box">
          <h3>💰 支出類別比例</h3>
          <canvas id="expenseCategoryChart"></canvas>
        </div>
        <div class="chart-box">
          <h3>💵 收入類別比例</h3>
          <canvas id="incomeCategoryChart"></canvas>
        </div>
      </div>
    </div>
</template>
  
<script setup>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const records = ref([]);
const selectedMonth = ref(new Date().toISOString().slice(0, 7));
let expenseChart = null;
let incomeChart = null;

onMounted(() => {
  const savedRecords = localStorage.getItem('records');
  if (savedRecords) {
    records.value = JSON.parse(savedRecords);
  }
  updateCharts();
});

// **篩選當月的記帳紀錄**
const filteredRecords = () => {
  return records.value.filter(record => record.date.startsWith(selectedMonth.value));
};

// **統計支出類別**
const getExpenseData = () => {
  const categories = {
    飲食: 0,
    交通: 0,
    娛樂: 0,
    醫療: 0,
    其他: 0
  };

  filteredRecords().forEach(record => {
    if (record.category === 'expense') {
      const subCategory = record.subCategory || '其他';
      categories[subCategory] = (categories[subCategory] || 0) + record.amount;
    }
  });

  return categories;
};

// **統計收入類別**
const getIncomeData = () => {
  const categories = {
    薪資: 0,
    投資: 0,
    獎金: 0,
    其他: 0
  };

  filteredRecords().forEach(record => {
    if (record.category === 'income') {
      const subCategory = record.subCategory || '其他';
      categories[subCategory] = (categories[subCategory] || 0) + record.amount;
    }
  });

  return categories;
};

// **更新圖表**
const updateCharts = () => {
  if (expenseChart) expenseChart.destroy();
  if (incomeChart) incomeChart.destroy();

  const expenseData = getExpenseData();
  const incomeData = getIncomeData();

  const expenseCtx = document.getElementById('expenseCategoryChart');
  const incomeCtx = document.getElementById('incomeCategoryChart');

  expenseChart = new Chart(expenseCtx, {
    type: 'pie',
    data: {
      labels: Object.keys(expenseData),
      datasets: [{
        data: Object.values(expenseData),
        backgroundColor: ['#FF6384', '#FF9F40', '#FFCD56', '#4BC0C0', '#36A2EB']
      }]
    },
    options: {
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
    },
    plugins: [ChartDataLabels]
  });

  incomeChart = new Chart(incomeCtx, {
    type: 'pie',
    data: {
      labels: Object.keys(incomeData),
      datasets: [{
        data: Object.values(incomeData),
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFEB3B', '#9E9E9E']
      }]
    },
    options: {
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
    },
    plugins: [ChartDataLabels]
  });
};

watch(selectedMonth, updateCharts);
</script>
  
<style scoped>
.report-container {
  max-width: 900px;
  margin: auto;
  text-align: center;
  padding: 20px;
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
  padding: 15px;
  background: #fff;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
</style>
