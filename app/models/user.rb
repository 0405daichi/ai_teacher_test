class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
 
  has_many :likes, dependent: :destroy
  has_many :liked_questions, through: :likes, source: :question
  has_many :bookmarks, dependent: :destroy
  has_many :bookmarked_questions, through: :bookmarks, source: :question
  has_many :questions

  has_many :survey_responses
  has_many :surveys, through: :survey_response

  devise :omniauthable, omniauth_providers: [:google_oauth2]

  # 管理者かどうかを返すメソッド（オプション）
  def admin?
    admin
  end

  def self.from_omniauth(access_token)
    data = access_token.info
    user = User.where(email: data['email']).first
  
    unless user
      user = User.create(email: data['email'],
                         password: Devise.friendly_token[0, 20])
    end
    user
  end  
end
