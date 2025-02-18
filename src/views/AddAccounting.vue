<template>
  <div class="main-container">
    <div class="left-section">
      <div class="box">
        <h2>新增記帳</h2>
        <form @submit.prevent="addRecord" class="form">
          
          <div class="form-group">
            <label>金額：
              <input type="number" v-model="amount" required class="input-field" />
            </label>
          </div>

          <div class="form-group">
            <label>類別：
              <select v-model="category" class="input-field">
                <option value="income">收入</option>
                <option value="expense">支出</option>
              </select>
            </label>
          </div>

          <!-- 📌 類別選擇 -->
          <div class="form-group">
            <label>類別細項：
              <select v-model="subCategory" class="input-field" @change="checkNewCategory">
                <option v-for="option in availableCategories" :key="option" :value="option">{{ option }}</option>
                <option value="new">+ 新增類別</option> <!-- 這是新增的選項 -->
              </select>
            </label>
          </div>

          <!-- 📌 當選擇「新增類別」時，顯示輸入框 -->
          <div class="form-group" v-if="showNewCategoryInput">
            <label>新類別名稱：
              <input type="text" v-model="newCategory" class="input-field" @keyup.enter="addNewCategory" placeholder="輸入新類別名稱..." />
            </label>
          </div>

          <div class="form-group">
            <label>日期：
              <input type="date" v-model="date" required class="input-field" />
            </label>
          </div>

          <div class="form-group">
            <label>備註：
              <input type="text" v-model="note" placeholder="(選填)" class="input-field" />
            </label>
          </div>

          <button type="submit" class="submit-btn">新增記帳</button>
        </form>
        <!-- 📌 搜尋 & 篩選 -->
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
            <div class="record-entry">{{ record.date }}</div>
            <div class="record-entry">{{ record.category === 'income' ? '收入' : '支出' }} - {{ record.subCategory }}: {{ record.amount }} 元</div>
            <div class="record-entry">{{ record.note }}</div>
            <button class="delete-btn" @click="deleteRecord(index)">刪除</button>
          </li>
        </ul>
      </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// **記帳輸入值**
const amount = ref('');
const category = ref('income'); // 預設收入
const subCategory = ref('');
const newCategory = ref('');
const showNewCategoryInput = ref(false);
const date = ref('');
const note = ref('');
const records = ref([]);
const searchQuery = ref('');
const filterCategory = ref('');
const selectedMonth = ref(new Date().toISOString().slice(0, 7));

// **預設類別**
const defaultIncomeCategories = ["薪資", "投資", "獎金", "其他"];
const defaultExpenseCategories = ["飲食", "交通", "娛樂", "醫療", "購物", "房租", "其他"];
// **從 localStorage 讀取用戶自訂類別**
const incomeCategories = ref([]);
const expenseCategories = ref([]);

onMounted(() => {
  const savedRecords = localStorage.getItem('records');
  if (savedRecords) {
    records.value = JSON.parse(savedRecords);
  }

  // 讀取 localStorage 中的自訂類別
  const savedIncomeCategories = localStorage.getItem('incomeCategories');
  incomeCategories.value = savedIncomeCategories ? JSON.parse(savedIncomeCategories) : [...defaultIncomeCategories];

  const savedExpenseCategories = localStorage.getItem('expenseCategories');
  expenseCategories.value = savedExpenseCategories ? JSON.parse(savedExpenseCategories) : [...defaultExpenseCategories];
});

// **動態選擇對應的類別**
const availableCategories = computed(() => {
  return category.value === 'income' ? incomeCategories.value : expenseCategories.value;
});

// **檢查是否選擇「新增類別」**
const checkNewCategory = () => {
  if (subCategory.value === "new") {
    showNewCategoryInput.value = true;
    newCategory.value = "";
  } else {
    showNewCategoryInput.value = false;
  }
};

// **新增自訂類別**
const addNewCategory = () => {
  if (newCategory.value.trim() !== "" && !availableCategories.value.includes(newCategory.value)) {
    if (category.value === "income") {
      incomeCategories.value.push(newCategory.value);
      localStorage.setItem('incomeCategories', JSON.stringify(incomeCategories.value));
    } else {
      expenseCategories.value.push(newCategory.value);
      localStorage.setItem('expenseCategories', JSON.stringify(expenseCategories.value));
    }

    // **將 subCategory 設為新類別**
    subCategory.value = newCategory.value;
    showNewCategoryInput.value = false;
  }
};
// **計算篩選後的記帳紀錄**
const filteredRecords = computed(() => {
  return records.value.filter(record => {
    const keyword = searchQuery.value.trim().toLowerCase(); // ✅ 去除前後空白並轉小寫
    const matchesSearch =
      keyword === '' ||
      record.note.toLowerCase().includes(keyword) ||  // ✅ 忽略大小寫比對 `note`
      record.subCategory.toLowerCase().includes(keyword) || // ✅ 在類別細項中搜尋
      record.amount.toString().includes(keyword); // ✅ 在金額內搜尋

    const matchesCategory = filterCategory.value === '' || record.category === filterCategory.value;
    
    return matchesSearch && matchesCategory && record.date.startsWith(selectedMonth.value);
  });
});


// **新增記帳**
const addRecord = () => {
  if (!amount.value || !date.value || !subCategory.value) {
    alert("⚠️ 請填寫完整的記帳資料！");
    return;
  }

  // ✅ 如果使用者選擇 "new"，則替換為輸入的 `newCategory`
  let finalCategory = subCategory.value === "new" ? newCategory.value.trim() : subCategory.value;

  if (!finalCategory) {
    alert("⚠️ 類別名稱不能為空！");
    return;
  }

  const newRecord = {
    amount: parseFloat(amount.value),
    category: category.value,
    subCategory: finalCategory, // ✅ 使用正確的類別名稱
    date: date.value,
    note: note.value,
  };

  // ✅ 更新記帳紀錄
  records.value.push(newRecord);
  localStorage.setItem('records', JSON.stringify(records.value));

  // ✅ 若有新增類別，確保記錄進 `localStorage`
  if (!availableCategories.value.includes(finalCategory)) {
    if (category.value === "income") {
      incomeCategories.value.push(finalCategory);
      localStorage.setItem('incomeCategories', JSON.stringify(incomeCategories.value));
    } else {
      expenseCategories.value.push(finalCategory);
      localStorage.setItem('expenseCategories', JSON.stringify(expenseCategories.value));
    }
  }

  // ✅ 清空輸入欄位
  amount.value = '';
  subCategory.value = '';
  newCategory.value = '';
  date.value = '';
  note.value = '';
  showNewCategoryInput.value = false;

  // ✅ 顯示通知
  alert("✅ 記帳成功！");

  // ✅ 重新載入過濾後的記錄
  updateFilteredRecords();
};


// **刪除記帳**
const deleteRecord = (index) => {
  records.value.splice(index, 1);
  localStorage.setItem('records', JSON.stringify(records.value));
};

</script>


<style scoped>
.main-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  align-items: flex-start;
  max-width: 1000px;
  margin: auto;
  padding-bottom: 100px;
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
  box-sizing: border-box; /* 確保 padding 不影響寬度 */
  display: block; /* 讓 input/select 獨占一行 */
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
