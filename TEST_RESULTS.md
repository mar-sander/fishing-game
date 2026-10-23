# Stage BGM-2 — Test Results (final source)

環境：Node.js v22.16.0 / Linux。`node --test tests/*.test.cjs`。

**122 PASS / 0 FAIL / 0 SKIP**（BGM-1の117件回帰＋音声バランス追加5件）。

追加確認：MP3基準音量0.25／SEマスター0.80、GREAT/GOOD/BADの新ゲイン、BGMの自動減衰と戻り、両者判定が重なった場合、ポーズ・SOUND OFF・結果画面でダッキング解除、既存再生位置とSE定位の維持。`tests/package.test.cjs`で正本と単体プレビューのコード同一性を確認。

**注意**：模擬Web Audio / HTMLMediaElementとNode実行による検証。実際のChrome・スピーカーで音が適切に聞こえるか、楽曲との主観的バランスが良いか、外部MP3配信の確実性は未検証。No.Mの実機試聴が必要。

---

# Stage BGM-1 — Test Results

Node.js v22.16.0 / Linux / 2026-10-23. Final source: see SOURCE_HASHES.json.

**117 PASS / 0 FAIL / 0 SKIP**（全既存回帰＋BGM差し替えの再生位置テスト）。

`audio.test.cjs` で、SOUND OFF/ON、再生許可失敗、遅延再生、タイトル／カウントダウン／ポーズ／ゲーム／結果、停止前からの続き、再戦頭出し、旧PCM BGM不使用、従来SEの定位・声数を検証。`package.test.cjs` でビルド・ハッシュとMP3以外の外部依存なしを検証。

**未検証**：MP3実音の音量、実ブラウザでの再生許可、公開PagesのMP3配信完了。Chromium起動は可能でも当実行環境ポリシーでURLナビゲーションがブロックされたため、ブラウザ検証をPASSと扱わない。

テスト全文は `TEST_OUTPUT.txt`。
