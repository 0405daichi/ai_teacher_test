# lib/vectorizer.rb
require 'open3'

module Vectorizer
  def self.vectorize_text_with_python(text)
    script_path = Rails.root.join('lib', 'scripts', 'vectorize_text.py')
    stdout, stderr, status = Open3.capture3("python3 #{script_path}", stdin_data: text)

    if status.success?
      stdout.strip.split.map(&:to_f)
    else
      # エラーが発生した場合の特定可能な「ありえない値」
      Array.new(50, -1.0)
    end
  end
end
