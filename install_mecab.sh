#!/bin/bash

# MeCabのインストール
sudo apt-get update -y
sudo apt-get install -y mecab
sudo apt-get install -y libmecab-dev
sudo apt-get install -y mecab-ipadic-utf8

# 以下は環境によっては必要かもしれない追加の設定
# export CGO_CFLAGS_ALLOW='-Wno-error=.*'
# export CGO_CFLAGS='-Wno-error=.*'
