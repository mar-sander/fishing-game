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

# Stage RESULT-1 — Final Adjustment 1 (2026-10-28)

- No.Mの試聴フィードバック「勝利をもっと壮大かつ派手に」を反映。WINの8秒ファンファーレのみ刷新。
- 金管の重奏、ストリングス風の和音、ティンパニ、スネア連打、シンバル、鐘のアルペジオ、終盤のクライマックスを、外部音源に依存せず自作PCMで合成。
- 勝利時の再生ゲインのみ .66→.78。DRAW／DOUBLE K.O.のPCMは前版とビット単位で一致。戦闘BGMとSE、ゲームロジック、UIは変更しない。
- `GITHUB_WRITE_MODE: NO_WRITE`。No.Mの今回版の受け入れ・公開承認は未取得。

---

# Stage RESULT-1 — Result Screen Fanfare (2026-10-28)

- `audio.js`: 8.0-second synthesized original fanfare for HUMAN WIN / FISH WIN, separate restrained 8.0-second ending for DRAW and DOUBLE K.O. Existing Web Audio chain and SOUND control reused. No external fanfare assets or ongoing downloads.
- `app.js`: trigger exactly once when result overlay becomes visible (after existing 2.2-second finish animation).
- Lifecycle: silence during title/countdown/pause; battle MP3 stops on finish; result fanfare plays only with SOUND ON. New game, title, or SOUND OFF stops fanfare.
- `tests/audio.test.cjs`: result timing, 8-second length, finite PCM, outcome-specific motifs, SOUND OFF/scene exit cleanup, app transition, no battle BGM overlap.
- Generated `index.html`, single-file preview and source hashes from unchanged `tools/build.py`.
- Base main: `44f08082d52db339598765aa0d8205f7d1f6d9d0` (confirmed 2026-10-28). `GITHUB_WRITE_MODE: NO_WRITE`. This is a new unpublished candidate; do not treat earlier public approval as merge permission.

---

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
