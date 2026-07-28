// 予定を保存する（複数保存できる）
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
  plans.splice(index, 1); // index の予定を削除
  localStorage.setItem("plans", JSON.stringify(plans));
  loadPlans(); // 再描画
}

// 予定一覧を読み込んで表示する
function loadPlans() {
  const plans = JSON.parse(localStorage.getItem("plans") || "[]");
  const list = document.getElementById("schedule-list");

  list.innerHTML = ""; // 一度クリア

  plans.forEach((plan, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${plan.title}</strong><br>
      ${plan.memo}<br>
      <button class="delete-btn" data-index="${index}">削除</button>
    `;
    list.appendChild(li);
  });

  // 削除ボタンのイベント登録
  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      deletePlan(index);
    });
  });
}

// 予定追加フォームの処理
const form = document.getElementById("schedule-form");
const titleInput = document.getElementById("schedule-title");
const memoInput = document.getElementById("schedule-memo");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  savePlan(titleInput.value, memoInput.value);

  titleInput.value = "";
  memoInput.value = "";

  loadPlans(); // 追加後に一覧を更新
});

// ページ読み込み時に一覧を復元する
window.addEventListener("load", () => {
  loadPlans();
});

