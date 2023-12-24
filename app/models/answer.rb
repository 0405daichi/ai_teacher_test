class Answer < ApplicationRecord
  belongs_to :question
  validates :content, presence: true
  validates :answer_type, uniqueness: { scope: :question_id }, inclusion: { in: [1, 2, 3] }  # 例えば 1:通常の回答, 2:例え話, 3:簡単な説明
end
