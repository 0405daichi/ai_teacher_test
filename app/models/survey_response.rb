class SurveyResponse < ApplicationRecord
  belongs_to :user
  belongs_to :survey
  validates :feedback, presence: true
  validates :user_id, presence: true
  validates :survey_id, presence: true
  validates :answered_at, presence: true
  validates :user_id, uniqueness: { scope: :survey_id }
end
