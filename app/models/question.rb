class Question < ApplicationRecord
  has_many :answers, dependent: :destroy
  has_many :likes, dependent: :destroy
  has_many :bookmarks, dependent: :destroy
  belongs_to :user, optional: true
  has_one_attached :image # 画像の関連付け
  attribute :has_image, :boolean, default: false # 画像の有無フラグ
end
