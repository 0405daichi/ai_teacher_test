class Question < ApplicationRecord
  has_many :answers, dependent: :destroy
  has_many :likes, dependent: :destroy
  has_many :bookmarks, dependent: :destroy
  belongs_to :user, optional: true
  has_one_attached :image # 画像の関連付け
  attribute :has_image, :boolean, default: false # 画像の有無フラグ
  validates :content, presence: true  # 内容が必須

  # 'いいね'と'ブックマーク'の合計数でソートするクラスメソッド
  def self.sorted_by_likes_and_bookmarks
    left_joins(:likes, :bookmarks)
      .group(:id)
      .select('questions.*, COUNT(likes.id) + COUNT(bookmarks.id) AS total_likes_and_bookmarks')
      .order('total_likes_and_bookmarks DESC')
  end
end
