<template>
    <div class="main-container">
      <!-- 左側區塊：新增記帳 + 記帳紀錄 -->
      <div class="left-section">
        <div class="box">
          <h2>新增記帳</h2>
          <!-- 記帳表單 -->
          <form @submit.prevent="addRecord">
            <div class="form-group">
              <label>金額：</label>
              <input type="number" v-model="amount" required />
            </div>
    
            <div class="form-group">
              <label>類別：</label>
              <select v-model="category">
                <option value="income">收入</option>
                <option value="expense">支出</option>
              </select>
            </div>
    
            <div class="form-group">
              <label>日期：</label>
              <input type="date" v-model="date" required />
            </div>
    
            <div class="form-group">
              <label>備註：</label>
              <input type="text" v-model="note" placeholder="(選填)" />
            </div>
    
            <button type="submit">新增記帳</button>
          </form>
        </div>
    
        <div class="box">
          <h3>記帳紀錄</h3>
          <ul class="record-list">
            <li v-for="(record, index) in records" :key="index" class="record-item">
              <div class="record-entry">{{ record.date }}</div>
              <div class="record-entry">{{ record.category === 'income' ? '收入' : '支出' }}: {{ record.amount }} 元</div>
              <div class="record-entry">{{ record.note }}</div>
              <button class="delete-btn" @click="deleteRecord(index)">刪除</button>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- 右側區塊：圓餅圖 -->
      <div class="right-section">
        <div class="chart-container">
          <canvas id="expenseChart"></canvas>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const amount = ref('');
const category = ref('income');
const date = ref('');
const note = ref('');
const records = ref([]);
let chartInstance = null;

onMounted(() => {
  const savedRecords = localStorage.getItem('records');
  if (savedRecords) {
    records.value = JSON.parse(savedRecords);
  }
  updateChart();
});

const addRecord = () => {
  const newRecord = {
    amount: parseFloat(amount.value),
    category: category.value,
    date: date.value,
    note: note.value,
  };

  records.value.push(newRecord);
  localStorage.setItem('records', JSON.stringify(records.value));

  amount.value = '';
  date.value = '';
  note.value = '';

  updateChart();
};

const deleteRecord = (index) => {
  records.value.splice(index, 1);
  localStorage.setItem('records', JSON.stringify(records.value));
  updateChart();
};

const updateChart = () => {
  if (chartInstance) {
    chartInstance.destroy();
  }
  const ctx = document.getElementById('expenseChart');
  const expenseTotal = records.value.filter(r => r.category === 'expense').reduce((sum, r) => sum + r.amount, 0);
  const incomeTotal = records.value.filter(r => r.category === 'income').reduce((sum, r) => sum + r.amount, 0);
  
  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['收入', '支出'],
      datasets: [{
        data: [incomeTotal, expenseTotal],
        backgroundColor: ['#28a745', '#dc3545']
      }]
    },
    options: {
      plugins: {
        datalabels: {
          color: '#fff',
          font: {
            weight: 'bold',
            size: 14
          },
          formatter: (value) => value + ' 元',
        }
      }
    },
    plugins: [ChartDataLabels]
  });
};

watch(records, updateChart, { deep: true });
</script>

<style scoped>
.main-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  align-items: flex-start;
}

.left-section {
  width: 100%;
  max-width: 600px;
}

.right-section {
  width: 100%;
  max-width: 400px;
}

@media (min-width: 768px) {
  .main-container {
    flex-wrap: nowrap;
  }
  .left-section {
    width: 50%;
  }
  .right-section {
    width: 30%;
  }
}

.box {
  background: #f9f9f9;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  margin-bottom: 20px;
}

.record-list {
  list-style-type: none;
  padding: 0;
}

.record-item {
  background: white;
  padding: 15px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
  border: 1px solid #ddd;
}

.delete-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 5px;
  cursor: pointer;
}

.delete-btn:hover {
  background: #c82333;
}

.chart-container {
  text-align: center;
}
</style>
