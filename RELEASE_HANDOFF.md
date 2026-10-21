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
