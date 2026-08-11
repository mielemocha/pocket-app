const importButtonElement =
  document.getElementById(
    "import-button"
  );

const importFileInputElement =
  document.getElementById(
    "import-file-input"
  );

/**
 * インポートするJSONファイルを選ぶ
 */
importButtonElement.addEventListener(
  "click",
  () => {
    closeSettingsMenu();

    /*
     * 同じファイルを続けて選んだ場合でも
     * changeイベントが動くようにリセットする
     */
    importFileInputElement.value = "";

    importFileInputElement.click();
  }
);

/**
 * 選ばれたバックアップを読み込む
 */
importFileInputElement.addEventListener(
  "change",
  () => {
    const selectedFile =
      importFileInputElement.files[0];

    if (!selectedFile) {
      return;
    }

    const fileReader =
      new FileReader();

    fileReader.addEventListener(
      "load",
      () => {
        try {
          const backupData =
            JSON.parse(
              fileReader.result
            );

          if (
            !validatePocketBackup(
              backupData
            )
          ) {
            window.alert(
              "このファイルはPocketのバックアップではありません。"
            );

            return;
          }

          const currentPlans =
            getPlans();

          const importedPlans =
            backupData.plans;

          const confirmationMessage =
            currentPlans.length > 0
              ? (
                  "現在の予定・記録を、" +
                  "選択したバックアップで置き換えます。\n\n" +
                  `現在：${currentPlans.length}件\n` +
                  `復元後：${importedPlans.length}件\n\n` +
                  "続ける前に、現在のデータを" +
                  "バックアップしておくことをおすすめします。"
                )
              : (
                  "選択したバックアップを復元します。\n\n" +
                  `復元するデータ：${importedPlans.length}件`
                );

          const shouldImport =
            window.confirm(
              confirmationMessage
            );

          if (!shouldImport) {
            return;
          }

          importPocketBackup(
            backupData
          );

          renderPlans();
          renderArchive();

          showView(
            "pocket"
          );

          window.alert(
            "バックアップを復元しました。"
          );
        } catch (error) {
          console.error(
            "バックアップの読み込みに失敗しました。",
            error
          );

          window.alert(
            "バックアップを読み込めませんでした。\n" +
            "ファイルが壊れているか、形式が違う可能性があります。"
          );
        } finally {
          importFileInputElement.value =
            "";
        }
      }
    );

    fileReader.addEventListener(
      "error",
      () => {
        window.alert(
          "ファイルの読み込みに失敗しました。"
        );

        importFileInputElement.value =
          "";
      }
    );

    fileReader.readAsText(
      selectedFile,
      "UTF-8"
    );
  }
);