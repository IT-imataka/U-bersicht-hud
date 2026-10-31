# Übersicht HUD

Apple Music の再生中の曲を、デスクトップにサイバーパンク風の HUD として表示する [Übersicht](https://tracesof.net/uebersicht/) ウィジェットです。

![demo](./docs/demo.gif)

## できること

- アートワーク、曲名、アーティスト、アルバム名を半透明のパネルに表示
- 再生位置をセグメントバーで表示
- 前の曲 / 再生・一時停止 / 次の曲 / リピート切り替え(なし → 全曲 → 1曲)
- 曲が変わった瞬間だけ曲名がグリッチ

## 動作環境

- macOS - 27.0.1（26A434）
- [Übersicht](https://tracesof.net/uebersicht/) - 1.6
- ミュージック(Apple Music)アプリ

## インストール

1. Übersicht をインストールします。

   ```bash
   brew install --cask ubersicht
   ```

2. Übersicht のウィジェットフォルダに、**`edgerunners-hud.widget` というフォルダ名で** clone します。

   ```bash
   cd "$HOME/Library/Application Support/Übersicht/widgets"
   git clone https://github.com/IT-imataka/U-bersicht-hud.git edgerunners-hud.widget
   ```

   > フォルダ名が違うとスクリプトのパスがずれて動きません。

3. 初回に「Übersicht が "ミュージック" を制御しようとしています」と表示されたら、許可します。
   あとから変更する場合は「システム設定」→「プライバシーとセキュリティ」→「オートメーション」で設定できます。

## カスタマイズ

位置と大きさは `index.jsx` の `className` で変更できます。

```js
export const className = `
  right: 72px;              /* 右端からの距離 */
  top: 50%;                 /* 上端からの位置 */
  transform: translateY(-50%);
  zoom: 1;                  /* 全体の大きさ(0.8 で 80%) */
`;
```

色は `index.jsx` 内の CSS 変数(`--yellow`、`--cyan`、`--magenta`、`--panel`)で変更できます。

## 仕組み

```
Übersicht(index.jsx)
  └─ 1秒ごとに lib/now-playing.sh を実行
       └─ lib/now-playing.applescript でミュージックに問い合わせ
            ├─ 曲情報を1行の文字列で返す
            └─ 曲が変わったときだけ cache/artwork.jpg を書き出す
```

ボタン操作は `osascript` でミュージックを直接操作しています。
詳しい解説は Qiita の記事にまとめています。

(https://qiita.com/IT-imataka/items/6069a4722dd58a1a9f18)

## ファイル構成

```
edgerunners-hud.widget/
├── index.jsx                     # 描画とボタン操作
├── lib/
│   ├── now-playing.applescript   # ミュージックから曲情報とアートワークを取得
│   └── now-playing.sh            # 前回の曲を覚えておき、結果を整形する
└── cache/                        # 実行時に自動生成(Git 管理外)
```

## うまく動かないとき

- **「ミュージックで曲を再生すると、ここに表示されます」のまま**:オートメーションの許可を確認してください。ターミナルで `bash lib/now-playing.sh` を実行すると、取得できている情報を確認できます。
- **アートワークが表示されない**:ライブラリに追加していないストリーミング曲は、アートワークを取得できないことがあります。
- **ボタンが反応しない**:Übersicht の環境設定で「Interaction Shortcut」が設定されていないか確認してください。

## ライセンス

<!-- TODO: MIT など、ライセンスを決めて LICENSE ファイルを追加する -->
