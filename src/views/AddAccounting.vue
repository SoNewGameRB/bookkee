<template>
    <div class="main-container">
      <!-- 左側區塊：新增記帳 + 記帳紀錄 -->
      <div class="left-section">
        <div class="box">
          <h2>新增記帳</h2>
          <!-- 記帳表單 -->
          <form @submit.prevent="addRecord" class="form">
            <div class="form-group">
              <label>金額：</label>
              <input type="number" v-model="amount" required class="input-field" />
            </div>
    
            <div class="form-group">
              <label>類別：</label>
              <select v-model="category" class="input-field">
                <option value="income">收入</option>
                <option value="expense">支出</option>
              </select>
            </div>
    
            <div class="form-group" v-if="category === 'income'">
              <label>收入類別：</label>
              <select v-model="subCategory" class="input-field">
                <option value="薪資">薪資</option>
                <option value="投資">投資</option>
                <option value="獎金">獎金</option>
                <option value="其他">其他</option>
              </select>
            </div>
    
            <div class="form-group" v-if="category === 'expense'">
              <label>支出類別：</label>
              <select v-model="subCategory" class="input-field">
                <option value="飲食">飲食</option>
                <option value="交通">交通</option>
                <option value="娛樂">娛樂</option>
                <option value="醫療">醫療</option>
                <option value="購物">購物</option>
                <option value="房租">房租</option>
                <option value="其他">其他</option>
              </select>
            </div>
    
            <div class="form-group">
              <label>日期：</label>
              <input type="date" v-model="date" required class="input-field" />
            </div>
    
            <div class="form-group">
              <label>備註：</label>
              <input type="text" v-model="note" placeholder="(選填)" class="input-field" />
            </div>
    
            <button type="submit" class="submit-btn">新增記帳</button>
          </form>
        </div>
    
        <!-- 篩選區塊 -->
        <div class="box">
          <h3>篩選記帳紀錄</h3>
          <div class="form-group">
            <label>篩選月份：</label>
            <input type="month" v-model="selectedMonth" @change="updateFilteredRecords" class="input-field" />
          </div>
          <div class="form-group">
            <label>搜尋：</label>
            <input type="text" v-model="searchQuery" placeholder="搜尋金額或備註..." class="input-field" />
          </div>
          <div class="form-group">
            <label>類別篩選：</label>
            <select v-model="filterCategory" class="input-field">
              <option value="">全部</option>
              <option value="income">收入</option>
              <option value="expense">支出</option>
            </select>
          </div>
        </div>
    
        <div class="box">
          <h3>記帳紀錄</h3>
          <ul class="record-list">
            <li v-for="(record, index) in filteredRecords" :key="index" class="record-item">
              <div v-if="editingIndex !== index" class="record-display">
                <div class="record-entry">{{ record.date }}</div>
                <div class="record-entry">{{ record.category === 'income' ? '收入' : '支出' }} - {{ record.subCategory }}: {{ record.amount }} 元</div>
                <div class="record-entry">{{ record.note }}</div>
                <button class="edit-btn" @click="editRecord(index)">編輯</button>
                <button class="delete-btn" @click="deleteRecord(index)">刪除</button>
              </div>
              
              <div v-else class="record-edit">
                <input type="date" v-model="editedRecord.date" class="input-field" />
                <input type="number" v-model="editedRecord.amount" class="input-field" />
                <input type="text" v-model="editedRecord.note" class="input-field" />
                <button class="save-btn" @click="saveRecord(index)">儲存</button>
                <button class="cancel-btn" @click="cancelEdit">取消</button>
              </div>
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
import { ref, onMounted, watch, computed } from 'vue';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const amount = ref('');
const category = ref('income');
const subCategory = ref('');
const date = ref('');
const note = ref('');
const records = ref([]);
const selectedMonth = ref(new Date().toISOString().slice(0, 7));
const searchQuery = ref('');
const filterCategory = ref('');
const editingIndex = ref(null);
const editedRecord = ref({});
let chartInstance = null;


const filteredRecords = computed(() => {
  return records.value.filter(record => {
    const matchesSearch = searchQuery.value === '' || record.note.includes(searchQuery.value) || record.amount.toString().includes(searchQuery.value);
    const matchesCategory = filterCategory.value === '' || record.category === filterCategory.value;
    return matchesSearch && matchesCategory && record.date.startsWith(selectedMonth.value);
  });
});

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
    subCategory: subCategory.value,
    date: date.value,
    note: note.value,
  };

  records.value.push(newRecord);
  localStorage.setItem('records', JSON.stringify(records.value));
  updateChart();
};

const deleteRecord = (index) => {
  records.value.splice(index, 1);
  localStorage.setItem('records', JSON.stringify(records.value));
  updateChart();
};
const editRecord = (index) => {
  editingIndex.value = index;
  editedRecord.value = { ...records.value[index] };
};
const saveRecord = (index) => {
  records.value[index] = { ...editedRecord.value };
  localStorage.setItem('records', JSON.stringify(records.value));
  editingIndex.value = null;
};

const cancelEdit = () => {
  editingIndex.value = null;
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
      datasets: [{ data: [incomeTotal, expenseTotal], backgroundColor: ['#28a745', '#dc3545'] }]
    },
    options: {
      plugins: { datalabels: { color: '#fff', font: { weight: 'bold', size: 14 }, formatter: (value) => value + ' 元' } }
    },
    plugins: [ChartDataLabels]
  });
};
</script>


<style scoped>
.main-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  align-items: flex-start;
  max-width: 1200px;
  margin: auto;
}

.left-section, .right-section {
  width: 100%;
  max-width: 600px;
}

@media (min-width: 768px) {
  .main-container {
    flex-wrap: nowrap;
  }
  .left-section {
    width: 60%;
  }
  .right-section {
    width: 35%;
  }
}

.box {
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.input-field {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
}

.submit-btn {
  width: 100%;
  padding: 10px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.3s;
}

.submit-btn:hover {
  background: #218838;
}

.record-list {
  list-style-type: none;
  padding: 0;
}

.record-item {
  background: #f8f9fa;
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

.edit-btn, .delete-btn, .save-btn, .cancel-btn {
  padding: 5px 10px;
  margin-right: 5px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.edit-btn {
  background: #ffc107;
}

.save-btn {
  background: #28a745;
  color: white;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}
</style>
