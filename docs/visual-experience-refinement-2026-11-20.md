# 写真と景観ルートのデザイン監査（2026-11-20）

写真追加時のコミットは `08b6d7a`。Chromeでの変更前の撮影は、トップの見出し修正を含む `7e7d1d1` の本番で実施した。390×844と1280×900で、ファーストビュー・写真・先頭のカードを確認した。

| 画面 | 観察と対応 |
| --- | --- |
| トップ | 先に駅から探す検索欄と、景色から探す入口が見える。車窓の背景と見出しの配置を維持。 |
| 景観一覧 | スマホで最初の写真がほぼ画面外にあり、カードでは行き先の情報と季節が重複していた。上部を詰め、写真・見どころ・路線と区間・時期・詳細リンクの順に整理。イラスト表記を写真の外に出した。 |
| 富士山ガイド | 左右と座席記号、区間、予約への入口が写真より先に見える。 |
| 東海道新幹線 | 両方向の席回答を先頭に維持し、富士山の写真をその直後へ。 |
| 江ノ電 | 七里ヶ浜付近の風景が暗い座席カードと競合しない。左右と区間の回答から地図に移動できる。 |
| 嵯峨野 | スマホで両方向の回答を読んだ後も切符欄まで長かったため、見出し直下から地図・乗り方・切符に移動できるようにした。切符ボタンは既存の切符欄に置いた。 |
| 只見線 | 方向ごとに5つの区間があり、スマホでは写真までの距離が長い。各区間の回答を維持し、その直後に写真を配置した。 |
| 釧網本線 | 北浜駅から撮影した旧車両と流氷を掲載。2009年の旧「流氷ノロッコ号」であることを一覧・詳細の両方のキャプションに明記。 |
| 黒部峡谷 | 縦長の元写真でも横長カードで橋と列車が見える。座席の左右と運行時期の注意を記載したまま、谷の写真までの距離を短縮。 |
| 富士急行線 | 河口湖の実写は行き先の風景。宿泊ページでも同じ地域の説明として1回使用。洋室や車窓からの眺望として扱わない。 |
| 富士山ビューの宿 | 河口湖のヒーローは先読みを維持し、画面幅に応じた画像寸法を指定。ホテルカードは文字主体を維持。 |

一覧では `data/scenic-overview.json` の路線・区間・一言回答と `data/scenic-discovery.json` の景観時期を使用。絞り込み時に対応する見頃がある場合は、その時期をカードの時期欄に表示する。運行の注意は別の行に残した。狭い画面に合わせた写真の切り抜きでは、列車・川・橋や山の主題をスマホとPCで確認した。14路線の公開条件やフィルターの判定は従来どおり。

## 写真7点の出典と確認

元画像の撮影記録、説明、許諾表示を、前回の[写真監査](visual-photography-pass-2026-11-20.md)、配信ファイル、alt、一覧と詳細のキャプションと照合した。WebP化・リサイズ済みの7配信原本は前回のものと同一で、カードや詳細の横長の枠では表示時にトリミングする。CC BY-SA のWebPは各元画像と同じバージョンで提供する。旧バージョンで必要な元作品名は、表示される出典リンクに含めた。[CC BY-SA 2.0 Generic](https://creativecommons.org/licenses/by-sa/2.0/legalcode.en)・[CC BY-SA 3.0 Unported](https://creativecommons.org/licenses/by-sa/3.0/legalcode.en)・[CC BY-SA 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/legalcode.en)

| 写真 | 撮影者・日付・撮影地点 | ライセンス | 配信原本 |
| --- | --- | --- | --- |
| 新富士 | jessedyck、2018-04-10、新富士付近の東海道新幹線車内 | CC0 1.0 | 1600×1067、120 KB。[元画像の記録](https://commons.wikimedia.org/wiki/File:View_of_Mount_Fuji_from_Tokaido_Shinkansen_2018-04-10.jpg) |
| 江ノ電 | Kirin7739、2024-04-20、七里ヶ浜〜稲村ヶ崎の線路脇 | CC BY 4.0 International | 1600×1112、142 KB。[元画像の記録](https://commons.wikimedia.org/wiki/File:Enoden_Type_10_with_Shonan_Sea_and_Mt.Fuji.jpg) |
| 嵯峨野 | pang yu liu、2016-08-26、嵯峨野観光鉄道の車内、保津峡 | CC BY-SA 2.0 Generic | 1280×854、256 KB。[元画像の記録](https://commons.wikimedia.org/wiki/File:Hozukyo_Station_seen_from_Sagano_Scenic_Railway_train_2016-08-26.jpg) |
| 河口湖 | lumoplank、2025-11-12、河口湖畔 | CC0 1.0 | 1600×1125、127 KB。[元画像の記録](https://commons.wikimedia.org/wiki/File:Kawaguchiko%2C_Part_III_-_Kawaguchiko6782.jpg) |
| 只見線 | MaedaAkihiko、2019-10-30、福島県三島町の第一只見川橋梁を望む地点 | CC BY-SA 4.0 International | 1280×853、272 KB。[元画像の記録](https://commons.wikimedia.org/wiki/File:Tadami-Line-First-Bridge-Autumn.jpg) |
| 釧網本線 | 欅（Keyaki）、2009-02-23、北浜駅展望台 | CC BY-SA 3.0 Unported | 1600×1200、79 KB。[元画像の記録](https://commons.wikimedia.org/wiki/File:Ryuhyo_norokko_in_Kitahama_station.jpg) |
| 黒部峡谷 | tsuda、2005-05-31、宇奈月の新山彦橋を見下ろす地点 | CC BY-SA 2.0 Generic | 1120×1493、276 KB。[元画像の記録](https://commons.wikimedia.org/wiki/File:Kurobe_Gorge_Railway1.jpg) |

ホテルの掲載許諾は未取得。公式連絡先、画像に必要な条件、日英の未送信文面は[宿泊写真の掲載許諾の依頼案](fuji-view-photo-permission-requests.md)に記録した。
