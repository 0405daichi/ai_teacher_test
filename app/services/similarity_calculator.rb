# app/services/similarity_calculator.rb

class SimilarityCalculator
  def initialize
  end

  def similar_questions(input_question, questions, threshold = 0.1) # 閾値を0.1に変更
    @questions = questions
    all_documents = @questions.map(&:content) + [input_question]
    input_question_vector = tfidf_vector(input_question, all_documents)
    similarities = @questions.map do |question|
      # 完全一致の場合、類似度を1.0とする
      if input_question == question.content
        1.0
      else
        question_vector = tfidf_vector(question.content, all_documents)
        cosine_similarity(input_question_vector, question_vector)
      end
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

  def tfidf_vector(text, all_documents)
    tf_vector = to_vector(text)
    df = document_frequency(all_documents)
    tfidf = {}
    tf_vector.each do |word, tf|
      idf = Math.log(all_documents.size.to_f / (1 + df[word]))
      tfidf[word] = tf * idf
    end
    tfidf
  end

  def document_frequency(all_documents)
    df = Hash.new(0)
    all_documents.each do |document|
      words = extract_words(document).uniq
      words.each { |word| df[word] += 1 }
    end
    df
  end

  def cosine_similarity(vector1, vector2)
    dot_product = dot(vector1, vector2)
    magnitude1 = Math.sqrt(dot(vector1, vector1))
    magnitude2 = Math.sqrt(dot(vector2, vector2))
    
    # magnitude1 または magnitude2 が 0 の場合、similarity を 0 とする
    if magnitude1 == 0.0 || magnitude2 == 0.0
      return 0.0
    end
    
    similarity = dot_product / (magnitude1 * magnitude2)
    puts "Similarity: #{similarity}"
    similarity
  end
  
  

  def dot(vector1, vector2)
    vector1.keys.concat(vector2.keys).uniq.inject(0) do |sum, key|
      value1 = vector1[key] || 0
      value2 = vector2[key] || 0
      sum + value1 * value2
    end
  end
  
end
