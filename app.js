const addButton =
  document.getElementById("add-button");

const scheduleList =
  document.getElementById("schedule-list");

const emptyMessage =
  document.getElementById("empty-message");

const pocketView =
  document.getElementById("pocket-view");

const archiveView =
  document.getElementById("archive-view");

const pocketNavButton =
  document.getElementById(
    "pocket-nav-button"
  );

const archiveNavButton =
  document.getElementById(
    "archive-nav-button"
  );

const appSubtitle =
  document.getElementById(
    "app-subtitle"
  );

const settingsMenuButton =
  document.getElementById(
    "settings-menu-button"
  );

const settingsMenu =
  document.getElementById(
    "settings-menu"
  );

const versionButton =
  document.getElementById(
    "version-button"
  );

const versionModalBg =
  document.getElementById(
    "version-modal-bg"
  );

const closeVersionModal =
  document.getElementById(
    "close-version-modal"
  );

const exportButton =
  document.getElementById(
    "export-button"
  );

const importButton =
  document.getElementById(
    "import-button"
  );

const importFileInput =
  document.getElementById(
    "import-file-input"
  );
  document.getElementById("app-subtitle");

let currentView = "pocket";

let draggedItem = null;
let draggedHandle = null;
let draggedPointerId = null;

let dragStartY = 0;
let hasDragged = false;
let suppressPlanClick = false;
let settingsMenuOpen = false;

/**
 * 予定一覧を表示する
 */
function renderPlans() {
  const activePlans =
    getActivePlans();

  scheduleList.innerHTML = "";

  activePlans.forEach((plan) => {
    const listItem =
      document.createElement("li");

    listItem.className =
      "schedule-item";

    listItem.dataset.id =
      plan.id;

    const dragHandle =
      document.createElement("button");

    dragHandle.className =
      "drag-handle";

    dragHandle.type =
      "button";

    dragHandle.textContent =
      "≡";

    dragHandle.setAttribute(
      "aria-label",
      `${plan.title}を並び替える`
    );

    dragHandle.title =
      "ドラッグして並び替え";

    const title =
      document.createElement("span");

    title.className =
      "plan-title";

    title.textContent =
      plan.title;

    const actions =
      document.createElement("div");

    actions.className =
      "plan-actions";

    if (plan.memo.trim() !== "") {
      const memoIcon =
        document.createElement("span");

      memoIcon.className =
        "memo-icon";

      memoIcon.textContent =
        "💬";

      memoIcon.title =
        "予定メモあり";

      actions.appendChild(
        memoIcon
      );
    }

    const deleteButton =
      document.createElement("button");

    deleteButton.className =
      "delete-btn";

    deleteButton.type =
      "button";

    deleteButton.textContent =
      "×";

    deleteButton.dataset.id =
      plan.id;

    deleteButton.setAttribute(
      "aria-label",
      `${plan.title}を削除`
    );

    actions.appendChild(
      deleteButton
    );

    listItem.appendChild(
      dragHandle
    );

    listItem.appendChild(
      title
    );

    listItem.appendChild(
      actions
    );

    scheduleList.appendChild(
      listItem
    );
  });

  emptyMessage.classList.toggle(
    "visible",
    activePlans.length === 0
  );
}

/**
 * 予定とArchiveを切り替える
 */
function showView(viewName) {
  currentView = viewName;

  const showPocket =
    viewName === "pocket";

  pocketView.classList.toggle(
    "hidden",
    !showPocket
  );

  archiveView.classList.toggle(
    "hidden",
    showPocket
  );

  pocketNavButton.classList.toggle(
    "active",
    showPocket
  );

  archiveNavButton.classList.toggle(
    "active",
    !showPocket
  );

  addButton.classList.toggle(
    "hidden",
    !showPocket
  );

  appSubtitle.textContent =
    showPocket
      ? "予定を入れて、記録としてしまう。"
      : "過ぎた時間を、そっと振り返る。";

  if (!showPocket) {
    renderArchive();
  }
}

/**
 * ポインター位置から挿入先を取得する
 */
function getInsertTarget(pointerY) {
  const items = [
    ...scheduleList.querySelectorAll(
      ".schedule-item:not(.dragging)"
    )
  ];

  for (const item of items) {
    const rect =
      item.getBoundingClientRect();

    const middle =
      rect.top + rect.height / 2;

    if (pointerY < middle) {
      return item;
    }
  }

  return null;
}

/**
 * 現在の画面上の順番を保存する
 */
function saveCurrentPlanOrder() {
  const orderedPlanIds = [
    ...scheduleList.querySelectorAll(
      ".schedule-item"
    )
  ].map((item) => item.dataset.id);

  reorderActivePlans(
    orderedPlanIds
  );
}

/**
 * ドラッグ状態を解除する
 */
function resetDragState() {
  if (draggedItem) {
    draggedItem.classList.remove(
      "dragging"
    );
  }

  document.body.classList.remove(
    "is-reordering"
  );

  draggedItem = null;
  draggedHandle = null;
  draggedPointerId = null;

  dragStartY = 0;
  hasDragged = false;
}

/**
 * ドラッグ開始
 */
scheduleList.addEventListener(
  "pointerdown",
  (event) => {
    const handle =
      event.target.closest(
        ".drag-handle"
      );

    if (!handle) {
      return;
    }

    const item =
      handle.closest(
        ".schedule-item"
      );

    if (!item) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    draggedItem = item;
    draggedHandle = handle;
    draggedPointerId =
      event.pointerId;

    dragStartY =
      event.clientY;

    hasDragged = false;

    draggedItem.classList.add(
      "dragging"
    );

    document.body.classList.add(
      "is-reordering"
    );

    try {
      draggedHandle.setPointerCapture(
        draggedPointerId
      );
    } catch (error) {
      console.warn(
        "ポインターの取得に失敗しました。",
        error
      );
    }
  }
);

/**
 * ドラッグ中
 *
 * scheduleListではなくdocumentで受け取るため、
 * 指やマウスが一覧から少し外れても追跡できる
 */
document.addEventListener(
  "pointermove",
  (event) => {
    if (
      !draggedItem ||
      event.pointerId !== draggedPointerId
    ) {
      return;
    }

    const movedDistance =
      Math.abs(
        event.clientY - dragStartY
      );

    if (movedDistance < 5) {
      return;
    }

    hasDragged = true;

    event.preventDefault();

    const insertTarget =
      getInsertTarget(
        event.clientY
      );

    if (insertTarget) {
      scheduleList.insertBefore(
        draggedItem,
        insertTarget
      );
    } else {
      scheduleList.appendChild(
        draggedItem
      );
    }
  },
  {
    passive: false
  }
);

/**
 * ドラッグ終了
 */
function finishDragging(event) {
  if (!draggedItem) {
    return;
  }

  if (
    event &&
    event.pointerId !== draggedPointerId
  ) {
    return;
  }

  const shouldSave =
    hasDragged;

  if (
    draggedHandle &&
    draggedPointerId !== null
  ) {
    try {
      if (
        draggedHandle.hasPointerCapture(
          draggedPointerId
        )
      ) {
        draggedHandle.releasePointerCapture(
          draggedPointerId
        );
      }
    } catch (error) {
      console.warn(
        "ポインターの解放に失敗しました。",
        error
      );
    }
  }

  if (shouldSave) {
    saveCurrentPlanOrder();

    suppressPlanClick = true;

    window.setTimeout(() => {
      suppressPlanClick = false;
    }, 200);
  }

  resetDragState();
}

document.addEventListener(
  "pointerup",
  finishDragging
);

document.addEventListener(
  "pointercancel",
  finishDragging
);

/**
 * 予定追加
 */
addButton.addEventListener(
  "click",
  () => {
    openNewPlanModal();
  }
);

/**
 * 予定一覧のクリック操作
 */
scheduleList.addEventListener(
  "click",
  (event) => {
    if (suppressPlanClick) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const dragHandle =
      event.target.closest(
        ".drag-handle"
      );

    if (dragHandle) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const deleteButton =
      event.target.closest(
        ".delete-btn"
      );

    if (deleteButton) {
      event.stopPropagation();

      const planId =
        deleteButton.dataset.id;

      const plan =
        getPlanById(planId);

      if (!plan) {
        return;
      }

      const shouldDelete =
        window.confirm(
          `「${plan.title}」を削除しますか？`
        );

      if (shouldDelete) {
        deletePlan(planId);

        renderPlans();
        renderArchive();
      }

      return;
    }

    const planItem =
      event.target.closest(
        ".schedule-item"
      );

    if (!planItem) {
      return;
    }

    openEditPlanModal(
      planItem.dataset.id
    );
  }
);

/**
 * 予定フォーム保存
 */
scheduleForm.addEventListener(
  "submit",
  (event) => {
    event.preventDefault();

    const title =
      scheduleTitleInput.value.trim();

    const memo =
      scheduleMemoInput.value.trim();

    if (!title) {
      return;
    }

    const activePlanId =
      getActivePlanId();

    if (activePlanId) {
      updatePlan(
        activePlanId,
        title,
        memo
      );
    } else {
      createPlan(
        title,
        memo
      );
    }

    closeModal();

    renderPlans();
    renderArchive();
  }
);

/**
 * 記録フォーム保存
 */
recordForm.addEventListener(
  "submit",
  (event) => {
    event.preventDefault();

    const activePlanId =
      getActivePlanId();

    if (!activePlanId) {
      return;
    }

    const tags =
      recordTagsInput.value
        .split(",")
        .map((tag) =>
          tag.trim()
        )
        .filter(Boolean);

    const selectedPhoto =
      recordPhotoInput.files[0];

    saveRecord(
      activePlanId,
      {
        memo:
          recordMemoInput.value,
        tags,
        date:
          recordDateInput.value,
        photoName:
          selectedPhoto
            ? selectedPhoto.name
            : ""
      }
    );

    closeModal();

    renderPlans();
    renderArchive();

    showView("archive");
  }
);

/**
 * 下部ナビゲーション
 */
pocketNavButton.addEventListener(
  "click",
  () => {
    showView("pocket");
  }
);

archiveNavButton.addEventListener(
  "click",
  () => {
    showView("archive");
  }
);
/**
 * 設定メニュー
 */
settingsMenuButton.addEventListener(
  "click",
  (event) => {
    event.stopPropagation();

    toggleSettingsMenu();
  }
);

document.addEventListener(
  "click",
  () => {
    closeSettingsMenu();
  }
);

settingsMenu.addEventListener(
  "click",
  (event) => {
    event.stopPropagation();
  }
);

/**
 * バージョン情報
 */
versionButton.addEventListener(
  "click",
  () => {
    closeSettingsMenu();

    versionModalBg.classList.remove(
      "hidden"
    );
  }
);

closeVersionModal.addEventListener(
  "click",
  () => {
    versionModalBg.classList.add(
      "hidden"
    );
  }
);

versionModalBg.addEventListener(
  "click",
  (event) => {
    if (
      event.target === versionModalBg
    ) {
      versionModalBg.classList.add(
        "hidden"
      );
    }
  }
);

/**
 * バックアップを書き出す
 */
exportButton.addEventListener(
  "click",
  () => {
    closeSettingsMenu();

    const plans =
      getPlans();

    if (plans.length === 0) {
      const shouldExport =
        window.confirm(
          "保存されている予定や記録がありません。\n空のバックアップを書き出しますか？"
        );

      if (!shouldExport) {
        return;
      }
    }

    exportPocketBackup();
  }
);
/**
 * インポートするJSONファイルを選ぶ
 */
importButton.addEventListener(
  "click",
  () => {
    closeSettingsMenu();

    /*
     * 同じファイルを続けて選んだ場合でも
     * changeイベントが動くようにリセットする
     */
    importFileInput.value = "";

    importFileInput.click();
  }
);

/**
 * 選ばれたバックアップを読み込む
 */
importFileInput.addEventListener(
  "change",
  () => {
    const selectedFile =
      importFileInput.files[0];

    if (!selectedFile) {
      return;
    }

    const fileReader =
      new FileReader();

    fileReader.addEventListener(
      "load",
      () => {
        try {
          const backupData =
            JSON.parse(
              fileReader.result
            );

          if (
            !validatePocketBackup(
              backupData
            )
          ) {
            window.alert(
              "このファイルはPocketのバックアップではありません。"
            );

            return;
          }

          const currentPlans =
            getPlans();

          const importedPlans =
            backupData.plans;

          const confirmationMessage =
            currentPlans.length > 0
              ? (
                  "現在の予定・記録を、" +
                  "選択したバックアップで置き換えます。\n\n" +
                  `現在：${currentPlans.length}件\n` +
                  `復元後：${importedPlans.length}件\n\n` +
                  "続ける前に、現在のデータを" +
                  "バックアップしておくことをおすすめします。"
                )
              : (
                  "選択したバックアップを復元します。\n\n" +
                  `復元するデータ：${importedPlans.length}件`
                );

          const shouldImport =
            window.confirm(
              confirmationMessage
            );

          if (!shouldImport) {
            return;
          }

          importPocketBackup(
            backupData
          );

          renderPlans();
          renderArchive();
          showView("pocket");

          window.alert(
            "バックアップを復元しました。"
          );
        } catch (error) {
          console.error(
            "バックアップの読み込みに失敗しました。",
            error
          );

          window.alert(
            "バックアップを読み込めませんでした。\n" +
            "ファイルが壊れているか、形式が違う可能性があります。"
          );
        } finally {
          importFileInput.value = "";
        }
      }
    );

    fileReader.addEventListener(
      "error",
      () => {
        window.alert(
          "ファイルの読み込みに失敗しました。"
        );

        importFileInput.value = "";
      }
    );

    fileReader.readAsText(
      selectedFile,
      "UTF-8"
    );
  }
);
/**
 * 初期表示
 */
/**
 * 設定メニュー開閉
 */
function toggleSettingsMenu() {
  settingsMenuOpen =
    !settingsMenuOpen;

  settingsMenu.classList.toggle(
    "hidden",
    !settingsMenuOpen
  );

  settingsMenuButton.setAttribute(
    "aria-expanded",
    settingsMenuOpen
  );
}

/**
 * 設定メニューを閉じる
 */
function closeSettingsMenu() {
  settingsMenuOpen = false;

  settingsMenu.classList.add(
    "hidden"
  );

  settingsMenuButton.setAttribute(
    "aria-expanded",
    "false"
  );
}
window.addEventListener(
  "load",
  () => {
    initArchive();

    renderPlans();
    renderArchive();

    showView("pocket");
  }
);