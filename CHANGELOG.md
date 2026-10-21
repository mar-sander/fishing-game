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
