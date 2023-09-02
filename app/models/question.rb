class Question < ApplicationRecord
  has_one :answer
  has_many :likes, dependent: :destroy
  has_many :saved_questions, dependent: :destroy
end
