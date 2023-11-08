class Question < ApplicationRecord
  has_one :answer
  has_many :likes, dependent: :destroy
  has_many :saved_questions, dependent: :destroy
  belongs_to :user, optional: true
end
