// 予定を保存する
function savePlan(title, memo) {
  const plans = JSON.parse(localStorage.getItem("plans") || "[]");

  plans.push({
    title,
    memo,
    date: new Date().toISOString()
  });

  localStorage.setItem("plans", JSON.stringify(plans));
}

// 予定を削除する
function deletePlan(index) {
  const plans = JSON.parse(localStorage.getItem("plans") || "[]");
  plans.splice(index, 1);
  localStorage.setItem("plans", JSON.stringify(plans));
  loadPlans();
}

// 予定一覧を読み込んで表示する
function loadPlans() {
  const plans = JSON.parse(localStorage.getItem("plans") || "[]");
  const list = document.getElementById("schedule-list");

  list.innerHTML = "";

  plans.forEach((plan, index) => {
    const hasMemo = plan.memo && plan.memo.trim() !== "";
    const memoIcon = hasMemo ? "💬" : "";

    const li = document.createElement("li");

    li.innerHTML = `
      <span>${plan.title}</span>

      <div class="right-area">
        <span>${memoIcon}</span>
        <button class="delete-btn" data-index="${index}">×</button>
      </div>
    `;

    list.appendChild(li);
  });

  // 削除ボタンのイベント
  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      deletePlan(btn.dataset.index);
    });
  });
}

// モーダル開閉
const modalBg = document.getElementById("modal-bg");
const addButton = document.getElementById("add-button");
const closeModal = document.getElementById("close-modal");

addButton.addEventListener("click", () => {
  modalBg.style.display = "flex";
});

closeModal.addEventListener("click", () => {
  modalBg.style.display = "none";
});

// フォーム送信
const form = document.getElementById("schedule-form");
const titleInput = document.getElementById("schedule-title");
const memoInput = document.getElementById("schedule-memo");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  savePlan(titleInput.value, memoInput.value);

  titleInput.value = "";
  memoInput.value = "";

  modalBg.style.display = "none"; // 保存後に閉じる
  loadPlans();
});

// ページ読み込み時に一覧を復元
window.addEventListener("load", () => {
  loadPlans();
});
