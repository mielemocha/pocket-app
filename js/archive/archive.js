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

  if (
    filteredRecords.length === 0
  ) {
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
        selectedArchiveTag ===
        clickedTag
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