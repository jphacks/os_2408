# Task_yell

[![IMAGE ALT TEXT HERE](https://jphacks.com/wp-content/uploads/2024/07/JPHACKS2024_ogp.jpg)](https://www.youtube.com/watch?v=DZXUkEj-CSI)

## スケジュール管理×Tech
『タスクに取り組むみなさんにエールを』
やりたいこと、すべきことの全てを管理するプロダクト。さらに、絶対に忘れられない予定やタスクを、忘れることが難しいほどに。

### 背景(製品開発のきっかけ、課題等）
「予定をカレンダーに入れ忘れてた!」　「予定をダブルブッキングしちゃった!」　「したいことがあったのにタスクをしていたら時間がなくなっていた!」　こんなことってよくありますよね？

私たちは、そんなユーザーの wanTODO(したいこと)、TODO(すべきこと) をどちらも大切であると考え、それらを管理することができるプロダクトを作成した。

なお、プロダクト名である『Task_yell』は、《タスクの実行を応援する》、《スケジュール管理を助ける》の２つの意味を組み合わせ、「したいこともすべきことも、どちらもやってしまおう」という意味が込められている。

### 製品説明（具体的な製品の説明）
wanTODO は、日常で思いついた時にメモを残しておくことで、予定やタスクの少ない日にそれをすることができる。また、TODO は予定が決まった段階でカレンダーに直接書き込み、予定の日が近くなったらそれを通知する。

それぞれの予定やタスクには、重要度を設定することができる。重要度が高い予定やタスクを設定している日はカレンダー上で特徴的な動きをするので、目が離せなく、また記憶に残りやすいといった効果がある。

<!--さらに、重要度によって、ユーザーへの通知の仕方も工夫した。重要度が低い予定やタスクは、低頻度のデスクトップ通知を行う。重要度が高くなるにつれて、通知の頻度が高くなっていく。重要度が最高レベルのものには、スマートフォンへ電話をかけることで、無視できない通知をすることにした。-->

また、この作品は Vercel にてデプロイを行った。

### 特長
#### 1. 直感的なUI
あらかじめメモしておいた wanTODO をカレンダーに入力する時、そのメモを指定の日にドラッグ&ドロップすることでそれをアタッチすることができる。

#### 2. チームメンバーや友だちとの予定の共有が可能
予定やタスクの中には、チームメンバーや友だちと一緒に行うものが存在する。そのような時は、予定やタスクを設定する際にその人たちへ招待を送ることができる。

#### 3. 独特な通知
大切な予定やタスクの通知を行う際、ブラウザからのプッシュ通知、もしくは電話での通知を受け取ることができる。これらの設定は、ユーザにより変更可能である。

### 解決出来ること
ユーザーは、いつも通りカレンダーで 予定やタスクを管理しながら日常的に wantTODO を溜めておくことで、無意識的に、より意識的なスケジュールを組むことができる。これにより、予定を忘れてしまうことを防ぎ、したいことをする時間を確保することができる。また、マージエディタにより、予定のダブルブッキングや、過剰なタスクの割り当てを回避し、より現実的なスケジュールを組むことができる。

### 今後の展望
今回、当初の理想以上の作品を作ることができた。今回のHack Dayではウェブアプリでの実装となったため、これからの開発でモバイルアプリを実装していきたい。また、Googleでサインインをする際に暗号化を行っていないため、暗号化を行いセキュリティ強化を図りたい。

### 注力したこと（こだわり等）
* スタイリッシュでモダンなUI
* 今までにない斬新な機能　wanTODO

## 開発技術
### 活用した技術
* Firebase
* OAuth
* Vercel
* GitHubActions
  
#### API・データ
* Google Calendar API
* OpenAI API
  

#### フレームワーク・ライブラリ・モジュール
* Next.js
* Tailwind CSS

#### デバイス
* ブラウザ
  

### 独自技術
#### ハッカソンで開発した独自機能・技術
* 独自で開発したものの内容をこちらに記載してください
* 特に力を入れた部分をファイルリンク、またはcommit_idを記載してください。
