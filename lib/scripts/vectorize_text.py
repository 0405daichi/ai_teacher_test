# lib/scripts/vectorize_text.py
import sys
from sklearn.feature_extraction.text import TfidfVectorizer

def vectorize_texts(texts):
    # TF-IDFベクトル化器の初期化
    vectorizer = TfidfVectorizer()
    
    # テキストのリストをベクトル化
    tfidf_matrix = vectorizer.fit_transform(texts)
    
    # 最初のドキュメントのベクトルを取得
    # toarray() は密行列に変換し、[0] は最初のドキュメントを指定
    first_document_vector = tfidf_matrix.toarray()[0]
    
    # ベクトルを文字列に変換して返す
    return ' '.join(map(str, first_document_vector))

if __name__ == '__main__':
    # 標準入力から複数のテキストを読み込む（EOFまで）
    input_texts = sys.stdin.read().strip().split('\n')
    
    # テキストをベクトル化して出力
    vector = vectorize_texts(input_texts)
    print(vector)
