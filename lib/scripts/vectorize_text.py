# lib/scripts/vectorize_text.py
from sentence_transformers import SentenceTransformer
import sys

# Python スクリプトでのベクトル生成部分の修正例
def vectorize_text(text):
    model = SentenceTransformer('all-MiniLM-L6-v2')  # 軽量で高性能なモデル
    vector = model.encode(text)
    # None 値を 0.0 で置換
    vector = [0.0 if v is None else v for v in vector]
    return ' '.join(map(str, vector))

if __name__ == '__main__':
    input_text = sys.stdin.read().strip()
    vector = vectorize_text(input_text)
    print(vector)
