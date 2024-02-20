class SurveyResponse < ApplicationRecord
  belongs_to :user
  belongs_to :survey
  validates :feedback, presence: true
end
