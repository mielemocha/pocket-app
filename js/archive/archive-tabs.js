/**
 * YYYY-MM-DD形式の日付をDateへ変換する
 */
function parseRecordDate(dateString) {
  if (!dateString) {
    return new Date();
  }

  return new Date(
    `${dateString}T00:00:00`
  );
}

/**
 * DateをYYYY-MM-DD形式へ変換する
 */
function formatDateKey(date) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * 月曜日を週の開始日にする
 */
function getWeekStart(date) {
  const result =
    new Date(date);

  const day =
    result.getDay();

  const difference =
    day === 0
      ? -6
      : 1 - day;

  result.setDate(
    result.getDate() +
    difference
  );

  result.setHours(
    0,
    0,
    0,
    0
  );

  return result;
}

/**
 * 週の終了日を取得する
 */
function getWeekEnd(weekStart) {
  const weekEnd =
    new Date(weekStart);

  weekEnd.setDate(
    weekEnd.getDate() + 6
  );

  return weekEnd;
}

/**
 * 記録日から週のキーを取得する
 */
function getWeekKey(dateString) {
  const date =
    parseRecordDate(dateString);

  return formatDateKey(
    getWeekStart(date)
  );
}

/**
 * 週タブの表示名を取得する
 */
function getWeekLabel(weekKey) {
  if (!weekKey) {
    return "";
  }

  const start =
    parseRecordDate(weekKey);

  const end =
    getWeekEnd(start);

  const startMonth =
    start.getMonth() + 1;

  const startDate =
    start.getDate();

  const endMonth =
    end.getMonth() + 1;

  const endDate =
    end.getDate();

  if (
    start.getFullYear() !==
    end.getFullYear()
  ) {
    return (
      `${start.getFullYear()}/` +
      `${startMonth}/${startDate}` +
      "〜" +
      `${end.getFullYear()}/` +
      `${endMonth}/${endDate}`
    );
  }

  return (
    `${startMonth}/${startDate}` +
    "〜" +
    `${endMonth}/${endDate}`
  );
}

/**
 * 月グループのキーを取得する
 */
function getMonthKey(dateString) {
  const date =
    parseRecordDate(dateString);

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  return `${year}-${month}`;
}

/**
 * 月グループの表示名を取得する
 */
function getMonthLabel(monthKey) {
  const [year, month] =
    monthKey.split("-");

  return (
    `${Number(year)}年` +
    `${Number(month)}月`
  );
}

/**
 * 記録日の表示名を取得する
 */
function getRecordDateLabel(dateString) {
  const date =
    parseRecordDate(dateString);

  return (
    `${date.getFullYear()}年` +
    `${date.getMonth() + 1}月` +
    `${date.getDate()}日`
  );
}

/**
 * 記録を新しい順に並べる
 */
function sortRecordsByDate(records) {
  return [...records].sort(
    (first, second) => {
      const firstTime =
        parseRecordDate(
          first.record.date
        ).getTime();

      const secondTime =
        parseRecordDate(
          second.record.date
        ).getTime();

      if (firstTime !== secondTime) {
        return (
          secondTime -
          firstTime
        );
      }

      return (
        new Date(
          second.record.savedAt || 0
        ).getTime() -
        new Date(
          first.record.savedAt || 0
        ).getTime()
      );
    }
  );
}

/**
 * 週タブを表示する
 */
function renderWeekTabs(records) {
  const weekKeys = [
    ...new Set(
      records.map((plan) =>
        getWeekKey(
          plan.record.date
        )
      )
    )
  ].sort().reverse();

  if (
    !weekKeys.includes(
      selectedWeekKey
    )
  ) {
    selectedWeekKey =
      weekKeys[0] || "";
  }

  archiveWeekTabs.innerHTML = "";

  weekKeys.forEach((weekKey) => {
    const button =
      document.createElement(
        "button"
      );

    button.type = "button";

    button.className =
      "week-tab-button";

    button.dataset.weekKey =
      weekKey;

    button.textContent =
      getWeekLabel(weekKey);

    button.classList.toggle(
      "active",
      selectedWeekKey === weekKey
    );

    archiveWeekTabs.appendChild(
      button
    );
  });

  archiveWeekTabs.classList.toggle(
    "hidden",
    weekKeys.length === 0
  );
}