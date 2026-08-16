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
                  "選択したバックアップを、" +
                  "現在のPocketと統合します。\n\n" +
                  `現在：${currentPlans.length}件\n` +
                  `読み込み：${importedPlans.length}件\n\n` +
                  "同じ予定がある場合は、" +
                  "新しく編集された内容を優先します。\n" +
                  "片方にしかない予定は両方残ります。\n\n" +
                  "統合前に現在のデータを" +
                  "バックアップしておくことをおすすめします。\n\n" +
                  "統合しますか？"
                )
              : (
                  "選択したバックアップを読み込みます。\n\n" +
                  `読み込むデータ：${importedPlans.length}件\n\n` +
                  "続けますか？"
                );

          const shouldImport =
            window.confirm(
              confirmationMessage
            );

          if (!shouldImport) {
            return;
          }

          /*
           * 現在のデータがない場合も
           * 統合処理で問題なく読み込める。
           */
          const mergedPlans =
            mergePocketBackup(
              backupData
            );

          renderPlans();
          renderArchive();

          showView(
            "pocket"
          );

          window.alert(
            "バックアップを統合しました。\n\n" +
            `現在のデータ：${mergedPlans.length}件`
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