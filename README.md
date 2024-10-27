# Task_Yell

[![IMAGE ALT TEXT HERE](https://jphacks.com/wp-content/uploads/2024/07/JPHACKS2024_ogp.jpg)](https://www.youtube.com/watch?v=DZXUkEj-CSI)

## スケジュール管理×Tech
『タスクに取り組むみなさんにエールを』
やりたいこと、すべきことの全てを管理するプロダクト。さらに、絶対に忘れられない予定やタスクを、忘れることが難しいほどに。

### 背景(製品開発のきっかけ、課題等）
「予定をカレンダーに入れ忘れてた!」　「予定をダブルブッキングしちゃった!」　「したいことがあったのにタスクをしていたら時間がなくなっていた!」　こんなことってよくありますよね？

私たちは、そんなユーザーの wanTODO(したいこと)、TODO(すべきこと) をどちらも大切であると考え、それらを管理することができるプロダクトを作成した。

なお、プロダクト名である『Task_Yell』は、《タスクの実行を応援する》、《スケジュール管理を助ける》の２つの意味を組み合わせ、「したいこともすべきことも、どちらもやってしまおう」という意味が込められている。

### 製品説明（具体的な製品の説明）
wanTODO は、日常で思いついた時にメモを残しておくことで、予定やタスクの少ない日にそれをすることができる。また、TODO は予定が決まった段階でカレンダーに直接書き込み、予定の日が近くなったらそれを通知する。

それぞれの予定やタスクには、重要度を設定することができる。重要度が高い予定やタスクを設定している日はカレンダー上で特徴的な動きをするので、目が離せなく、また記憶に残りやすいといった効果がある。

さらに、重要度によって、ユーザーへの通知の仕方も工夫した。重要度が低い予定やタスクは、低頻度のデスクトップ通知を行う。重要度が高くなるにつれて、通知の頻度が高くなっていく。重要度が最高レベルのものには、スマートフォンへ電話をかけることで、無視できない通知をすることにした。

### 特長
#### 1. 直感的なUI
あらかじめメモしておいた wanTODO をカレンダーに入力する時、そのメモを指定の日にドラッグ&ドロップすることでそれをアタッチすることができる。

#### 2. チームメンバーや友だちとの予定の共有が可能
予定やタスクの中には、チームメンバーや友だちと一緒に行うものが存在する。そのような時は、予定やタスクを設定する際にその人たちへ招待を送ることができる。

#### 3. マージエディター
スケジュールを管理していると、間違えて他の予定と重ねて新規予定を追加してしまったり、他のユーザーからの招待を承認した際に他の予定と被ってしまって困ることがある。それを解消する機能がマージエディターである。マージエディターでは直感的に予定を整理し、予定のコンフリクトを簡単に解消することができる。

### 解決出来ること
ユーザーは、いつも通りカレンダーで 予定やタスクを管理しながら日常的に wantTODOを溜めておくことで、無意識的に、より意識的なスケジュールを組むことができる。これにより、予定を忘れてしまうことを防ぎ、したいことをする時間を確保することができる。また、マージエディタにより、予定のダブルブッキングや、過剰なタスクの割り当てを回避し、より現実的なスケジュールを組むことができる。

### 今後の展望
今回、バックエンド側に余裕ができたため、新たにOpenAI API を活用し、今後の予定に関する簡単なクイズ機能を実装しようとしていたが、時間の制限があり、Hack Day内で実装することができなかった。
今後、Award Dayに向けてこの機能を実装していきたい。

### 注力したこと（こだわり等）
* スタイリッシュでモダンなUI
* 今までにない斬新な機能　wanTODO

## 開発技術
### 活用した技術
* Firebase
* OAuth
* Versel
* GitHubActions
  
#### API・データ
* Google Calendar API
* 

#### フレームワーク・ライブラリ・モジュール
* Next.js
* Tailwind CSS

#### デバイス
* PC
* 

### 独自技術
#### ハッカソンで開発した独自機能・技術
* 独自で開発したものの内容をこちらに記載してください
* 特に力を入れた部分をファイルリンク、またはcommit_idを記載してください。
