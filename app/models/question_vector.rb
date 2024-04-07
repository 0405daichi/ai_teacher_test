class QuestionVector < ApplicationRecord
  belongs_to :question

  # コサイン類似度を計算するクラスメソッド
  def self.cosine_similarity(vector_a, vector_b)
    dot_product = vector_a.zip(vector_b).map { |a, b| a * b }.sum
    magnitude_a = Math.sqrt(vector_a.map { |a| a**2 }.sum)
    magnitude_b = Math.sqrt(vector_b.map { |b| b**2 }.sum)
    dot_product / (magnitude_a * magnitude_b)
  end

  # 引数のベクトルとデータベース内のベクトルとの間で類似性があるかをチェック
  def self.similar_to?(input_vector, threshold: 0.95)
    QuestionVector.all.each do |q_vector|
      if cosine_similarity(input_vector, q_vector.vector_data) >= threshold
        return q_vector.question # 類似質問のQuestionオブジェクトを返す
      end
    end
    nil # 類似質問がない場合はnilを返す
  end
end
