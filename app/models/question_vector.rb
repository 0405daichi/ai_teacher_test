require 'logger'

class QuestionVector < ApplicationRecord
  belongs_to :question

  # コサイン類似度を計算するクラスメソッド
  def self.cosine_similarity(vector_a, vector_b)
    vector_a = vector_a.map { |a| a.nil? ? 0.0 : a.to_f }
    vector_b = vector_b.map { |b| b.nil? ? 0.0 : b.to_f }
    dot_product = vector_a.zip(vector_b).map { |a, b| a * b }.sum
    magnitude_a = Math.sqrt(vector_a.map { |a| a**2 }.sum)
    magnitude_b = Math.sqrt(vector_b.map { |b| b**2 }.sum)
    dot_product / (magnitude_a * magnitude_b)
  end  

  # 引数のベクトルとデータベース内のベクトルとの間で類似性があるかをチェック
  def self.similar_to?(input_vector, threshold: 0.95)
    logger = Logger.new('custom30.log')
    begin
      QuestionVector.includes(:question).find_each do |q_vector|
        begin
          similarity = cosine_similarity(input_vector, q_vector.vector_data)
          logger.info("質問ID #{q_vector.question_id} とのコサイン類似度: #{similarity}")
  
          if similarity >= threshold && q_vector.question.present?
            return q_vector.question
          end
        rescue StandardError => e
          logger.error("質問ID #{q_vector.question_id} でエラーが発生しました: #{e.message}")
          logger.error("入力ベクトル: #{input_vector}")
          logger.error("データベースベクトル: #{q_vector.vector_data}")
        end
      end
    rescue => e
      logger.error("An error occurred: #{e.message}")
    end
    nil
  end  
end
