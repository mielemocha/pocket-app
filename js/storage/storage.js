const PLAN_STORAGE_KEY = "plans";

/**
 * 日時文字列を比較用の数値へ変換する
 */
function getTimeValue(dateString) {
  if (!dateString) {
    return 0;
  }

  const time =
    new Date(
      dateString
    ).getTime();

  return Number.isNaN(time)
    ? 0
    : time;
}

/**
 * 保存されている予定を取得する
 */
function getPlans() {
  let savedPlans = [];

  try {
    savedPlans = JSON.parse(
      localStorage.getItem(
        PLAN_STORAGE_KEY
      ) || "[]"
    );
  } catch (error) {
    console.error(
      "予定データの読み込みに失敗しました。",
      error
    );

    savedPlans = [];
  }

  let changed = false;

  const normalizedPlans =
    savedPlans.map(
      (plan) => {
        const now =
          new Date().toISOString();

        const createdAt =
          plan.createdAt ||
          plan.date ||
          now;

        const normalizedRecord =
          plan.record
            ? {
                memo:
                  plan.record.memo ||
                  "",

                tags:
                  Array.isArray(
                    plan.record.tags
                  )
                    ? plan.record.tags
                    : [],

                date:
                  plan.record.date ||
                  createdAt.slice(
                    0,
                    10
                  ),

                photoName:
                  plan.record.photoName ||
                  "",

                photoData:
                  plan.record.photoData ||
                  "",

                /*
                 * 古い記録にsavedAtがない場合は
                 * createdAtを基準にする。
                 *
                 * 統合時に「古い記録なのに今編集した」
                 * と誤判定しないため。
                 */
                savedAt:
                  plan.record.savedAt ||
                  createdAt
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

          createdAt,

          /*
           * 予定タイトル・予定メモの
           * 最終更新日時
           */
          updatedAt:
            plan.updatedAt ||
            createdAt,

          record:
            normalizedRecord
        };

        if (
          !plan.id ||
          !plan.createdAt ||
          !plan.updatedAt ||
          plan.record === undefined ||
          (
            plan.record &&
            plan.record.photoData ===
              undefined
          ) ||
          (
            plan.record &&
            !plan.record.savedAt
          )
        ) {
          changed = true;
        }

        return normalizedPlan;
      }
    );

  if (changed) {
    savePlans(
      normalizedPlans
    );
  }

  return normalizedPlans;
}

/**
 * 予定一覧を保存する
 */
function savePlans(plans) {
  localStorage.setItem(
    PLAN_STORAGE_KEY,
    JSON.stringify(
      plans
    )
  );
}

/**
 * 新しい予定を追加する
 * 新しい予定は一覧の先頭に入れる
 */
function createPlan(
  title,
  memo
) {
  const plans =
    getPlans();

  const now =
    new Date().toISOString();

  const newPlan = {
    id:
      crypto.randomUUID(),

    title:
      title.trim(),

    memo:
      memo.trim(),

    createdAt:
      now,

    updatedAt:
      now,

    record:
      null
  };

  plans.unshift(
    newPlan
  );

  savePlans(
    plans
  );
}

/**
 * 予定を更新する
 */
function updatePlan(
  id,
  title,
  memo
) {
  const plans =
    getPlans();

  const plan =
    plans.find(
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

  /*
   * 予定タイトル・予定メモを
   * 編集した時刻を記録する
   */
  plan.updatedAt =
    new Date().toISOString();

  savePlans(
    plans
  );

  return true;
}

/**
 * 予定を削除する
 */
function deletePlan(id) {
  const plans =
    getPlans();

  const filteredPlans =
    plans.filter(
      (plan) =>
        plan.id !== id
    );

  savePlans(
    filteredPlans
  );
}

/**
 * 未記録の予定を
 * 画面上の順番で保存する
 */
function reorderActivePlans(
  orderedPlanIds
) {
  const plans =
    getPlans();

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
          activePlanMap.get(
            id
          )
      )
      .filter(Boolean);

  const orderedIdSet =
    new Set(
      orderedPlanIds
    );

  const missingPlans =
    activePlans.filter(
      (plan) =>
        !orderedIdSet.has(
          plan.id
        )
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
function saveRecord(
  id,
  recordData
) {
  const plans =
    getPlans();

  const plan =
    plans.find(
      (item) =>
        item.id === id
    );

  if (!plan) {
    return false;
  }

  const previousPhotoName =
    plan.record?.photoName ||
    "";

  const previousPhotoData =
    plan.record?.photoData ||
    "";

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

    /*
     * 記録側の最終更新日時
     */
    savedAt:
      new Date().toISOString()
  };

  savePlans(
    plans
  );

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
 * バックアップファイル名に
 * 使う日付を作る
 */
function getBackupDateString() {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );

  const hours =
    String(
      now.getHours()
    ).padStart(
      2,
      "0"
    );

  const minutes =
    String(
      now.getMinutes()
    ).padStart(
      2,
      "0"
    );

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
    document.createElement(
      "a"
    );

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
function validatePocketBackup(
  backupData
) {
  if (
    !backupData ||
    typeof backupData !==
      "object"
  ) {
    return false;
  }

  if (
    backupData.app !==
    "Pocket"
  ) {
    return false;
  }

  if (
    backupData.version !==
    1
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
        typeof plan ===
          "object" &&
        typeof plan.title ===
          "string"
      );
    }
  );
}

/**
 * インポートされた予定を
 * 現在形式へ整える
 */
function normalizeImportedPlan(
  plan
) {
  const now =
    new Date().toISOString();

  const createdAt =
    plan.createdAt ||
    plan.date ||
    now;

  return {
    id:
      plan.id ||
      crypto.randomUUID(),

    title:
      plan.title || "",

    memo:
      plan.memo || "",

    createdAt,

    updatedAt:
      plan.updatedAt ||
      createdAt,

    record:
      plan.record
        ? {
            memo:
              plan.record.memo ||
              "",

            tags:
              Array.isArray(
                plan.record.tags
              )
                ? plan.record.tags
                : [],

            date:
              plan.record.date ||
              createdAt.slice(
                0,
                10
              ),

            photoName:
              plan.record.photoName ||
              "",

            photoData:
              plan.record.photoData ||
              "",

            savedAt:
              plan.record.savedAt ||
              createdAt
          }
        : null
  };
}

/**
 * Pocketのバックアップデータを
 * 現在のデータと置き換える
 */
function importPocketBackup(
  backupData
) {
  if (
    !validatePocketBackup(
      backupData
    )
  ) {
    throw new Error(
      "Pocketのバックアップ形式ではありません。"
    );
  }

  const normalizedPlans =
    backupData.plans.map(
      (plan) =>
        normalizeImportedPlan(
          plan
        )
    );

  savePlans(
    normalizedPlans
  );

  return getPlans();
}

/**
 * 同じIDの予定を統合する
 */
function mergeSamePlan(
  currentPlan,
  importedPlan
) {
  const currentUpdatedAt =
    currentPlan.updatedAt ||
    currentPlan.createdAt ||
    "";

  const importedUpdatedAt =
    importedPlan.updatedAt ||
    importedPlan.createdAt ||
    "";

  const useImportedPlanDetails =
    getTimeValue(
      importedUpdatedAt
    ) >
    getTimeValue(
      currentUpdatedAt
    );

  /*
   * 予定タイトル・予定メモは
   * updatedAtが新しい方を採用する
   */
  const mergedPlan = {
    id:
      currentPlan.id,

    title:
      useImportedPlanDetails
        ? importedPlan.title
        : currentPlan.title,

    memo:
      useImportedPlanDetails
        ? importedPlan.memo
        : currentPlan.memo,

    /*
     * createdAtは作成日時なので
     * 古い方を残す
     */
    createdAt:
      getTimeValue(
        currentPlan.createdAt
      ) <=
      getTimeValue(
        importedPlan.createdAt
      )
        ? currentPlan.createdAt
        : importedPlan.createdAt,

    updatedAt:
      useImportedPlanDetails
        ? importedUpdatedAt
        : currentUpdatedAt,

    record:
      null
  };

  const currentRecord =
    currentPlan.record;

  const importedRecord =
    importedPlan.record;

  /*
   * 片方にしか記録がない場合は
   * 記録がある方を採用する
   */
  if (
    currentRecord &&
    !importedRecord
  ) {
    mergedPlan.record =
      currentRecord;

    return mergedPlan;
  }

  if (
    !currentRecord &&
    importedRecord
  ) {
    mergedPlan.record =
      importedRecord;

    return mergedPlan;
  }

  if (
    !currentRecord &&
    !importedRecord
  ) {
    return mergedPlan;
  }

  /*
   * 両方に記録がある場合は
   * savedAtが新しい方を採用する
   */
  const currentSavedAt =
    currentRecord.savedAt ||
    "";

  const importedSavedAt =
    importedRecord.savedAt ||
    "";

  mergedPlan.record =
    getTimeValue(
      importedSavedAt
    ) >
    getTimeValue(
      currentSavedAt
    )
      ? importedRecord
      : currentRecord;

  return mergedPlan;
}

/**
 * Pocketのバックアップを
 * 現在のデータと統合する
 */
function mergePocketBackup(
  backupData
) {
  if (
    !validatePocketBackup(
      backupData
    )
  ) {
    throw new Error(
      "Pocketのバックアップ形式ではありません。"
    );
  }

  const currentPlans =
    getPlans();

  const importedPlans =
    backupData.plans.map(
      (plan) =>
        normalizeImportedPlan(
          plan
        )
    );

  /*
   * インポート側をIDで検索できるようにする
   */
  const importedPlanMap =
    new Map(
      importedPlans.map(
        (plan) => [
          plan.id,
          plan
        ]
      )
    );

  /*
   * 現在側の並び順を基本として残す
   */
  const mergedPlans =
    currentPlans.map(
      (currentPlan) => {
        const importedPlan =
          importedPlanMap.get(
            currentPlan.id
          );

        /*
         * インポート側に同じIDがなければ
         * 現在の予定をそのまま残す
         */
        if (!importedPlan) {
          return currentPlan;
        }

        /*
         * 処理済みのIDをMapから外す
         */
        importedPlanMap.delete(
          currentPlan.id
        );

        return mergeSamePlan(
          currentPlan,
          importedPlan
        );
      }
    );

  /*
   * 現在側に存在しなかった予定を
   * 追加する
   */
  mergedPlans.push(
    ...importedPlanMap.values()
  );

  savePlans(
    mergedPlans
  );

  return getPlans();
}