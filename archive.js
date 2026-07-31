const archiveSearchInput =
  document.getElementById(
    "archive-search-input"
  );

const clearSearchButton =
  document.getElementById(
    "clear-search-button"
  );

const archiveTagList =
  document.getElementById(
    "archive-tag-list"
  );

const archiveWeekTabs =
  document.getElementById(
    "archive-week-tabs"
  );

const archiveList =
  document.getElementById(
    "archive-list"
  );

const archiveEmptyMessage =
  document.getElementById(
    "archive-empty-message"
  );

let selectedArchiveTag = "";
let selectedWeekKey = "";

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
      `〜` +
      `${end.getFullYear()}/` +
      `${endMonth}/${endDate}`
    );
  }

  return (
    `${startMonth}/${startDate}` +
    `〜` +
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
 * すべてのタグを取得する
 */
function getAllArchiveTags(records) {
  const tags =
    records.flatMap(
      (plan) =>
        plan.record.tags || []
    );

  return [
    ...new Set(tags)
  ].sort(
    (first, second) =>
      first.localeCompare(
        second,
        "ja"
      )
  );
}

/**
 * タグ候補を表示する
 */
function renderArchiveTags(records) {
  const tags =
    getAllArchiveTags(records);

  archiveTagList.innerHTML = "";

  tags.forEach((tag) => {
    const button =
      document.createElement(
        "button"
      );

    button.type = "button";

    button.className =
      "tag-filter-button";

    button.textContent =
      `#${tag}`;

    button.dataset.tag =
      tag;

    button.classList.toggle(
      "active",
      selectedArchiveTag === tag
    );

    archiveTagList.appendChild(
      button
    );
  });

  archiveTagList.classList.toggle(
    "hidden",
    tags.length === 0
  );
}

/**
 * 検索条件に合う記録を取得する
 */
function getFilteredRecords(records) {
  const searchText =
    archiveSearchInput.value
      .trim()
      .toLocaleLowerCase("ja");

  return records.filter((plan) => {
    const tags =
      plan.record.tags || [];

    const normalizedTags =
      tags.map((tag) =>
        tag.toLocaleLowerCase("ja")
      );

    const matchesSelectedTag =
      !selectedArchiveTag ||
      tags.includes(
        selectedArchiveTag
      );

    const matchesSearch =
      !searchText ||
      normalizedTags.some((tag) =>
        tag.includes(searchText)
      );

    return (
      matchesSelectedTag &&
      matchesSearch
    );
  });
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

/**
 * Archiveカードを作成する
 */
function createArchiveCard(plan) {
  const card =
    document.createElement(
      "article"
    );

  card.className =
    "archive-card";

  card.dataset.id =
    plan.id;

  const header =
    document.createElement(
      "header"
    );

  header.className =
    "archive-card-header";

  const title =
    document.createElement(
      "h3"
    );

  title.className =
    "archive-card-title";

  title.textContent =
    plan.title;

  const date =
    document.createElement(
      "time"
    );

  date.className =
    "archive-card-date";

  date.dateTime =
    plan.record.date;

  date.textContent =
    getRecordDateLabel(
      plan.record.date
    );

  header.appendChild(title);
  header.appendChild(date);

  card.appendChild(header);

  const body =
    document.createElement(
      "div"
    );

  body.className =
    "archive-card-body";

  if (plan.record.memo) {
    const recordMemo =
      document.createElement(
        "p"
      );

    recordMemo.className =
      "archive-card-memo";

    recordMemo.textContent =
      plan.record.memo;

    body.appendChild(
      recordMemo
    );
  }

  if (plan.memo) {
    const planMemo =
      document.createElement(
        "div"
      );

    planMemo.className =
      "archive-plan-memo";

    const label =
      document.createElement(
        "span"
      );

    label.className =
      "archive-plan-memo-label";

    label.textContent =
      "予定メモ";

    const text =
      document.createElement(
        "span"
      );

    text.textContent =
      plan.memo;

    planMemo.appendChild(label);
    planMemo.appendChild(text);

    body.appendChild(planMemo);
  }

  if (plan.record.photoName) {
    const photoFrame =
      document.createElement(
        "div"
      );

    photoFrame.className =
      "archive-photo-frame";

    const placeholder =
      document.createElement(
        "div"
      );

    placeholder.className =
      "archive-photo-placeholder";

    const icon =
      document.createElement(
        "span"
      );

    icon.className =
      "archive-photo-icon";

    icon.textContent =
      "📷";

    const filename =
      document.createElement(
        "span"
      );

    filename.className =
      "archive-photo-filename";

    filename.textContent =
      plan.record.photoName;

    placeholder.appendChild(icon);
    placeholder.appendChild(filename);

    photoFrame.appendChild(
      placeholder
    );

    body.appendChild(
      photoFrame
    );
  }

  if (
    plan.record.tags &&
    plan.record.tags.length > 0
  ) {
    const tagsArea =
      document.createElement(
        "div"
      );

    tagsArea.className =
      "archive-card-tags";

    plan.record.tags.forEach(
      (tag) => {
        const tagElement =
          document.createElement(
            "span"
          );

        tagElement.className =
          "archive-tag";

        tagElement.textContent =
          `#${tag}`;

        tagsArea.appendChild(
          tagElement
        );
      }
    );

    body.appendChild(tagsArea);
  }

  card.appendChild(body);

  return card;
}

/**
 * 通常時は選択中の週を表示する
 */
function renderWeeklyArchive(records) {
  renderWeekTabs(records);

  archiveList.innerHTML = "";

  const weeklyRecords =
    records.filter(
      (plan) =>
        getWeekKey(
          plan.record.date
        ) === selectedWeekKey
    );

  const group =
    document.createElement(
      "section"
    );

  group.className =
    "archive-group";

  const groupTitle =
    document.createElement(
      "h3"
    );

  groupTitle.className =
    "archive-group-title";

  groupTitle.textContent =
    getWeekLabel(
      selectedWeekKey
    );

  group.appendChild(
    groupTitle
  );

  weeklyRecords.forEach(
    (plan) => {
      group.appendChild(
        createArchiveCard(plan)
      );
    }
  );

  archiveList.appendChild(
    group
  );
}

/**
 * 検索中は月ごとにまとめて表示する
 */
function renderMonthlyArchive(records) {
  archiveWeekTabs.classList.add(
    "hidden"
  );

  archiveList.innerHTML = "";

  const monthGroups = {};

  records.forEach((plan) => {
    const monthKey =
      getMonthKey(
        plan.record.date
      );

    if (!monthGroups[monthKey]) {
      monthGroups[monthKey] = [];
    }

    monthGroups[monthKey].push(
      plan
    );
  });

  const monthKeys =
    Object.keys(monthGroups)
      .sort()
      .reverse();

  monthKeys.forEach((monthKey) => {
    const group =
      document.createElement(
        "section"
      );

    group.className =
      "archive-group";

    const groupTitle =
      document.createElement(
        "h3"
      );

    groupTitle.className =
      "archive-group-title";

    groupTitle.textContent =
      getMonthLabel(monthKey);

    group.appendChild(
      groupTitle
    );

    monthGroups[monthKey].forEach(
      (plan) => {
        group.appendChild(
          createArchiveCard(plan)
        );
      }
    );

    archiveList.appendChild(
      group
    );
  });
}

/**
 * Archive全体を描画する
 */
function renderArchive() {
  const allRecords =
    sortRecordsByDate(
      getRecordedPlans()
    );

  renderArchiveTags(
    allRecords
  );

  const filteredRecords =
    getFilteredRecords(
      allRecords
    );

  const hasSearchFilter =
    archiveSearchInput.value
      .trim() !== "";

  const hasTagFilter =
    selectedArchiveTag !== "";

  const isFiltering =
    hasSearchFilter ||
    hasTagFilter;

  clearSearchButton.classList.toggle(
    "hidden",
    !hasSearchFilter &&
    !hasTagFilter
  );

  archiveEmptyMessage.classList.toggle(
    "visible",
    filteredRecords.length === 0
  );

  archiveList.innerHTML = "";

  if (filteredRecords.length === 0) {
    archiveList.classList.add(
      "hidden"
    );

    archiveWeekTabs.classList.add(
      "hidden"
    );

    archiveEmptyMessage.textContent =
      allRecords.length === 0
        ? "記録はまだありません。"
        : "条件に合う記録がありません。";

    return;
  }

  archiveList.classList.remove(
    "hidden"
  );

  if (isFiltering) {
    renderMonthlyArchive(
      filteredRecords
    );
  } else {
    renderWeeklyArchive(
      filteredRecords
    );
  }
}

/**
 * Archiveのイベントを準備する
 */
function initArchive() {
  archiveSearchInput.addEventListener(
    "input",
    () => {
      renderArchive();
    }
  );

  clearSearchButton.addEventListener(
    "click",
    () => {
      archiveSearchInput.value = "";
      selectedArchiveTag = "";

      renderArchive();
    }
  );

  archiveTagList.addEventListener(
    "click",
    (event) => {
      const button =
        event.target.closest(
          ".tag-filter-button"
        );

      if (!button) {
        return;
      }

      const clickedTag =
        button.dataset.tag;

      selectedArchiveTag =
        selectedArchiveTag === clickedTag
          ? ""
          : clickedTag;

      renderArchive();
    }
  );

  archiveWeekTabs.addEventListener(
    "click",
    (event) => {
      const button =
        event.target.closest(
          ".week-tab-button"
        );

      if (!button) {
        return;
      }

      selectedWeekKey =
        button.dataset.weekKey;

      renderArchive();
    }
  );

  archiveList.addEventListener(
    "click",
    (event) => {
      const card =
        event.target.closest(
          ".archive-card"
        );

      if (!card) {
        return;
      }

      openRecordModal(
        card.dataset.id
      );
    }
  );
}