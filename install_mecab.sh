#!/bin/bash

# インストール先のディレクトリ
INSTALL_DIR="$HOME/mecab"

# ディレクトリ作成
mkdir -p $INSTALL_DIR

# ソースコードをダウンロード
wget -O mecab-0.996.tar.gz 'https://drive.google.com/u/0/uc?id=0B4y35FiV1wh7cENtOXlicTFaRUE&export=download'

# 解凍
tar zxfv mecab-0.996.tar.gz
cd mecab-0.996

# インストール
./configure --prefix=$INSTALL_DIR --enable-utf8-only
make
make install

# 環境変数設定
echo "export PATH=$INSTALL_DIR/bin:$PATH" >> ~/.bashrc
echo "export LD_LIBRARY_PATH=$INSTALL_DIR/lib:$LD_LIBRARY_PATH" >> ~/.bashrc

# シェルを再起動（または新しいシェルを開く）
source ~/.bashrc
