class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
 
  has_many :likes, dependent: :destroy
  has_many :liked_questions, through: :likes, source: :question
  has_many :saved_questions, dependent: :destroy
end
