class Question < ApplicationRecord
  has_many :answers, dependent: :destroy
  has_many :likes, dependent: :destroy
  has_many :bookmarks, dependent: :destroy
  belongs_to :user, optional: true
end
