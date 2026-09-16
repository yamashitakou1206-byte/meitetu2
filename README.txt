MEITETSU Operation Web v2.0
===========================

GitHub Pages向けの静的Webアプリです。
index.html / style.css / app.js / manifest.webmanifest / sw.js / icon.svg を同じ階層にアップロードしてください。

主な機能
- 路線選択、駅選択、上り/下り、列車種別
- 複数路線のサンプル駅データ
- 列車番号・種別・両数・行先表示
- 現在時刻、アナログ/デジタル時計
- 現在位置・次駅のシミュレーション
- 路線図風の走行位置表示
- 停車駅時刻表と現在位置連動
- 次列車表示
- 運行情報パネルと遅延デモ
- ダークモード、ズーム、秒表示、自動更新
- PWA manifest / Service Worker（対応ブラウザでホーム画面追加・キャッシュ）
- 名鉄公式運行情報へのリンク

重要
この版の時刻・走行位置・運行情報はデモ用です。名鉄のリアルタイムデータを自動取得するものではありません。
実運行の確認には名鉄公式運行情報を使用してください。

GitHub Pages
1. ファイルをリポジトリ直下にアップロード
2. Settings > Pages
3. Build and deployment > Source: Deploy from a branch
4. Branch: main / Folder: /(root)
5. Save

GitHub Pagesは静的ファイルを公開する仕組みなので、この構成だけで動作します。
