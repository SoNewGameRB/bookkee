<template>
  <div class="main-container">
    <div class="left-section">
      <div class="box">
        <h2>新增記帳</h2>
        <div class="total-amount">總金額：{{ totalAmount }} 元</div>

        <form @submit.prevent="addRecord" class="form">
          <div class="form-group">
            <label>金額：
              <input type="number" v-model="amount" required class="input-field" />
            </label>
          </div>

          <div class="form-group">
            <label>類別：
              <select v-model="category" class="input-field" @change="loadCategories">
                <option value="income">收入</option>
                <option value="expense">支出</option>
              </select>
            </label>
          </div>

          <div class="form-group">
            <label>類別細項：
              <select v-model="subCategory" class="input-field" @change="checkNewCategory">
                <option v-for="option in availableCategories" :key="option" :value="option">{{ option }}</option>
                <option value="new">+ 新增類別</option>
              </select>
            </label>
          </div>

          <div class="form-group" v-if="showNewCategoryInput">
            <label>新類別名稱：
              <input type="text" v-model="newCategory" class="input-field" placeholder="輸入新類別名稱..." />
              <button type="button" class="add-category-btn" @click="addNewCategory">新增</button>
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
      </div>

      <div class="box">
        <h3>記帳紀錄</h3>
        <ul class="record-list">
          <li v-for="record in records" :key="record.id" class="record-item">
            <div>{{ record.date }} - {{ record.subCategory }}: {{ record.amount }} 元</div>
            <div>{{ record.note }}</div>
            <button class="delete-btn" @click="deleteRecord(record.id)">刪除</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { getFirestore, collection, doc, addDoc, deleteDoc, getDoc, setDoc, getDocs,onSnapshot  } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "vue-router";

const db = getFirestore();
const auth = getAuth();
const router = useRouter();

const defaultIncomeCategories = ["薪資", "投資", "獎金", "其他"];
const defaultExpenseCategories = ["飲食", "交通", "娛樂", "醫療", "購物", "房租", "其他"];

const amount = ref("");
const category = ref("income");
const subCategory = ref("");
const newCategory = ref("");
const showNewCategoryInput = ref(false);
const date = ref("");
const note = ref("");
const records = ref([]);
const userId = ref(null);

const incomeCategories = ref([]);
const expenseCategories = ref([]);
const availableCategories = ref([]);

// **載入使用者資料**
onAuthStateChanged(auth, async (user) => {
  if (user) {
    userId.value = user.uid;
    console.log("✅ 使用者登入:", user.uid);
    
    await initializeCategories(user.uid);
    loadCategories(); // 🔥 監聽類別變更
    await loadRecords();
  } else {
    console.log("❌ 未登入");
  }
});

// **監聽 `category` 變更，確保類別更新**
watch(category, async () => {
  if (userId.value) {
    await loadCategories();
  }
});

// **初始化類別**
async function initializeCategories(userId) {
  const incomeRef = doc(db, "users", userId, "categories", "income");
  const expenseRef = doc(db, "users", userId, "categories", "expense");

  const incomeDoc = await getDoc(incomeRef);
  const expenseDoc = await getDoc(expenseRef);

  if (!incomeDoc.exists()) {
    await setDoc(incomeRef, { list: defaultIncomeCategories });
    console.log("✅ 初始化收入類別");
  }

  if (!expenseDoc.exists()) {
    await setDoc(expenseRef, { list: defaultExpenseCategories });
    console.log("✅ 初始化支出類別");
  }
}

// **讀取 Firestore 類別**
// **讀取 & 監聽 Firestore 類別**
const loadCategories = async () => {
  if (!userId.value) return;

  const categoryDoc = doc(db, "users", userId.value, "categories", category.value);

  // ✅ Firestore 變更時，自動更新類別
  onSnapshot(categoryDoc, (docSnap) => {
    if (docSnap.exists()) {
      const categories = docSnap.data().list || [];

      if (category.value === "income") {
        incomeCategories.value = categories;
      } else {
        expenseCategories.value = categories;
      }

      availableCategories.value = [...categories];
      console.log("🔥 類別已更新:", categories);
    } else {
      console.log("⚠️ 類別文件不存在，初始化...");
      initializeCategories(userId.value);
    }
  });
};

// **讀取 Firestore 記帳紀錄**
const loadRecords = async () => {
  if (!userId.value) return;

  const querySnapshot = await getDocs(collection(db, "users", userId.value, "records"));
  records.value = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// **計算總金額**
const totalAmount = computed(() => {
  return records.value.reduce((sum, record) => record.category === "income" ? sum + record.amount : sum - record.amount, 0);
});

// **檢查是否選擇「新增類別」**
const checkNewCategory = () => {
  showNewCategoryInput.value = subCategory.value === "new";
};

// **新增類別**
const addNewCategory = async () => {
  if (!newCategory.value.trim()) return;

  const categoryDoc = doc(db, "users", userId.value, "categories", category.value);
  const docSnap = await getDoc(categoryDoc);

  let updatedCategories = docSnap.exists() ? [...docSnap.data().list, newCategory.value.trim()] : [newCategory.value.trim()];
  await setDoc(categoryDoc, { list: updatedCategories });

  if (category.value === "income") {
    incomeCategories.value = updatedCategories;
  } else {
    expenseCategories.value = updatedCategories;
  }
  

  subCategory.value = newCategory.value.trim();
  newCategory.value = "";
  showNewCategoryInput.value = false;
};

// **新增記帳**
const addRecord = async () => {
  if (!amount.value || !date.value || !subCategory.value) {
    alert("請填寫完整的記帳資料！");
    return;
  }

  const newRecord = {
    amount: parseFloat(amount.value),
    category: category.value,
    subCategory: subCategory.value,
    date: date.value,
    note: note.value,
  };

  const docRef = await addDoc(collection(db, "users", userId.value, "records"), newRecord);
  records.value.push({ id: docRef.id, ...newRecord });

  alert("✅ 記帳成功！");
  amount.value = "";
  subCategory.value = "";
  date.value = "";
  note.value = "";
};

// **刪除記帳**
const deleteRecord = async (id) => {
  await deleteDoc(doc(db, "users", userId.value, "records", id));
  records.value = records.value.filter(record => record.id !== id);
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

.total-amount {
  font-size: 18px;
  font-weight: bold;
  color: #28a745; /* 綠色代表財務 */
  margin-bottom: 10px;
}

</style>
