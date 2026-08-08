const modalBg =
  document.getElementById("modal-bg");

const modalTitle =
  document.getElementById("modal-title");

const closeModalButton =
  document.getElementById("close-modal");

const planTab =
  document.getElementById("plan-tab");

const recordTab =
  document.getElementById("record-tab");

const planPanel =
  document.getElementById("plan-panel");

const recordPanel =
  document.getElementById("record-panel");

const scheduleForm =
  document.getElementById("schedule-form");

const scheduleTitleInput =
  document.getElementById("schedule-title");

const scheduleMemoInput =
  document.getElementById("schedule-memo");

const recordForm =
  document.getElementById("record-form");

const recordPlanTitle =
  document.getElementById("record-plan-title");

const recordPlanMemo =
  document.getElementById("record-plan-memo");

const recordPhotoInput =
  document.getElementById("record-photo");

const currentPhotoName =
  document.getElementById("current-photo-name");

const recordMemoInput =
  document.getElementById("record-memo");

const recordTagsInput =
  document.getElementById("record-tags");

const recordDateInput =
  document.getElementById("record-date");

const photoPreviewArea =
  document.getElementById("photo-preview-area");

const photoPreview =
  document.getElementById("photo-preview");

const removePhotoPreviewButton =
  document.getElementById("remove-photo-preview");

let activePlanId = null;
let photoPreviewUrl = "";

/**
 * 今日の日付をYYYY-MM-DD形式で取得する
 */
function getTodayString() {
  const now = new Date();

  const localDate = new Date(
    now.getTime() -
    now.getTimezoneOffset() * 60 * 1000
  );

  return localDate
    .toISOString()
    .slice(0, 10);
}

/**
 * モーダル内のタブを切り替える
 */
function switchModalTab(tabName) {
  const showPlan =
    tabName === "plan";

  planTab.classList.toggle(
    "active",
    showPlan
  );

  recordTab.classList.toggle(
    "active",
    !showPlan
  );

  planTab.setAttribute(
    "aria-selected",
    String(showPlan)
  );

  recordTab.setAttribute(
    "aria-selected",
    String(!showPlan)
  );

  planPanel.classList.toggle(
    "hidden",
    !showPlan
  );

  recordPanel.classList.toggle(
    "hidden",
    showPlan
  );
}

/**
 * 作成済みのプレビューURLを破棄する
 */
function revokePhotoPreviewUrl() {
  if (!photoPreviewUrl) {
    return;
  }

  URL.revokeObjectURL(
    photoPreviewUrl
  );

  photoPreviewUrl = "";
}

/**
 * 写真プレビューを隠す
 */
function clearPhotoPreview() {
  revokePhotoPreviewUrl();

  photoPreview.src = "";

  photoPreviewArea.classList.add(
    "hidden"
  );
}

/**
 * 選択された写真を正方形でプレビューする
 */
function showSelectedPhotoPreview(file) {
  clearPhotoPreview();

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    window.alert(
      "画像ファイルを選択してください。"
    );

    recordPhotoInput.value = "";

    return;
  }

  photoPreviewUrl =
    URL.createObjectURL(file);

  photoPreview.src =
    photoPreviewUrl;

  photoPreviewArea.classList.remove(
    "hidden"
  );
}

/**
 * 保存済みの写真をプレビューする
 */
function showSavedPhotoPreview(photoData) {
  clearPhotoPreview();

  if (!photoData) {
    return;
  }

  photoPreview.src =
    photoData;

  photoPreviewArea.classList.remove(
    "hidden"
  );
}

/**
 * モーダルの入力内容を初期化する
 */
function resetModalForms() {
  scheduleForm.reset();
  recordForm.reset();

  clearPhotoPreview();

  recordDateInput.value =
    getTodayString();

  recordPlanTitle.textContent =
    "予定を選択してください";

  recordPlanMemo.textContent = "";

  currentPhotoName.textContent = "";

  currentPhotoName.classList.add(
    "hidden"
  );
}

/**
 * 新規予定モーダルを開く
 */
function openNewPlanModal() {
  activePlanId = null;

  resetModalForms();

  modalTitle.textContent =
    "予定を追加";

  recordTab.disabled = true;

  recordTab.title =
    "予定を保存すると記録を登録できます";

  switchModalTab("plan");

  modalBg.classList.remove(
    "hidden"
  );

  scheduleTitleInput.focus();
}

/**
 * 予定・記録編集モーダルを開く
 */
function openEditPlanModal(
  planId,
  initialTab = "plan"
) {
  const plan =
    getPlanById(planId);

  if (!plan) {
    return;
  }

  activePlanId = plan.id;

  resetModalForms();

  scheduleTitleInput.value =
    plan.title;

  scheduleMemoInput.value =
    plan.memo;

  recordPlanTitle.textContent =
    plan.title;

  recordPlanMemo.textContent =
    plan.memo ||
    "予定メモはありません。";

  if (plan.record) {
    recordMemoInput.value =
      plan.record.memo || "";

    recordTagsInput.value =
      (plan.record.tags || [])
        .join(", ");

    recordDateInput.value =
      plan.record.date ||
      getTodayString();

    if (plan.record.photoName) {
      currentPhotoName.textContent =
        `登録済みの写真：${plan.record.photoName}`;

      currentPhotoName.classList.remove(
        "hidden"
      );
    }
    if (plan.record.photoName) {
  currentPhotoName.textContent =
    `登録済みの写真：${plan.record.photoName}`;

  currentPhotoName.classList.remove(
    "hidden"
  );
}

if (plan.record.photoData) {
  showSavedPhotoPreview(
    plan.record.photoData
  );
}
  }

  recordTab.disabled = false;
  recordTab.title = "";

  if (initialTab === "record") {
    modalTitle.textContent =
      plan.record
        ? "記録を編集"
        : "記録を追加";

    switchModalTab("record");
  } else {
    modalTitle.textContent =
      "予定を編集";

    switchModalTab("plan");
  }

  modalBg.classList.remove(
    "hidden"
  );

  if (initialTab === "record") {
    recordMemoInput.focus();
  } else {
    scheduleTitleInput.focus();
  }
}

/**
 * Archiveの記録を直接開く
 */
function openRecordModal(planId) {
  openEditPlanModal(
    planId,
    "record"
  );
}

/**
 * モーダルを閉じる
 */
function closeModal() {
  modalBg.classList.add(
    "hidden"
  );

  activePlanId = null;

  resetModalForms();
}

/**
 * 編集中の予定IDを返す
 */
function getActivePlanId() {
  return activePlanId;
}

/**
 * 写真が選ばれたとき
 */
recordPhotoInput.addEventListener(
  "change",
  () => {
    const selectedFile =
      recordPhotoInput.files[0];

    showSelectedPhotoPreview(
      selectedFile
    );
  }
);

/**
 * 写真選択を取り消す
 */
removePhotoPreviewButton.addEventListener(
  "click",
  () => {
    recordPhotoInput.value = "";

    clearPhotoPreview();
  }
);

planTab.addEventListener(
  "click",
  () => {
    modalTitle.textContent =
      "予定を編集";

    switchModalTab("plan");
  }
);

recordTab.addEventListener(
  "click",
  () => {
    if (!activePlanId) {
      return;
    }

    const plan =
      getPlanById(activePlanId);

    modalTitle.textContent =
      plan?.record
        ? "記録を編集"
        : "記録を追加";

    switchModalTab("record");
  }
);

closeModalButton.addEventListener(
  "click",
  closeModal
);

modalBg.addEventListener(
  "click",
  (event) => {
    if (event.target === modalBg) {
      closeModal();
    }
  }
);

document.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Escape" &&
      !modalBg.classList.contains("hidden")
    ) {
      closeModal();
    }
  }
);