const exportButtonElement =
  document.getElementById(
    "export-button"
  );

/**
 * Pocketのバックアップを書き出す
 */
exportButtonElement.addEventListener(
  "click",
  () => {
    closeSettingsMenu();

    const plans =
      getPlans();

    if (plans.length === 0) {
      const shouldExport =
        window.confirm(
          "保存されている予定や記録がありません。\n" +
          "空のバックアップを書き出しますか？"
        );

      if (!shouldExport) {
        return;
      }
    }

    exportPocketBackup();
  }
);