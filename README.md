# Task_yell

[![スクリーンショット 2024-10-28 0 30 29](https://github.com/user-attachments/assets/0a37709a-d6dc-45e0-8ac5-0afc978d50b0)](https://youtu.be/_gJM7ewP9pg)

## スケジュール管理 ×Tech

『タスクに取り組むみなさんにエールを』
やりたいこと、すべきことの全てを管理するプロダクト。さらに、絶対に忘れられない予定やタスクを、忘れることが難しいほどに。

### 背景(製品開発のきっかけ、課題等）

「予定をカレンダーに入れ忘れてた!」　「予定をダブルブッキングしちゃった!」　「したいことがあったのにタスクをしていたら時間がなくなっていた!」　こんなことってよくありますよね？

私たちは、そんなユーザーの wanTODO(したいこと)、TODO(すべきこと) をどちらも大切であると考え、それらを管理することができるプロダクトを作成した。

なお、プロダクト名である『Task_yell』は、《タスクの実行を応援する》、《スケジュール管理を助ける》の２つの意味を組み合わせ、「したいこともすべきことも、どちらもやってしまおう」という意味が込められている。

### 製品説明（具体的な製品の説明）

#### 使用方法　

- 右の画面から、**wanTODO**を作成できる。

  wanTODO とは日常で思いついたことをメモとして残しておくことでき、予定やタスクの少ない日にカレンダーに設定することができる特徴をもつ。
  wanTODO は簡単に予定やタスクとして確定でき、日付が近くなると通知される。

- また通常のカレンダー同様に日付から予定やタスクを決めることもでき、タスクか予定を切り替えることによってタスクは開始時刻や場所などを入れずに管理できる。

- それぞれの予定やタスクには、重要度を設定することができる。重要度が高い予定は通知の頻度が高くなるなどより忘れないようになっている。
- その他 AI による wanTODO の細分化や電話を用いた通知など様々な便利機能がある

<!--さらに、重要度によって、ユーザーへの通知の仕方も工夫した。重要度が低い予定やタスクは、低頻度のデスクトップ通知を行う。重要度が高くなるにつれて、通知の頻度が高くなっていく。重要度が最高レベルのものには、スマートフォンへ電話をかけることで、無視できない通知をすることにした。-->

#### リンク類
動画(YouTube)でのプロダクト紹介は[こちら](https://youtu.be/u_iBS8K2s6s)から

より詳しい使い方等はこちらの[スライド動画](https://www.canva.com/design/DAGUu4UAsF0/IUgaJr0LKjhkuwHdAF52Qw/watch?utm_content=DAGUu4UAsF0&utm_campaign=designshare&utm_medium=link&utm_source=editor)から

実際の使用感はこちらの[デプロイ先](https://taskyell.vercel.app/)から

<img src="https://github.com/user-attachments/assets/c0b244e6-fa96-48f0-a46d-b27eddfc2b23" width="200" height="200">

### 特長

#### 1. 直感的な UI

あらかじめメモしておいた wanTODO をカレンダーに入力する時、そのメモを指定の日にドラッグ&ドロップすることでそれをアタッチすることができる。

#### 2. チームメンバーや友だちとの予定の共有が可能

予定やタスクの中には、チームメンバーや友だちと一緒に行うものが存在する。そのような時は、予定やタスクを設定する際にその人たちへ招待を送ることができる。

#### 3. 独特な通知

大切な予定やタスクの通知を行う際、ブラウザからのプッシュ通知、もしくは電話での通知を受け取ることができる。これらの設定は、ユーザにより変更可能である。

#### 4. OpenAI を用いたやりたいことの細分化

wanTODO に追加した内容を細分化する機能を作成した。この機能は OpenAI の API を用いて実装している。

### 解決出来ること

ユーザーは、いつも通りカレンダーで 予定やタスクを管理しながら日常的に wanTODO を溜めておくことで、無意識的に、より意識的なスケジュールを組むことができる。これにより、予定を忘れてしまうことを防ぎ、やりたいことをする時間を確保することができる。また、マージエディタにより、予定のダブルブッキングや、過剰なタスクの割り当てを回避し、より現実的なスケジュールを組むことができる。

### 今後の展望

今回、マージエディタを実装することができなかったため、今後マージエディタを実装し、予定の管理をより便利にしていきたい。また、今回の Hack Day ではウェブアプリでの実装となったため、これからの開発でモバイルアプリを実装していきたい。また、Google でサインインをする際に暗号化を行っていないため、暗号化を行いセキュリティ強化を図りたい。

### 注力したこと（こだわり等）

- スタイリッシュでモダンな UI
- 今までにない斬新な機能　 wanTODO

## 開発技術
<img width="900" alt="スクリーンショット 2024-10-29 14 08 24" src="https://github.com/user-attachments/assets/ed009666-96b0-4eec-9cfd-0da843be83dd">

### 活用した技術

- Firebase
- OAuth
- Vercel
- GitHubActions

#### API・データ

- Google Calendar API
- OpenAI API

#### フレームワーク・ライブラリ・モジュール

- Next.js
- Tailwind CSS

#### デバイス

- ブラウザ

### 独自技術

#### ハッカソンで開発した独自機能・技術

- 電話番号通知(commit_id:43749826e43d176eff216e24a9a8f19c55d4f3d3)
- OpenAI を用いたタスクの分割機能(commit_id:05513d6517cb716ab1f00f28004123b8398ae574)
