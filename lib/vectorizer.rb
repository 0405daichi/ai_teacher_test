# lib/vectorizer.rb
require 'open3'

module Vectorizer
  def self.vectorize_text_with_python(text)
    script_path = Rails.root.join('lib', 'scripts', 'vectorize_text.py')
    stdout, stderr, status = Open3.capture3("python3 #{script_path}", stdin_data: text)

    if status.success?
      stdout.strip.split.map(&:to_f)
    else
      Rails.logger.error("Vectorization error: #{stderr}")
      Array.new(384, 0)  # Sentence-BERT の出力サイズに合わせて調整
    end
  end
end
