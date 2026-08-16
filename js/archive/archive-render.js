/**
 * Archiveの写真部分を作る
 */
function createArchivePhoto(plan) {
  if (
    !plan.record.photoData &&
    !plan.record.photoName
  ) {
    return null;
  }

  const photoFrame =
    document.createElement(
      "div"
    );

  photoFrame.className =
    "archive-photo-frame";

  if (plan.record.photoData) {
    const photoImage =
      document.createElement(
        "img"
      );

    photoImage.className =
      "archive-photo-image";

    photoImage.src =
      plan.record.photoData;

    photoImage.alt =
      `${plan.title}の記録写真`;

    photoImage.loading =
      "lazy";

    photoFrame.appendChild(
      photoImage
    );

    return photoFrame;
  }

  /*
   * 古い記録は画像本体を持っていないため、
   * ファイル名だけ表示する
   */
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

  placeholder.appendChild(
    icon
  );

  placeholder.appendChild(
    filename
  );

  photoFrame.appendChild(
    placeholder
  );

  return photoFrame;
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

  header.appendChild(
    title
  );

  header.appendChild(
    date
  );

  card.appendChild(
    header
  );

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

    planMemo.appendChild(
      label
    );

    planMemo.appendChild(
      text
    );

    body.appendChild(
      planMemo
    );
  }

  const photoElement =
    createArchivePhoto(
      plan
    );

  if (photoElement) {
    body.appendChild(
      photoElement
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

    body.appendChild(
      tagsArea
    );
  }

  card.appendChild(
    body
  );

  return card;
}

/**
 * 通常時は選択中の週を表示する
 */
function renderWeeklyArchive(records) {
  renderWeekTabs(
    records
  );

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
        createArchiveCard(
          plan
        )
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

  records.forEach(
    (plan) => {
      const monthKey =
        getMonthKey(
          plan.record.date
        );

      if (
        !monthGroups[
          monthKey
        ]
      ) {
        monthGroups[
          monthKey
        ] = [];
      }

      monthGroups[
        monthKey
      ].push(
        plan
      );
    }
  );

  const monthKeys =
    Object.keys(
      monthGroups
    )
      .sort()
      .reverse();

  monthKeys.forEach(
    (monthKey) => {
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
        getMonthLabel(
          monthKey
        );

      group.appendChild(
        groupTitle
      );

      monthGroups[
        monthKey
      ].forEach(
        (plan) => {
          group.appendChild(
            createArchiveCard(
              plan
            )
          );
        }
      );

      archiveList.appendChild(
        group
      );
    }
  );
}