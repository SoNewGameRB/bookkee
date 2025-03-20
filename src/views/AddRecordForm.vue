<template>
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
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from "vue";
  import { getFirestore, collection, doc, addDoc, getDoc, setDoc, getDocs, onSnapshot } from "firebase/firestore";
  import { getAuth,onAuthStateChanged } from "firebase/auth";
  
  const defaultIncomeCategories = ["薪資", "投資", "獎金", "其他"];
  const defaultExpenseCategories = ["飲食", "交通", "娛樂", "醫療", "購物", "房租", "其他"];
  const db = getFirestore();
  const auth = getAuth();
  const userId = ref(null);
  const records = ref([]);

  const amount = ref("");
  const category = ref("income");
  const subCategory = ref("");
  const newCategory = ref("");
  const showNewCategoryInput = ref(false);
  const date = ref("");
  const note = ref("");
  
  const incomeCategories = ref([]);
  const expenseCategories = ref([]);
  const availableCategories = ref([]);
  onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      userId.value = user.uid;
      console.log("✅ 使用者登入:", user.uid);
    } else {
      console.log("❌ 未登入");
    }
  });
});
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
  
  watch(category, () => {
    loadCategories();
  });
  // **讀取 Firestore 記帳紀錄**
const loadRecords = async () => {
  if (!userId.value) return;

  const querySnapshot = await getDocs(collection(db, "users", userId.value, "records"));
  records.value = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
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


  
  const checkNewCategory = () => {
    showNewCategoryInput.value = subCategory.value === "new";
  };
  

  
  const addRecord = async () => {
  if (!amount.value || !date.value || !subCategory.value) {
    alert("請填寫完整的記帳資料！");
    return;
  }

  // **如果選擇 "新增類別"，自動新增類別**
  if (subCategory.value === "new") {
    if (!newCategory.value.trim()) {
      alert("請輸入新類別名稱！");
      return;
    }

    const categoryDoc = doc(db, "users", userId.value, "categories", category.value);
    const docSnap = await getDoc(categoryDoc);

    let updatedCategories = docSnap.exists()
      ? [...docSnap.data().list, newCategory.value.trim()]
      : [newCategory.value.trim()];

    await setDoc(categoryDoc, { list: updatedCategories });

    // **自動將新類別選為當前選擇的類別**
    subCategory.value = newCategory.value.trim();
    newCategory.value = "";
    showNewCategoryInput.value = false;

    console.log("✅ 自動新增類別:", subCategory.value);
  }

  // **建立新的記帳記錄**
  const newRecord = {
    amount: parseFloat(amount.value),
    category: category.value,
    subCategory: subCategory.value,
    date: date.value,
    note: note.value,
  };

  await addDoc(collection(db, "users", userId.value, "records"), newRecord);

  alert("✅ 記帳成功！");

  // **清空輸入欄位**
  amount.value = "";
  subCategory.value = "";
  date.value = "";
  note.value = "";
};

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


import { computed } from "vue";

// **計算總金額**
const totalAmount = computed(() => {
  return records.value
    ? records.value.reduce((sum, record) =>
        record.category === "income" ? sum + record.amount : sum - record.amount, 0)
    : 0;
});





  </script>
  
  <style scoped>
  .box {
  max-width: 400px;
  padding: 20px;
  margin: auto;
}
  .form-group {
    margin-bottom: 15px;
  }
  .input-field {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  box-sizing: border-box; /* 避免超出 */
}
  .submit-btn {
    width: 100%;
    padding: 10px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 18px;
  }
  </style>
  