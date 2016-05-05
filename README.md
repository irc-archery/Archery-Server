# アーチェリーリアルタイム対戦システム 「Args（アーグス）」

## システム概要  
　このシステムはスマートフォンなどの携帯端末を使用して、離れたところでもリアルタイムでアーチェリーの試合が行えるシステムです。  
得点表に得点を入力して管理することや試合の作成、過去の対戦データや個人のデータの管理なども行えるようになっています。   



## システムの機能   
　**離れたところでもリアルタイムでアーチェリーの試合ができる**ことを実現するために私たちは次のような機能を実装しました。得点表を電子データとして管理し、スマートフォンなどの端末で得点を入力することにより、同じ得点表を見ているユーザーに情報が__リアルタイム※1__で反映される機能(※1 ブラウザの更新ボタンを押すことなく自動的に更新されます。)やアカウントを作成することで、過去の得点を管理し、グラフとして視覚的にわかりやすく確認できる機能です。  


## システムの利用  
　このシステムを利用するためには、Nodejsを使用したWeb Serverを構築する必要があります。クライアントとして、ブラウザからの利用できるWebクライアントのほか、Android用 ネイティブアプリ([https://github.com/irc-archery/Args-for-Android](https://github.com/irc-archery/Args-for-Android))、iOS用ネイティブアプリ([https://github.com/irc-archery/Args-For-iOS](https://github.com/irc-archery/Args-For-iOS))も別途制作してあります。ウェブサーバーの構築手順については、このリポジトリのWiki([https://github.com/irc-archery/Archery-Server/wiki](https://github.com/irc-archery/Archery-Server/wiki))をご覧ください。


## Authors  
宮城県工業高等学校 [情報研究部](http://www.irc.hira-tech.net) プロジェクトチーム Args  


## Licence  
MIT  