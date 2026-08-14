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
    getAllArchiveTags(
      records
    );

  archiveTagList.innerHTML = "";

  tags.forEach((tag) => {
    const button =
      document.createElement(
        "button"
      );

    button.type =
      "button";

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

  return records.filter(
    (plan) => {
      const tags =
        plan.record.tags || [];

      const normalizedTags =
        tags.map(
          (tag) =>
            tag.toLocaleLowerCase(
              "ja"
            )
        );

      const matchesSelectedTag =
        !selectedArchiveTag ||
        tags.includes(
          selectedArchiveTag
        );

      const matchesSearch =
        !searchText ||
        normalizedTags.some(
          (tag) =>
            tag.includes(
              searchText
            )
        );

      return (
        matchesSelectedTag &&
        matchesSearch
      );
    }
  );
}