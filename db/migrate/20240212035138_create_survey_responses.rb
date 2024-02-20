class CreateSurveyResponses < ActiveRecord::Migration[6.1]
  def change
    create_table :survey_responses do |t|
      t.references :user, null: false, foreign_key: true
      t.references :survey, null: false, foreign_key: true
      t.datetime :answered_at

      t.timestamps
    end
  end
end
