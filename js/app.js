const addButton =
  document.getElementById(
    "add-button"
  );

const scheduleList =
  document.getElementById(
    "schedule-list"
  );

const emptyMessage =
  document.getElementById(
    "empty-message"
  );

const pocketView =
  document.getElementById(
    "pocket-view"
  );

const archiveView =
  document.getElementById(
    "archive-view"
  );

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


let currentView = "pocket";

let draggedItem = null;
let draggedHandle = null;
let draggedPointerId = null;

let dragStartY = 0;
let hasDragged = false;
let suppressPlanClick = false;

/**
 * 予定一覧を表示する
 */
function renderPlans() {
  const activePlans =
    getActivePlans();

  scheduleList.innerHTML = "";

  activePlans.forEach(
    (plan) => {
      const listItem =
        document.createElement(
          "li"
        );

      listItem.className =
        "schedule-item";

      listItem.dataset.id =
        plan.id;

      const dragHandle =
        document.createElement(
          "button"
        );

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
        document.createElement(
          "span"
        );

      title.className =
        "plan-title";

      title.textContent =
        plan.title;

      const actions =
        document.createElement(
          "div"
        );

      actions.className =
        "plan-actions";

      if (
        plan.memo.trim() !== ""
      ) {
        const memoIcon =
          document.createElement(
            "span"
          );

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
        document.createElement(
          "button"
        );

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
    }
  );

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
 * ポインター位置から
 * 挿入先を取得する
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
      rect.top +
      rect.height / 2;

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
  ].map(
    (item) =>
      item.dataset.id
  );

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
 */
document.addEventListener(
  "pointermove",
  (event) => {
    if (
      !draggedItem ||
      event.pointerId !==
        draggedPointerId
    ) {
      return;
    }

    const movedDistance =
      Math.abs(
        event.clientY -
        dragStartY
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
    event.pointerId !==
      draggedPointerId
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

    window.setTimeout(
      () => {
        suppressPlanClick = false;
      },
      200
    );
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
      scheduleTitleInput
        .value
        .trim();

    const memo =
      scheduleMemoInput
        .value
        .trim();

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
 * 写真を縮小して
 * Base64形式へ変換する
 */
function convertPhotoToDataUrl(file) {
  return new Promise(
    (resolve, reject) => {
      if (!file) {
        resolve("");
        return;
      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        reject(
          new Error(
            "選択されたファイルは画像ではありません。"
          )
        );

        return;
      }

      const reader =
        new FileReader();

      reader.addEventListener(
        "load",
        () => {
          const image =
            new Image();

          image.addEventListener(
            "load",
            () => {
              const maxSize = 900;

              let width =
                image.naturalWidth;

              let height =
                image.naturalHeight;

              if (
                width > maxSize ||
                height > maxSize
              ) {
                const scale =
                  Math.min(
                    maxSize / width,
                    maxSize / height
                  );

                width =
                  Math.round(
                    width * scale
                  );

                height =
                  Math.round(
                    height * scale
                  );
              }

              const canvas =
                document.createElement(
                  "canvas"
                );

              canvas.width =
                width;

              canvas.height =
                height;

              const context =
                canvas.getContext(
                  "2d"
                );

              if (!context) {
                reject(
                  new Error(
                    "画像を処理できませんでした。"
                  )
                );

                return;
              }

              context.drawImage(
                image,
                0,
                0,
                width,
                height
              );

              const photoData =
                canvas.toDataURL(
                  "image/jpeg",
                  0.72
                );

              resolve(
                photoData
              );
            }
          );

          image.addEventListener(
            "error",
            () => {
              reject(
                new Error(
                  "画像を読み込めませんでした。"
                )
              );
            }
          );

          image.src =
            reader.result;
        }
      );

      reader.addEventListener(
        "error",
        () => {
          reject(
            new Error(
              "写真ファイルを読み込めませんでした。"
            )
          );
        }
      );

      reader.readAsDataURL(
        file
      );
    }
  );
}

/**
 * 記録フォーム保存
 */
recordForm.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    const activePlanId =
      getActivePlanId();

    if (!activePlanId) {
      return;
    }

    const tags =
      recordTagsInput.value
        .split(",")
        .map(
          (tag) =>
            tag.trim()
        )
        .filter(Boolean);

    const selectedPhoto =
      recordPhotoInput.files[0];

    try {
      const photoData =
        selectedPhoto
          ? await convertPhotoToDataUrl(
              selectedPhoto
            )
          : "";

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
              : "",

          photoData
        }
      );

      closeModal();

      renderPlans();
      renderArchive();

      showView(
        "archive"
      );
    } catch (error) {
      console.error(
        "写真の保存に失敗しました。",
        error
      );

      window.alert(
        "写真を保存できませんでした。\n" +
        "別の画像を選ぶか、容量の小さい画像を試してください。"
      );
    }
  }
);

/**
 * 下部ナビゲーション
 */
pocketNavButton.addEventListener(
  "click",
  () => {
    showView(
      "pocket"
    );
  }
);

archiveNavButton.addEventListener(
  "click",
  () => {
    showView(
      "archive"
    );
  }
);


/**
 * 初期表示
 */
window.addEventListener(
  "load",
  () => {
    initArchive();

    renderPlans();
    renderArchive();

    showView(
      "pocket"
    );
  }
);