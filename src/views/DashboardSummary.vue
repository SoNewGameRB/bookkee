<template>
    <div class="summary-container">
      <h2>📈 月結餘 & 預算管理</h2>
  
      <div class="top-section">
        <!-- 月份選擇 -->
        <div class="filter-box">
          <label>📅 選擇月份：</label>
          <input type="month" v-model="selectedMonth" @change="updateSummary" />
        </div>
  
        <!-- 預算管理 -->
        <div class="budget-box">
          <h3>🎯 預算設定</h3>
          <label>選擇預算比例：</label>
          <select v-model="selectedPercentage" @change="updateBudget">
            <option value="50">50%（節約模式）</option>
            <option value="60">60%</option>
            <option value="70">70%</option>
            <option value="80">80%</option>
            <option value="90">90%（寬鬆模式）</option>
            <option value="custom">自訂</option>
          </select>
  
          <input
            v-if="selectedPercentage === 'custom'"
            type="number"
            v-model="customBudget"
            placeholder="輸入預算"
            @input="saveCustomBudget"
          />
          <p><strong>當月預算：</strong> {{ budget }} 元</p>
        </div>
      </div>
  
      <!-- 預算達標警告 -->
      <div class="alert-box" v-if="budgetUsage >= 80">
        <p v-if="budgetUsage >= 80 && budgetUsage < 90" class="warning">⚠️ 你已花掉 80% 預算，請注意支出</p>
        <p v-if="budgetUsage >= 90 && budgetUsage < 100" class="warning">⚠️ 你已花掉 90% 預算，請謹慎管理</p>
        <p v-if="budgetUsage >= 100" class="critical-warning">🚨 你已超出預算，請控制開銷！</p>
      </div>
  
      <!-- 月結餘資訊 -->
      <div class="summary-box">
        <h3>📊 當月結餘</h3>
        <p><strong>總收入：</strong> {{ totalIncome }} 元</p>
        <p><strong>總支出：</strong> {{ totalExpense }} 元</p>
        <p :class="remainingBalance < 0 ? 'negative' : 'positive'">
          <strong>結餘：</strong> {{ remainingBalance }} 元
        </p>
        <p v-if="remainingBalance < 0" class="warning">⚠️ 你的支出超過收入！</p>
      </div>
  
      <!-- 建議減少的支出 -->
      <div class="suggest-box" v-if="budgetExceeded">
        <h3>⚠️ 減少支出建議</h3>
        <p>你的支出已超過預算，建議減少以下類別開銷：</p>
        <ul>
          <li v-for="(category, index) in suggestedCategories" :key="index">
            📌 {{ category }}（{{ categorySpending[category] }} 元）
          </li>
        </ul>
      </div>
  
      <!-- 預算歷史記錄 -->
      <div class="history-box">
  <h3>📜 預算歷史</h3>
  <p v-if="filteredBudgetHistory.length === 0">當月沒有預算記錄</p>
  <table v-else>
    <thead>
      <tr>
        <th>月份</th>
        <th>收入</th>
        <th>支出</th>
        <th>預算</th>
        <th>超支</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(entry, index) in filteredBudgetHistory" :key="index">
        <td>{{ entry.month }}</td>
        <td>{{ entry.income }} 元</td>
        <td>{{ entry.expense }} 元</td>
        <td>{{ entry.budget }} 元</td>
        <td>{{ entry.overBudget ? '✔' : '❌' }}</td>
      </tr>
    </tbody>
  </table>
</div>



    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  
  // **初始化數據**
  const records = ref([]);
  const selectedMonth = ref(new Date().toISOString().slice(0, 7));
  const selectedPercentage = ref("70");
  const customBudget = ref(0);
  const budget = ref(0);
  const budgetHistory = ref([]);
  const categorySpending = ref({});
  
  const filteredBudgetHistory = computed(() => {
    console.log(filteredBudgetHistory);

  return budgetHistory.value.filter(entry => entry.month === selectedMonth.value);
  
});
  // **計算收入與支出**
  const totalIncome = computed(() => {
    return records.value
      .filter(record => record.category === 'income' && record.date.startsWith(selectedMonth.value))
      .reduce((sum, record) => sum + record.amount, 0);
  });
  
  const totalExpense = computed(() => {
    return records.value
      .filter(record => record.category === 'expense' && record.date.startsWith(selectedMonth.value))
      .reduce((sum, record) => sum + record.amount, 0);
  });
  
  const remainingBalance = computed(() => totalIncome.value - totalExpense.value);
  const budgetUsage = computed(() => (budget.value > 0 ? ((totalExpense.value / budget.value) * 100).toFixed(0) : 0));
  const budgetExceeded = computed(() => totalExpense.value > budget.value);
  
  // **建議減少的類別**
  const suggestedCategories = computed(() => {
    if (!budgetExceeded.value) return [];
    return Object.entries(categorySpending.value)
      .sort((a, b) => b[1] - a[1])
      .map(([category]) => category)
      .slice(0, 2);
  });
  
  // **更新預算**
  const updateBudget = () => {
  if (selectedPercentage.value === "custom") {
    budget.value = customBudget.value;
  } else {
    budget.value = (totalIncome.value * (parseInt(selectedPercentage.value) / 100)).toFixed(0);
  }

  // ✅ 先讀取已存的 budgetHistory，確保不會覆蓋
  const savedHistory = localStorage.getItem('budgetHistory');
  let historyData = savedHistory ? JSON.parse(savedHistory) : [];

  // ✅ 找到當前月份的紀錄，確保不會覆蓋過去的數據
  const existingIndex = historyData.findIndex(entry => entry.month === selectedMonth.value);
  const historyEntry = {
    month: selectedMonth.value,
    income: totalIncome.value,
    expense: totalExpense.value,
    budget: budget.value,
    overBudget: totalExpense.value > budget.value
  };

  if (existingIndex !== -1) {
    historyData[existingIndex] = historyEntry; // **更新當月的數據**
  } else {
    historyData.push(historyEntry); // **新增新月份的數據**
  }

  // ✅ 儲存完整的 budgetHistory，而不只是單個月份
  localStorage.setItem('budgetHistory', JSON.stringify(historyData));
  budgetHistory.value = historyData; // ✅ 立即更新畫面
};




  
  // **載入歷史與記錄**
  onMounted(() => {
  const savedRecords = localStorage.getItem('records');
  if (savedRecords) {
    records.value = JSON.parse(savedRecords);
  }

  // ✅ 讀取完整的 `budgetHistory`
  const savedHistory = localStorage.getItem('budgetHistory');
  if (savedHistory) {
    budgetHistory.value = JSON.parse(savedHistory);
  }

  // ✅ 讀取當前月份的 `budget`
  const savedBudget = localStorage.getItem(`budget_${selectedMonth.value}`);
  if (savedBudget) {
    budget.value = parseFloat(savedBudget);
  } else {
    budget.value = 0; // **避免 NaN**
  }

  updateBudget(); // ✅ 確保預算記錄正確
});







  </script>
  
  <style scoped>
  .summary-container {
    max-width: 900px;
    margin: auto;
    padding: 20px;
  }
  
  .top-section {
    display: flex;
    justify-content: space-between;
  }
  
  .card, .budget-box, .summary-box, .suggest-box, .history-box {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }
  
  .warning {
    color: orange;
  }
  
  .critical-warning {
    color: red;
    font-weight: bold;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
  }
  
  th {
    background: #f5f5f5;
  }
  </style>
  