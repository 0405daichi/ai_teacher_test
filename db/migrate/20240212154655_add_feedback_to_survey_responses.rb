class AddFeedbackToSurveyResponses < ActiveRecord::Migration[6.1]
  def change
    add_column :survey_responses, :feedback, :text
  end
end
