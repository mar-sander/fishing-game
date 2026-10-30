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

# Stage RESULT-1 — Final Adjustment 1 / Grand Victory Fanfare

No.Mの試聴指摘を受けて、勝利ファンファーレだけをより壮大・派手な8秒アレンジに改訂したプレビュー候補版です。

**推奨確認順:** まず別添 `FISHING_DUEL_Result1_FA1_WIN_Demo.mp3` を聴いてください。方向性にOKが出たら単体HTMLを試遊し、SOUND ON→対戦終了→結果画面での演奏を確認してください。

- 現行公開基準：`44f08082d52db339598765aa0d8205f7d1f6d9d0`、Repository `mar-sander/fishing-game`
- ゲーム本体は結果画面用の8秒PCM自動生成を継続し、新たなMP3ファイルを必要としません。デモMP3は試聴専用。
- 変更：`audio.js`の勝利音源合成部分と勝利音量のみ、`tests/audio.test.cjs`に確認1件追加、ビルド生成物／資料類の更新。
- 不変更：DRAW／DOUBLE K.O.の音源、BGM-battle.mp3、判定SE、対戦ルール、SVG・CSS、アプリ進行。
- 公開URL想定：`https://mar-sander.github.io/fishing-game/`。**現時点では未公開**。
- `GITHUB_WRITE_MODE: NO_WRITE`。正式版のmainへのマージはNo.Mの明示承認後。

---

# FISHING DUEL — Stage RESULT-1: 8秒ファンファーレ

**新しい試遊候補版／Package Ready／GitHub書き込み禁止 — 2026-10-28**

- 勝敗結果の画面が現れた瞬間に、8秒のオリジナルファンファーレを一回だけ再生します。
- `HUMAN WIN` と `FISH WIN` は同じ明るい勝利ファンファーレ。`DRAW` は未決着らしい抑えた終幕、`DOUBLE K.O.` は低音主体の終幕。どれも約8秒。
- 従来の試合終了SEは結果表示**2.2秒前**の決着時点に鳴り、ファンファーレとは重なりません。
- 対戦中の `BGM-battle.mp3` とGREAT／GOOD／BADのSE、音量0.25、ダッキング、ポーズ再開位置保持はすべて維持します。
- SOUND OFFではファンファーレを鳴らしません。再戦やタイトル戻り、結果画面でのSOUND OFFでは即時停止します。
- 新規素材ファイルなし、外部ライブラリなし、追加費用なし。全音程とリズムを新規に合成した音源であり、既存SEと同じWeb Audio経路です。
- このファンファーレは**試作**です。ブラウザ内で実際に聞こえる音量や音質はNo.Mの試聴を最終基準とします。

**短い確認手順：** まず `FISHING_DUEL_Result1_WIN_Fanfare_Demo.mp3` で8秒のメロディを試聴。次に同梱の単体HTMLで SOUND ON → 試合終了までプレイ → 結果画面でファンファーレ → 再戦やタイトルで停止することを確認してください。単体HTMLはBGMのみ公開サイトのMP3へ接続します。PC未使用の試聴はデモMP3だけでも可能です。

- Repository：`mar-sander/fishing-game`。基準remote main：`44f08082d52db339598765aa0d8205f7d1f6d9d0`。
- 公開予定ページ：`https://mar-sander.github.io/fishing-game/`
- **GitHubへのpush／PR／mainマージ／公開は未実施**。公開にはこのRESULT-1候補版へのNo.Mの明示承認が必要です。

---

# FISHING DUEL — Stage BGM-2: Battle Mix / Judgment SE Boost

**Release candidate / Package Ready / GitHub書き込みなし** — 2026-10-23

Stage BGM-1の実機レビューで「MP3のBGMが大きすぎ、GREATなどのSEが聞こえない」と判明したため、音声バランスだけを再調整しました。

- BGMの基準音量：`1.0` → **`0.25`**（HTMLAudioElement）。通常のゲーム中はこの音量です。
- GREAT / GOOD / BADの効果音：Web Audioのマスターと各SE音量を上げ、音形も強化しました。GREATは短い衝撃と上昇するファンファーレ、GOODは短い成功音、BADは低音下降の失敗音です。
- **自動ダッキング**：SE開始時にBGMを一時的に下げ、その後約0.2秒を目安に滑らかに戻します。GREATは `0.085` まで約0.60秒、GOOD/BADは `0.14` まで約0.37秒、方向指示音は `0.17` まで約0.16秒下げます。両者の判定が重なっても、より強いダッキングを優先します。
- タイトル・対戦前カウントダウン・ポーズ・結果中はBGM無音。ポーズ後は直前の再生位置から復帰、再戦は曲の先頭から再生。音楽素材自体は差し替えません。
- SOUND OFFはBGM・SE双方を停止。音声以外のゲームルール、判定時間、表示、演出、キー操作には変更なし。
- BGMファイル `BGM-battle.mp3` は公開リポジトリの既存ファイルをそのまま利用します。**ZIPにはMP3を再同梱しません。** 単体HTMLから再生する際はインターネット接続が必要です。

**実機確認**：SOUND ON→対戦→GREAT（左右別または同時）・GOOD・BADで音量を比較→Escで停止→再開で曲の再生位置を確認→タイトル復帰でBGM停止を確認。PC側の音量設定・スピーカーの音量も影響します。最終バランスはNo.Mの耳で確認してください。

GitHubへの変更／PR／merge／Pages更新はしていません。公開には別途No.Mの明示承認が必要です。

---

# FISHING DUEL Stage BGM-1 — Battle MP3 Replacement

**公開済みFA2 / RC3のBGMのみ差し替える公開候補版**（2026-10-23）。GitHub書込なし。

- MP3：GitHub Pages直下の `BGM-battle.mp3`（既に公開リポジトリ `main` に存在するファイル）。
- タイトル／開始3秒カウントダウン／一時停止／結果画面ではBGMを再生しません。
- SOUND ONの場合のみ、対戦が `playing` に入るとループ再生します。
- Esc／画面離脱で停止し、再開のカウントダウン後は**停止位置から続けます**。
- 再戦／タイトル復帰／試合終了後は、次の対戦に備えてBGMを先頭へ戻します。
- BGMの再生音量は最大（HTMLMediaElement `volume = 1`）。SE音量、判定、ゲーム時間は不変更です。
- 単体プレビューHTMLの表示・操作は単体で可能ですが、**BGMだけはネット接続が必要**です。`file://`で開く際は公開URLのMP3を読みます。MP3が無い・再生不可の場合、ゲームとSEは続行します。

### 実機レビューの最小手順

SOUND ON → 対戦開始 → カウントダウン中はBGMなし → ゲーム中の音量を確認 → 5秒程度でEsc → 無音・停止を確認 → 再開 → カウントダウン後に曲の途中から復帰することを確認 → タイトルへ戻り無音 → 再戦で曲の最初から始まることを確認。

**公開は未実施です。** `main` へはNo.Mの明示承認後にのみ反映します。BGM音源の利用・公開権限も最終確認してください。

---

## 旧RC3の仕様・構成（履歴）

# FISHING DUEL — Stage 1 / Final Adjustment 2

**FD-S1-FA2-RC3（Overlay Opacity Fix適用版）** / 2026-10-21 / Package Ready（実機確認待ち）

RC2の正式ソースを継続し、キャラクターの判定リアクションだけを強化した試遊候補版です。

## 試遊

**FISHING_DUEL_FA2_Preview.html** は、全CSS・JS・SVGを内包した単体版です。別納品のファイルを開けば、ZIPの解凍・構築・追加インストール・ネット接続は不要です。プレイにはPCのChromeと物理キーボードを使います。

| 位置 | 担当 | 上 / 左 / 下 / 右 |
| --- | --- | --- |
| 左 | 2P FISH | W / A / S / D |
| 右 | 1P HUMAN | ↑ / ← / ↓ / → |
| 共通 | 停止 / 再開 | Esc |

中央の同じ矢印へ、それぞれのキーで答えます。最初は消音です。従来どおりSOUND OFFボタンでBGM・SEをまとめて有効にできます。

## 今回の3点

- **GREATの専用動作**：魚は口を支点に胴体をひねって尾を連打。人間は短く沈み込み、身体を持ち上げながら踏ん張って竿を引き、反動をボートと竿へ伝えます。追加動作は0.72秒以内に収束します。
- **GREATの「！」**：成功した側の頭上に、キャラクターへ追従する図形記号を表示します。
- **BADのモヤモヤ**：失敗した側の頭上に、絡まった手描き風の線を表示します。煙や雲の画像ではありません。

記号は約0.66秒で消えます。GOOD・MISSには表示しません。左右で異なる判定、両者同時判定にも対応します。一時停止では記号を消し、新指示・決着・再戦・タイトルにも残しません。reduced-motionでは追加の大きな動きや記号の揺れを止め、記号自体は短く静止表示します。

## 1〜2分の確認例

1. 一方ずつすぐ正解し、魚のひねり・尾と、人間の全身の引き上げ、「！」を確認します。
2. 同じ方向へ少し遅く入力してGOODと比較します。GOODの動きと音はRC2のままで、記号は出ません。
3. 誤方向でBADを出し、頭上のモヤモヤを確認します。
4. 両者GREAT、片側GREAT／片側BADを試します。記号の所属、糸と口・竿のつながりを見ます。
5. 記号が出た直後にEscで停止し、再開や再戦後に古い記号が残らないことを確認します。

## 維持したもの

60秒、完走時20回のランダムな指示、1秒の受付、GREATは500ms以内、GOODは500ms超〜1000ms以内。ダメージは相手7.5／相手5／自傷2.5／未入力0。HP100、各ラウンドの同時反映、最初の1入力だけ採用、保持・repeat無効、KO・時間切れ・DRAW・DOUBLE K.O.の条件は同じです。

**engine.js・audio.jsはRC2と同一バイト**です。style.cssはFA2完成時点ではRC2と一致していましたが、今回の微調整で `.overlay` の `background` を `#082537aa` から `#0825373d` へ変更しました。BGM・SE、操作、HP、中央SVG方向指示、UIレイアウトは変更していません。GOODは魚・人間の12姿勢をRC2の記録と比較し、竿・糸・尾も一致しました。

停止中は双方の試合・判定時間を固定し、再開時は3秒カウントダウン。タブ離脱や200ms超の描画停止による自動停止も既存どおりです。

## 構成と検証

- 通常起動：index.htmlとstyle.css、engine.js、scene.js、audio.js、app.js。SVGはindexに内包。
- 編集用正本：page.template.html、scene.svg、tools/create_scene.py、tools/build.py。
- tests/：既存96件を基準に19件追加。最終実測 **115 PASS / 0 FAIL / 0 SKIP**。
- CHANGELOG.md：今回のファイル・箇所と非変更範囲。
- AI_DESIGN_NOTES.md：AIが選んだ動作と理由。
- TEST_RESULTS.md / TEST_OUTPUT.txt：環境・検証範囲・実測ログ・未確認事項。
- RELEASE_HANDOFF.md：照合・移送・後続の公開ゲート。
- SOURCE_HASHES.json / PACKAGE_MANIFEST.json：起動用コードと全同梱物のSHA-256。
- RC2_PROTECTED_HASHES.json：RC2から変更していない主要ファイルの照合情報。
- SPECIFICATION.md / FINAL_ADJUSTMENT_1.md：過去の受領指示。今回の範囲は本書とCHANGELOGを参照し、現行操作は上表を優先。

開発者向け（試遊には不要）：

```sh
python3 tools/build.py
node --test tests/*.test.cjs
```

模擬DOM・模擬Web Audioによる自動検証と、SVGを画像化した姿勢確認を実施しました。**実ブラウザの描画・アニメーション、物理キーボード、実音での確認は未実施**です。No.Mの実機レビューを待っています。

**GITHUB_WRITE_MODE: NO_WRITE**。GitHubへのpush・PR・merge・公開はしていません。Repository・公開URL・Gitのbase/headは未作成／該当なし。別チャットJUIZによるZIP受取は未確認です。
