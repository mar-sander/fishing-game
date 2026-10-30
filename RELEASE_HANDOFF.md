# Stage RESULT-1 FA3 — WIN Fanfare Volume 80% (No.M request)

- Date: 2026-10-30. `GITHUB_WRITE_MODE: NO_WRITE`; **Package Ready / No.M review required**.
- Base candidate: RESULT-1 FA2 (WIN MP3). Public `main` as checked before this change: `1caed61b9f9d2d3ffb14f7554dc6bd4f882cc7c3`. RESULT-1 stages are not yet released.
- Requested adjustment only: `audio.js` victory media volume changes from `.70` to `.56` (`.70 × .80`). This is an HTMLAudioElement volume multiplier, not a measured 20% change in perceived loudness.
- No other game/audio behavior changed: battle BGM `.25`, judgment SE, DRAW / DOUBLE K.O. PCM fanfares, gameplay rules, visuals and victory MP3 playback timing are preserved.
- `fanfare.mp3` is already on the GitHub Pages repository root. Standalone preview loads it from `https://mar-sander.github.io/fishing-game/fanfare.mp3`; product `index.html` loads it by relative path. The MP3 file is not repackaged or edited.
- Changed production file: `audio.js`. Updated verification: `tests/audio.test.cjs`; regenerated `FISHING_DUEL_FA2_Preview.html`, `SOURCE_HASHES.json`, `PACKAGE_MANIFEST.json`, testing evidence and this handoff.
- **Not published.** No branch/push/PR/merge/Pages writes. No.M must approve the modified version and expressly authorize publishing. Before release, reconcile source and test changes against the latest `main` (BGM-2 only, not RESULT-1).
- Actual speaker loudness, user-hosted MP3 data and real-device playback are not validated by these source tests.

## Stage RESULT-1 FA3 minimal manual check

1. SOUND ON, play to HUMAN WIN/FISH WIN: same fanfare plays at about 80% of FA2's media gain; battle BGM remains off during results.
2. Replaying, turning SOUND OFF and returning to the title still stop the fanfare. DRAW and DOUBLE K.O. stay identical.

---

# Stage RESULT-1 FA2 — WIN MP3 Fanfare Replacement

2026-10-30 / GITHUB_WRITE_MODE: NO_WRITE / Package Ready, No.M実機評価待ち

- 採用元：Stage RESULT-1 Final Adjustment 1（Grand Fanfare）候補版。前Stageは未公開。
- 最新remote main（読取確認）：`1caed61b9f9d2d3ffb14f7554dc6bd4f882cc7c3`。公開中のベースはStage BGM-2で、RESULT-1とGrand版は未公開のため、公開時はこの候補版の意図した差分をmainへ加える必要がある。
- 勝利（HUMAN WIN / FISH WIN）のRESULT画面に入った瞬間のみ、既存GitHub Pagesルートに追加された `fanfare.mp3` を1回再生。ループなし。実際の長さはMP3本体に従い、8秒で強制停止しない。
- DRAW / DOUBLE K.O.は前候補版の約8秒の自作PCMファンファーレを維持（生成方法／音量変更なし）。
- 戦闘中の `BGM-battle.mp3`（音量 .25、判定時ダッキング、ポーズ再開位置保持）、GREAT/GOOD/BADのSE、60秒・20指示・HP・操作・画面は不変。
- 結果画面に出る前の短い決着SEは従来どおり。勝利MP3は結果画面表示時に鳴るため重ならない。
- SOUND OFF・タイトル復帰・再戦・ウィンドウ離脱では勝利MP3を停止し、次回用に0秒へ戻す。SOUND ON時のみ再生。
- ユーザーアップロード済みGitHub MP3：`mar-sander/fishing-game` → `main/fanfare.mp3`（Git blob `e67a83ab87ba32d52f44a5b50f5cd071c948c754`、248319 bytes）。ソース内で相対参照。ZIP内にMP3を重複同梱しない。単体プレビューは公開済みURLから読込。
- 音源の著作権・公開利用許諾と実MP3の音質・曲長はNo.Mが最終確認する。こちらの環境ではGitHub上の音声バイト本体のダウンロードができず、試聴実測は未実施。
- 製品ソースの変更は`audio.js`のみ。`app.js`の結果画面呼び出しは前RESULT-1から変更なし。`engine.js`、`scene.js`、`scene.svg`、`style.css`、`index.html`、`page.template.html`、`tools/build.py`は前候補版からバイト一致。
- 追加テストを含む回帰：Node.js v22.16.0／Linux、129 PASS・0 FAIL・0 SKIP。Chromium headlessで**代替MP3素材を用いた**HTMLAudioElementの開始・停止・非ループを確認、JS例外なし。実際のfanfare.mp3再生テストではない。
- 公開候補版固定：`SOURCE_HASHES.json`（製品主要ファイル）＋`PACKAGE_MANIFEST.json`（ZIP内部32ファイル）＋別添SHA-256照合テキスト。ZIPと単体プレビューのバイト一致を確認。
- **公開禁止**：No.Mが本候補版を実機で確認し、本Stageについて「公開して」等の明示承認を出すまでpush／PR／merge／Pages変更は実施しない。

## 最小の実機確認

1. サウンドOFF時にWINでも無音。ONにしてHUMAN WINまたはFISH WINのRESULT表示時に追加MP3が鳴る。
2. 戦闘BGMと重ならず、終了後にループせず停止する。
3. ファンファーレ再生中にSOUND OFF／再戦／タイトルへ戻ると停止する。
4. DRAWとDOUBLE K.O.では従来の別ファンファーレが鳴る。

---

# RELEASE_HANDOFF — Stage RESULT-1 Final Adjustment 1

**状態：Package Ready（実機試聴待ち）／GITHUB_WRITE_MODE: NO_WRITE**

- 対象Repository: `mar-sander/fishing-game`; Pages: `https://mar-sander.github.io/fishing-game/`
- 開始remote main: `44f08082d52db339598765aa0d8205f7d1f6d9d0` （2026-10-28に読み取り確認）
- 変更はResult1版の**WIN楽曲に限定**。新しい金管重奏、弦風の持続和音、低音打撃、シンバル、スネアロール、鐘の音、および最後の大和音。
- 本体コード変更: `audio.js`のみ。結果表示への再生トリガー `app.js`はRESULT-1から変更なし。新規外部素材・課金なし。
- テスト変更: `tests/audio.test.cjs`に勝利時の8秒波形・最大振幅・クライマックス強度を検査する1件を追加。
- ビルド生成物更新: `FISHING_DUEL_FA2_Preview.html`、`SOURCE_HASHES.json`、マニフェスト、テスト記録、CHANGELOG、README。index.htmlは前候補版と同一。
- **不変**: DRAW／DOUBLE K.O.の音声波形、`engine.js`、`app.js`、`scene.js`、`scene.svg`、`style.css`、`page.template.html`、`tools/build.py`、戦闘BGMと従来SE。
- 版の同一性は `PACKAGE_MANIFEST.json` と別添 SHA-256 テキスト、およびZIP内プレビューと別添プレビューのバイト単位一致を参照。
- デモMP3は自作Web Audio波形から直接変換した試聴用。GitHubには同梱不要。
- **未検証**：No.Mの実機での勝利音の主観的な印象、実スピーカー音量および音声歪み、実ブラウザでの聴感。
- 著作権：他作品の曲やライセンス不明の音源は利用せず、コードによるオリジナル音符と合成音。
- No.Mの確認と明示公開承認なしにbranch/PR/main/Pagesへの書き込みをしないこと。

## 公開前の確認

1. No.Mが新しい勝利ファンファーレの音色・音量・演奏時間を試聴し受け入れる。
2. 公開担当が `main` の最新HEADと本パッケージのbaseを比較し、製品ファイル `audio.js` の意図した変更のみを反映する。
3. どこプロv0.3に従い、更新済みテスト・PR差分・merge権限とデプロイ成功をそれぞれ確認する。

---

# RELEASE_HANDOFF — Stage RESULT-1 / Result Fanfare

**Package Ready（試聴・実機受け入れ待ち）／GITHUB_WRITE_MODE: NO_WRITE**

- 設計基準：正式「どこでもプロトコル」v0.3（2026-10-20）。PC不要・追加費用0円優先・公開前検証。No.Mの今回の公開承認は未取得。
- Repository：`mar-sander/fishing-game`。公開URL：`https://mar-sander.github.io/fishing-game/`。
- 開始remote `main`：`44f08082d52db339598765aa0d8205f7d1f6d9d0`（2026-10-28に読み取り確認）。
- 正本：前回公開済み `FISHING_DUEL_BGM2_Package_Ready.zip` を基準とし、現行mainの `audio.js` / `app.js` がBGM-2内容であることを照合。
- 今回の製品ソース変更：`audio.js` （結果別8秒ファンファーレのPCM生成と管理）、`app.js`（結果画面表示時の一度きりの呼び出し）。変更したテスト：`tests/audio.test.cjs`。`index.html`はBGM2と同一、プレビュー・ハッシュはbuild.pyによる生成物。
- 不変更：`engine.js`, `scene.js`, `scene.svg`, `style.css`, `page.template.html`, `tools/build.py`, `BGM-battle.mp3`（remote mainに存在・本ZIPには同梱しない）。
- 8秒ファンファーレは自作PCM音源で、ゲーム本体には別ファイルを追加しない。3種の試聴用MP3はレビュー専用で、GitHubへの公開必須ファイルではない。
- 判定確定時の既存短い win/draw/double SEから2.2秒後、結果オーバーレイが見えた時にWeb Audioで約8秒のBGM以外のファンファーレを一度再生。SOUND OFFと画面遷移で停止。勝利2種には同一のメロディー、DRAW/DOUBLE K.O.はそれぞれ別の終幕音。
- 判定タイミング・60秒・20指示・HP・音量0.25・音源のMP3ループ・SE・ポーズ保持に変更なし。
- 結果画面のファンファーレはSOUND ON時のみ。公開前に実機で音質・最大音量、効果音とのバランス、勝敗種ごとの印象を確認する。

## 検証

- Node.js v22.16.0 / Linux：`node --test tests/*.test.cjs`、126 PASS / 0 FAIL / 0 SKIP。
- 新規4件：8秒PCM・3パターン、状態ごとの再生制御、消音・再戦停止、結果画面への遷移連動。
- Chromium 144 / Playwright headlessで単体HTMLをインメモリ表示し、SOUND ON→スタートを確認。JavaScript例外なし。ただしfile://直接アクセスは環境ポリシーでブロックされ、結果画面の実音出力・端末実機確認は未実施。
- 最終ZIP内容とプレビューの一致は `PACKAGE_MANIFEST.json` および外部SHA-256ファイルで照合。

## 公開ガード

- `GITHUB_WRITE_MODE: NO_WRITE`：branch／PR／merge／Pagesは実施しない。
- No.Mからこの版の確認と明示的な公開・マージ承認があるまでmainを変更しない。
- 公開担当はremote main更新状況、Gate A/B/C、テスト・差分・対象ブランチの照合を実施し、承認済み版だけを公開すること。

---

# RELEASE_HANDOFF — Stage BGM-2 / Battle Mix Rebalance

**状態：Package Ready（No.M実機試聴待ち）／GITHUB_WRITE_MODE: NO_WRITE**

## 基準と変更の概要
- 適用基準：Stage BGM-1の添付 `FISHING_DUEL_BGM1_Package_Ready.zip`。そこからの**音声調整のみ**。
- Repository：`mar-sander/fishing-game`、公開URL：`https://mar-sander.github.io/fishing-game/`。
- BGM-1実装開始時のremote `main`：`c0660ae909018211e00a5ab451d49fbfbabc4902`。公開担当は必ず**公開時点の最新main**との突合を行うこと。
- GitHub上の既存音源：`BGM-battle.mp3`、Git blob SHA-1 `a34c7e4b41bd19fe636011cf6438a3005604283b`、約2.05MB。BGM-1実装時に存在を確認。ZIPには含めず、同じ位置の音源を利用する。
- 製品コードの変更：`audio.js`（BGM基準0.25、判定SE音源とゲイン、効果音時ダッキング・音量復帰）、`app.js`（描画フレームからmix更新1行）。`engine.js`／`scene.js`／`scene.svg`／`style.css`／`page.template.html`／ゲームルール・操作は変更なし。
- `index.html` と単体版 `FISHING_DUEL_FA2_Preview.html`、`SOURCE_HASHES.json`は`tools/build.py`から生成。変更済みテストは`tests/audio.test.cjs`。`TEST_RESULTS.md`と`TEST_OUTPUT.txt`が最終テスト証拠。
- **音量値は音質の実機受容を保証しません。** MP3実音・実ChromeのSE対BGMバランス、最大音量での歪みは未検証です。No.Mの試聴を必要とします。

## 挙動
- SOUND ONのときだけBGM・SE再生。
- BGMは対戦（`playing`）中のみ再生。通常音量 0.25、判定SE／方向指示音が出た際に一時減衰し、判定が続けば減衰を延長する。
- Escによるポーズ・再開のカウントダウン中は無音。ポーズ解除後はMP3の停止位置から続ける。
- 再戦・タイトル復帰・結果表示後は、次の対戦を曲の先頭から再開できる。
- SEはWeb Audio、左右の魚・人間の定位および最大4声管理を維持。ゲーム時間や入力には関係しない。

## 公開時の安全手順
1. ZIPの正本・別添プレビューをSHA-256で照合。`PACKAGE_MANIFEST.json`、`SOURCE_HASHES.json`を確認。
2. 公開先最新`main`のソース・MP3が前提から変わっていないか検証し、製品ソースと更新済みテストを反映。
3. Gate A: PR、変更ファイル、差分、CI。Gate B: No.Mの**対象版の受け入れと明示的merge承認**を確認し、mainへ通常merge。Gate C: mainと当該Pagesデプロイ成功を確認、可能ならURL新コード表示も独立確認。
4. 無承認の公開・mainへの書込みは禁止。追加費用0円、PC不要運用。

## 試遊と制限
プレビュー単体HTMLはCSS/JS/SVGを含むが、BGMはネットワーク先のMP3を取得する。実ブラウザ音声出力・曲の主観的な音量・著作権/利用許諾は未確認。SEの音量を上げているため、**初回はPC音量を低めにして試聴**すること。

---

# RELEASE_HANDOFF — Stage BGM-1

**Package Ready（No.M試遊・公開承認待ち） / GITHUB_WRITE_MODE: NO_WRITE**

- どこプロv0.3を確認済み。PC不要、追加費用0円優先。main mergeはNo.Mの明示承認まで実施しません。
- Repository：`mar-sander/fishing-game`
- 公開URL：`https://mar-sander.github.io/fishing-game/`
- 開始remote main完全HEAD：`c0660ae909018211e00a5ab451d49fbfbabc4902`（2026-10-23 取得）。
- 元ソースの `index.html`、`style.css`、`audio.js`、`app.js`、`engine.js`、`scene.js`、`page.template.html`、`scene.svg` は開始時、添付RC3 ZIP内のGit blob SHA-1がremote mainと一致することを確認。
- 音源 `BGM-battle.mp3` は remote main に**存在**（Git blob SHA-1：`a34c7e4b41bd19fe636011cf6438a3005604283b`、2,047,675 bytes）。本ZIPへ再同梱はしていません。main上の音源を再利用してください。MP3実際の配信と音量の実測は未確認です。
- **公開反映に必要な変更**：`audio.js` とテストファイル（`tests/audio-harness.cjs`、`tests/dom-harness.cjs`、`tests/audio.test.cjs`、`tests/package.test.cjs`）、`index.html`（正本のHTML構造は不変更）、`FISHING_DUEL_FA2_Preview.html`（生成物）、`SOURCE_HASHES.json`、文書類。ビルド後の`index.html`はbaseと同一。
- **不変更ファイル**：`app.js`、`engine.js`、`scene.js`、`scene.svg`、`style.css`、`page.template.html` と判定用SEロジック。
- 操作：SOUND ON→対戦をはじめる→3秒カウントダウン終了からBGM開始、Escで保存・無音、再開ボタン→3秒カウントダウン終了後に保存位置から再開。結果/タイトル/再戦は頭出し。SOUND OFFでもポーズ位置保持。
- 単体HTMLは全CSS/JS/SVG内包。**外部BGMの取得だけネット接続を要する**。file://閲覧の場合は公開済みの絶対URLにフォールバックする。
- 検証：Node.js v22.16.0 / Linux、自動テスト117 PASS・0 FAIL・0 SKIP。実ChromiumのURLアクセスは当環境のポリシーによりブロックされ、実ブラウザのBGM再生・オーディオ出力確認は未実施。実ブラウザ・物理キーボードの受け入れはNo.M実機確認待ち。
- GitHub branch/PR：**未作成**、main/Pages未更新。`GITHUB_WRITE_MODE: NO_WRITE`。No.Mが新しいプレビューを承認した後、別途「公開して」でGate A/B/Cへ進む。CI必須条件は公開担当が確認。
- 同一性：`SOURCE_HASHES.json` と `PACKAGE_MANIFEST.json`、外部の SHA256レポートで照合。実際の公開担当は最新mainへの意図しない変更有無と音源の存在を再確認し、非承認の変更を混入させない。
- 音源の著作権・利用許諾についてはNo.M側の最終確認を要する（こちらでは未検証）。

---

## RC3公開前の過去引継ぎ（参考。現行状態は上記優先）

# RELEASE_HANDOFF — Stage 1 Final Adjustment 2

**RELEASE READY（Package Ready） / GITHUB_WRITE_MODE: NO_WRITE**

正式どこプロv0.3と補助テンプレートを開始時に参照しました。今回はRC2完成版の原本を継続するローカルパッケージ作業です。GitHubのpush・PR作成・merge・公開はしていません。

| 項目 | 値 |
| --- | --- |
| 開始版 | FD-S1-FA1-RC2 |
| 基準 | RC2の公開用/編集用原本・テスト・文書。開始時28ファイルのマニフェスト照合が全件一致 |
| 開始ZIP SHA-256 | e933ae682a7ec8f86a6e7a984509fd54ed70372cf0d250511bd36b9853de0b19 |
| 完成候補版 | **FD-S1-FA2-RC3** |
| 完成ZIP | **FISHING_DUEL_Stage1_FA2_RC3_OverlayFix.zip**（現行更新版） |
| ZIPルート | FISHING_DUEL_FA2/ |
| 単体プレビュー | **FISHING_DUEL_FA2_Preview.html** |
| Repository / remote | 未作成／該当なし |
| 開始base HEAD / remote main SHA | 該当なし。指定された開始版はGit管理された版ではなくRC2原本 |
| branch / 完成HEAD / PR | 未作成／該当なし |
| 公開URL / デプロイ方式 | 未作成・未公開／未設定。静的HTML/CSS/JSとして配信可能 |
| CI | 未設定 |
| No.MのRC3実機受け入れ | 未確認・レビュー待ち |
| main merge / 公開承認 | なし |
| 別チャットJUIZによる原本受取 | **未確認（JUIZ側で確認）** |

## 変更・非変更

製品の編集箇所はscene.js、app.jsのpause時1行、SVG原画/生成スクリプト、候補版識別文字、構築時のプレビュー名です。詳しいファイル・箇所一覧はCHANGELOG.md。

GREAT専用の身体動作と「！」、BAD専用の絡まった線を追加。GOODの式、ゲーム時計、入力、数値、HP、勝敗、中央矢印、UI配置は維持しました。**engine.js・audio.jsはRC2と同一バイト**。style.cssはFA2完成時には一致していましたが、今回のOverlay Opacity Fixで `.overlay` の背景色指定1箇所のみ変更しました。RC2_PROTECTED_HASHES.jsonには主要8ファイルのハッシュを記録しています。RC2原本と他プロジェクトは変更していません。

## 正本とプレビューの対応

- 通常配信ファイル：index.html、style.css、engine.js、scene.js、audio.js、app.js。SVGはindex内に入っています。
- 編集用：page.template.html、scene.svg、tools/。公開用正本と必要テストをZIPへ全て同梱。
- 単体HTMLは、同じCSS/JS/SVGをそのまま内包してtools/build.pyから生成。プレビューから正本を抽出していません。
- 別納品のFISHING_DUEL_FA2_Preview.htmlは、ZIP内FISHING_DUEL_FA2/FISHING_DUEL_FA2_Preview.htmlと同一バイト。
- SOURCE_HASHES.jsonは起動用原本と単体版のSHA-256。PACKAGE_MANIFEST.jsonは、それ自身を除く全同梱ファイルのSHA-256。
- ZIPを実際に展開し、同梱ファイルと別納品プレビューを照合。完成ZIP自身のハッシュと照合結果は、外部のFISHING_DUEL_FA2_RC3_OverlayFix_SHA256.txtに記録。循環参照になるためZIP自身のハッシュを内部へ記載しません。
- No.MにCLI・手動解凍・ソース再構成を依頼しません。試遊は別納品の単体HTMLを使用します。

## 検証結果と限界

対象FD-S1-FA2-RC3。Linux / Node.js v24.19.0 / Python 3.12.14。

**115件、115 PASS、0 FAIL、0 SKIP**。既存96件＋FA2追加19件。TEST_OUTPUT.txtに最終原ログ、TEST_RESULTS.mdに範囲と限界。

GOODの魚/人間12姿勢はRC2と一致。GREAT/BADの所属、混在と同時表示、追従・寿命、pause・再開・再戦・タイトル、reduced-motion、同時GREAT時の口/糸/竿/手の接続を確認。既存のルール・入力・音の回帰検証もPASS。

SVGを画像化してGOOD・GREAT・BAD・混在時の姿勢と漫符を確認しました。**実ブラウザの描画・アニメーション、画面サイズ別の実表示、物理キーボード、実音は未検証**。No.Mの実機レビューを待っています。Package Readyは実機受け入れや公開承認を意味しません。

## レビュー例

README.mdに短い手順があります。片側ずつGREATとGOODを比較し、「！」、BADのモヤモヤ、同時GREAT／GREATとBAD、直後のEsc停止・再開を確認します。ゲーム性と音が従来のままであることも確認してください。

## 将来の公開担当JUIZへ

1. **移送確認**：このZIPを実際に取得・展開できるか確認し、SHA-256とプレビュー対応を照合。別チャットから取得可能と推定しない。取れなければ受渡し未完了として止まり、正しい原本の移送を解決します。
2. No.Mの候補版受け入れと、対象Repository・公開方式・当該案件の明示的なmerge／公開承認を確認。今回のNO_WRITEは現在の作業の禁止を維持しています。
3. **Gate A（PR）**：公開用正本とテストを対象へ機械的に反映。実在するbase/head、差分、変更対象、今回の検証証拠を照合。プレビューから復元しない。
4. **Gate B（merge）**：PR・競合・必須CI成功・候補版と現在headの対応・明示承認を確認。期待head指定の通常merge。CIなしは未設定と明記して既存の検証根拠を確認し、不明を成功扱いしない。
5. **Gate C（公開）**：Mergedとremote main更新、そのmerge commitに対応するビルド/デプロイ成功を確認。公開URLでの新コード配信確認は別の事実として報告します。

候補版受け入れ後に挙動の変わる修正があれば、差分を示して必要な再検証・再受け入れを行います。同一性が揃った完成原本を、無理由に再構成・全面再テストする必要はありません。

## 追補 — Overlay Opacity Fix（2026-10-21）

No.M指定の1点修正。`.overlay { background: #0825373d; }`（旧 `#082537aa`）。配布用HTMLは正本 `style.css` から再生成、ハッシュを更新しました。現行パッケージは元のRC3 ZIPとは異なるバイト列です。`RC2_PROTECTED_HASHES.json`は**FA2完成当時の過去記録**として保持しており、今回の `style.css` との一致を意味しません。今回の変更は見た目の透過率のみで、ゲームルール・アニメーション・音・入力には触れていません。実機でオーバーレイ透過率を確認してください。

**更新版の回帰テスト：Node.js v22.16.0 / Linux、115 PASS・0 FAIL・0 SKIP（更新版のTEST_OUTPUT.txt参照）。** FA2初回納品時のNode.js v24.19.0での結果と区別してください。
