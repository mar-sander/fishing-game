# Stage BGM-2 — 2026-10-23 — MP3 / SE Balance Pass

- 基準：BGM-1 Package Ready／remote `main` HEAD `c0660ae909018211e00a5ab451d49fbfbabc4902`（BGM-1取得時）。音声以外の変更なし。
- `audio.js`：MP3音量1.0→0.25、Web Audioのマスターゲイン0.62→0.80、判定SE音量をGREAT 0.38→0.74／GOOD 0.31→0.54／BAD 0.24→0.58へ増強。GREATは上昇ファンファーレ、GOODはアタック増強、BADは下降3音へ調整。ピークキャップ0.62とコンプレッサーは維持。
- `audio.js`：GREAT/GOOD/BAD/方向指示の瞬間にBGMを短時間減衰し、描画フレームに沿って復帰。並列判定時は強い減衰を優先。停止・タイトル・結果・再戦ではダッキング状態をクリア。
- `app.js`：`frame()`から`audio.updateMix()`を1行呼ぶ。ゲーム時計・入力・UIを変更しない。
- `tests/audio.test.cjs`：音量、ダッキング復帰、両者同時判定、ポーズ状態への持越し防止、SE構成の5テスト追加、旧音量の期待値を更新。
- `index.html`／`FISHING_DUEL_FA2_Preview.html`／`SOURCE_HASHES.json`：正本から再生成。HTML構造はBGM-1版と同じ。文書・テスト証拠・`PACKAGE_MANIFEST.json`を更新。
- 不変更：`engine.js`、`scene.js`、`scene.svg`、`style.css`、`page.template.html`、`BGM-battle.mp3`。GitHub書き込みなし。
- GITHUB_WRITE_MODE: NO_WRITE。

---

# Stage BGM-1 — 2026-10-23

- 正式リポジトリ：`mar-sander/fishing-game`。開始base（remote `main`）：`c0660ae909018211e00a5ab451d49fbfbabc4902`。
- 本番のBGMはルートに既にある `BGM-battle.mp3`（Git blob `a34c7e4b41bd19fe636011cf6438a3005604283b`）へ差し替え。既存の20秒PCMは再生処理から切離し、互換関数だけ残しました。
- `audio.js`：音楽のみHTMLAudioElementへ変更。タイトル/カウントダウン/ポーズ/結果は無音、再開では `currentTime` を維持、再戦やタイトルへ戻った場合は先頭へリセット。音量1.0。SEは従来のWebAudioのまま。
- 単体プレビューは `file://` の時のみ外部の公開済みPages音源を参照。本番は同ディレクトリの `BGM-battle.mp3` を参照。
- `tests/audio-harness.cjs`、`tests/dom-harness.cjs`、`tests/audio.test.cjs`、`tests/package.test.cjs`：音楽位置維持・各画面での消音・新規音源・旧PCM非起動などを検証。
- README、RELEASE_HANDOFF、TEST_RESULTS / TEST_OUTPUT、SOURCE_HASHES / PACKAGE_MANIFEST、ビルド生成HTML更新。
- **不変更**：`app.js`、`engine.js`、`scene.js`、`scene.svg`、`style.css`、`page.template.html`、既存SE生成PCMとその音量・ゲーム仕様。
- `GITHUB_WRITE_MODE: NO_WRITE`。公開未実施。

---

# Final Adjustment 2 — 変更一覧

開始：FD-S1-FA1-RC2 → 完成：**FD-S1-FA2-RC3**

開始時にRC2のPACKAGE_MANIFESTの28ファイルをSHA-256照合し、全件一致を確認。RC2 ZIP SHA-256：e933ae682a7ec8f86a6e7a984509fd54ed70372cf0d250511bd36b9853de0b19。

## 製品・構築原本

| ファイル | 変更箇所 |
| --- | --- |
| scene.js | GREATだけの追加動作。魚の胴体変形・ひねり・尾の連打、人間の沈み込み・身体の引き上げ・竿と船の反動。口を変形支点とし、手の移動も竿の接続計算へ反映 |
| scene.js | 左右別のGREAT/BAD記号、追従位置、登場・消失、寿命、reset・新指示・決着の消去、reduced-motion |
| app.js | pause時にscene.clearSignals()を1行追加。ゲーム時計や音の制御は変更なし |
| tools/create_scene.py / scene.svg | fish-flexグループと、左右の「！」・絡まった線の軽量SVGを追加 |
| page.template.html | 候補版の識別文字だけFA2/RC3へ更新。中央矢印やレイアウトは変更なし |
| tools/build.py | 単体HTML名をFISHING_DUEL_FA2_Preview.htmlへ変更 |
| index.html / FISHING_DUEL_FA2_Preview.html / SOURCE_HASHES.json | 正本から再生成 |

## テスト・文書

| ファイル | 変更箇所 |
| --- | --- |
| tests/fa2.test.cjs（新規） | 19テスト。記号条件・混在と同時判定・GOOD一致・専用動作・追従・寿命・リセット・停止再開再戦・reduced-motion・同時GREATの接続 |
| tests/rc2-good-reference.json（新規） | 照合済みRC2から採取した魚/人間GOOD各6姿勢。比較元scene.jsのSHA-256付き |
| tests/fa1.test.cjs | 手→竿の接続検査に、追加されたGREATの上半身移動を含める。閾値や接続精度の緩和なし |
| tests/package.test.cjs | FA2プレビューのファイル名へ更新 |
| README.md / AI_DESIGN_NOTES.md / DESIGN_NOTES.md / RELEASE_HANDOFF.md / TEST_RESULTS.md / TEST_OUTPUT.txt | 今回の範囲・実測・実機待ちへ更新 |
| RC2_PROTECTED_HASHES.json（新規） | 同一バイトを確認した主要8ファイルのハッシュ |
| PACKAGE_MANIFEST.json | 全同梱物のハッシュを更新 |

## 非変更範囲

**engine.js・audio.jsはRC2と同一バイト**。style.cssはFA2完成時点でRC2と同一でしたが、後続のOverlay Opacity Fixで背景色指定1箇所だけ変更しています。ルール、数値、入力、HP、勝敗、BGM/SE、UIレイアウト、中央SVG方向指示を維持。GOODの既存動作式は変更せず、RC2姿勢との一致を検証しました。既存96件の検査を維持し、検査コードの調整は2件（参照ファイル名と手の移動）に限定しました。

RC2原本・他プロジェクト・GitHubは変更していません。旧FA1プレビューは今回のZIPに混在させず、過去の納品物はそのまま保管しています。

## RC3後続調整 — Overlay Opacity Fix（2026-10-21）

No.M指定により現行配布版の `style.css` の `.overlay` 内 `background` のみ `#082537aa` → `#0825373d` に変更。`tools/build.py` から単体プレビューを再生成。`SOURCE_HASHES.json`・`PACKAGE_MANIFEST.json`を更新。旧 `FISHING_DUEL_FA1_Preview.html` は歴史的参照として変更しません。エンジン・SE/BGM・シーン・入力・UI配置・テスト期待値への変更なし。
