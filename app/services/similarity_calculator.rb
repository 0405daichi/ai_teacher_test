# app/services/similarity_calculator.rb

class SimilarityCalculator
  def initialize
  end

  def similar_questions(input_question, questions, threshold = 0.5)
    @questions = questions
    input_question_vector = to_vector(input_question)
    similarities = @questions.map do |question|
      question_vector = to_vector(question.content)
      cosine_similarity(input_question_vector, question_vector)
    end

    # 類似度をログに出力
    puts "Similarities: #{similarities.inspect}"

    @questions.zip(similarities).select { |_, similarity| similarity >= threshold }.sort_by { |_, similarity| -similarity }
  end

  private

  def to_vector(text)
    words = extract_words(text)
    word_counts = words.each_with_object(Hash.new(0)) { |word, counts| counts[word] += 1 }
    vector = Hash.new(0)
    word_counts.each do |word, count|
      vector[word] = count
    end
    vector
  end
  
  def extract_words(text)
    # Bi-gramを使用
    words = []
    (0...(text.length - 1)).each do |i|
      words << text[i, 2]
    end
    words
  end

  def cosine_similarity(vector1, vector2)
    dot_product = dot(vector1, vector2)
    magnitude1 = Math.sqrt(dot(vector1, vector1))
    magnitude2 = Math.sqrt(dot(vector2, vector2))
  
    similarity = dot_product / (magnitude1 * magnitude2)
    puts "Similarity: #{similarity}"
    similarity
  end  

  def dot(vector1, vector2)
    vector1.keys.concat(vector2.keys).uniq.inject(0) do |sum, key|
      sum + vector1[key] * vector2[key]
    end
  end
end
