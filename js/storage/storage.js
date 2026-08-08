const PLAN_STORAGE_KEY = "plans";

/**
 * 保存されている予定を取得する
 */
function getPlans() {
  let savedPlans = [];

  try {
    savedPlans = JSON.parse(
      localStorage.getItem(PLAN_STORAGE_KEY) || "[]"
    );
  } catch (error) {
    console.error(
      "予定データの読み込みに失敗しました。",
      error
    );

    savedPlans = [];
  }

  let changed = false;

  const normalizedPlans = savedPlans.map((plan) => {
    const normalizedRecord = plan.record
      ? {
          memo: plan.record.memo || "",

          tags: Array.isArray(plan.record.tags)
            ? plan.record.tags
            : [],

          date:
            plan.record.date ||
            new Date().toISOString().slice(0, 10),

          photoName:
            plan.record.photoName || "",

          photoData:
            plan.record.photoData || "",

          savedAt:
            plan.record.savedAt ||
            new Date().toISOString()
        }
      : null;

    const normalizedPlan = {
      id:
        plan.id ||
        crypto.randomUUID(),

      title:
        plan.title || "",

      memo:
        plan.memo || "",

      createdAt:
        plan.createdAt ||
        plan.date ||
        new Date().toISOString(),

      record:
        normalizedRecord
    };

    if (
      !plan.id ||
      !plan.createdAt ||
      plan.record === undefined ||
      (
        plan.record &&
        plan.record.photoData === undefined
      )
    ) {
      changed = true;
    }

    return normalizedPlan;
  });

  if (changed) {
    savePlans(normalizedPlans);
  }

  return normalizedPlans;
}

/**
 * 予定一覧を保存する
 */
function savePlans(plans) {
  localStorage.setItem(
    PLAN_STORAGE_KEY,
    JSON.stringify(plans)
  );
}

/**
 * 新しい予定を追加する
 */
function createPlan(title, memo) {
  const plans = getPlans();

  plans.push({
    id:
      crypto.randomUUID(),

    title:
      title.trim(),

    memo:
      memo.trim(),

    createdAt:
      new Date().toISOString(),

    record:
      null
  });

  savePlans(plans);
}

/**
 * 予定を更新する
 */
function updatePlan(id, title, memo) {
  const plans = getPlans();

  const plan = plans.find(
    (item) =>
      item.id === id
  );

  if (!plan) {
    return false;
  }

  plan.title =
    title.trim();

  plan.memo =
    memo.trim();

  savePlans(plans);

  return true;
}

/**
 * 予定を削除する
 */
function deletePlan(id) {
  const plans = getPlans();

  const filteredPlans =
    plans.filter(
      (plan) =>
        plan.id !== id
    );

  savePlans(filteredPlans);
}

/**
 * 未記録の予定を画面上の順番で保存する
 */
function reorderActivePlans(orderedPlanIds) {
  const plans = getPlans();

  const activePlans =
    plans.filter(
      (plan) =>
        !plan.record
    );

  const recordedPlans =
    plans.filter(
      (plan) =>
        plan.record
    );

  const activePlanMap =
    new Map(
      activePlans.map(
        (plan) => [
          plan.id,
          plan
        ]
      )
    );

  const reorderedPlans =
    orderedPlanIds
      .map(
        (id) =>
          activePlanMap.get(id)
      )
      .filter(Boolean);

  const orderedIdSet =
    new Set(
      orderedPlanIds
    );

  const missingPlans =
    activePlans.filter(
      (plan) =>
        !orderedIdSet.has(plan.id)
    );

  savePlans([
    ...reorderedPlans,
    ...missingPlans,
    ...recordedPlans
  ]);
}

/**
 * 記録を保存する
 */
function saveRecord(id, recordData) {
  const plans = getPlans();

  const plan = plans.find(
    (item) =>
      item.id === id
  );

  if (!plan) {
    return false;
  }

  const previousPhotoName =
    plan.record?.photoName || "";

  const previousPhotoData =
    plan.record?.photoData || "";

  plan.record = {
    memo:
      recordData.memo.trim(),

    tags:
      recordData.tags,

    date:
      recordData.date,

    photoName:
      recordData.photoName ||
      previousPhotoName,

    photoData:
      recordData.photoData ||
      previousPhotoData,

    savedAt:
      new Date().toISOString()
  };

  savePlans(plans);

  return true;
}

/**
 * IDから予定を取得する
 */
function getPlanById(id) {
  return (
    getPlans().find(
      (plan) =>
        plan.id === id
    ) || null
  );
}

/**
 * 記録されていない予定だけ取得する
 */
function getActivePlans() {
  return getPlans().filter(
    (plan) =>
      !plan.record
  );
}

/**
 * 記録済みの予定だけ取得する
 */
function getRecordedPlans() {
  return getPlans().filter(
    (plan) =>
      plan.record
  );
}

/**
 * Pocketのデータを
 * バックアップ用オブジェクトにまとめる
 */
function createBackupData() {
  return {
    app:
      "Pocket",

    version:
      1,

    exportedAt:
      new Date().toISOString(),

    plans:
      getPlans()
  };
}

/**
 * バックアップファイル名に使う日付を作る
 */
function getBackupDateString() {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  const hours =
    String(
      now.getHours()
    ).padStart(2, "0");

  const minutes =
    String(
      now.getMinutes()
    ).padStart(2, "0");

  return (
    `${year}-${month}-${day}-` +
    `${hours}${minutes}`
  );
}

/**
 * Pocketのバックアップを
 * JSONファイルとして保存する
 */
function exportPocketBackup() {
  const backupData =
    createBackupData();

  const jsonText =
    JSON.stringify(
      backupData,
      null,
      2
    );

  const backupBlob =
    new Blob(
      [jsonText],
      {
        type:
          "application/json"
      }
    );

  const backupUrl =
    URL.createObjectURL(
      backupBlob
    );

  const downloadLink =
    document.createElement("a");

  downloadLink.href =
    backupUrl;

  downloadLink.download =
    `pocket-backup-${getBackupDateString()}.json`;

  document.body.appendChild(
    downloadLink
  );

  downloadLink.click();

  downloadLink.remove();

  URL.revokeObjectURL(
    backupUrl
  );
}

/**
 * 読み込んだデータが
 * Pocketのバックアップか確認する
 */
function validatePocketBackup(backupData) {
  if (
    !backupData ||
    typeof backupData !== "object"
  ) {
    return false;
  }

  if (
    backupData.app !== "Pocket"
  ) {
    return false;
  }

  if (
    backupData.version !== 1
  ) {
    return false;
  }

  if (
    !Array.isArray(
      backupData.plans
    )
  ) {
    return false;
  }

  return backupData.plans.every(
    (plan) => {
      return (
        plan &&
        typeof plan === "object" &&
        typeof plan.title === "string"
      );
    }
  );
}

/**
 * Pocketのバックアップデータを復元する
 */
function importPocketBackup(backupData) {
  if (
    !validatePocketBackup(
      backupData
    )
  ) {
    throw new Error(
      "Pocketのバックアップ形式ではありません。"
    );
  }

  savePlans(
    backupData.plans
  );

  /*
   * 古い形式のバックアップでも使えるよう、
   * getPlans()を通してデータを整える
   */
  const normalizedPlans =
    getPlans();

  savePlans(
    normalizedPlans
  );

  return normalizedPlans;
}