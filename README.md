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
