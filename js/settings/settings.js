const settingsMenuButtonElement =
  document.getElementById(
    "settings-menu-button"
  );

const settingsMenuElement =
  document.getElementById(
    "settings-menu"
  );

const versionButtonElement =
  document.getElementById(
    "version-button"
  );

const versionModalBgElement =
  document.getElementById(
    "version-modal-bg"
  );

const closeVersionModalElement =
  document.getElementById(
    "close-version-modal"
  );

let settingsMenuOpen = false;

/**
 * 設定メニューを開閉する
 */
function toggleSettingsMenu() {
  settingsMenuOpen =
    !settingsMenuOpen;

  settingsMenuElement.classList.toggle(
    "hidden",
    !settingsMenuOpen
  );

  settingsMenuButtonElement.setAttribute(
    "aria-expanded",
    String(settingsMenuOpen)
  );
}

/**
 * 設定メニューを閉じる
 *
 * app.jsのバックアップ・インポート処理からも
 * 使用するため、グローバル関数として残す。
 */
function closeSettingsMenu() {
  settingsMenuOpen = false;

  settingsMenuElement.classList.add(
    "hidden"
  );

  settingsMenuButtonElement.setAttribute(
    "aria-expanded",
    "false"
  );
}

/**
 * 設定メニューボタン
 */
settingsMenuButtonElement.addEventListener(
  "click",
  (event) => {
    event.stopPropagation();

    toggleSettingsMenu();
  }
);

/**
 * メニュー外を押したら閉じる
 */
document.addEventListener(
  "click",
  () => {
    closeSettingsMenu();
  }
);

/**
 * メニュー内を押しただけでは閉じない
 */
settingsMenuElement.addEventListener(
  "click",
  (event) => {
    event.stopPropagation();
  }
);

/**
 * バージョン情報を開く
 */
versionButtonElement.addEventListener(
  "click",
  () => {
    closeSettingsMenu();

    versionModalBgElement.classList.remove(
      "hidden"
    );
  }
);

/**
 * バージョン情報を閉じる
 */
closeVersionModalElement.addEventListener(
  "click",
  () => {
    versionModalBgElement.classList.add(
      "hidden"
    );
  }
);

/**
 * 背景を押したときも
 * バージョン情報を閉じる
 */
versionModalBgElement.addEventListener(
  "click",
  (event) => {
    if (
      event.target ===
      versionModalBgElement
    ) {
      versionModalBgElement.classList.add(
        "hidden"
      );
    }
  }
);