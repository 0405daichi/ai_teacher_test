class CreateSavedQuestions < ActiveRecord::Migration[6.1]
  def change
    create_table :saved_questions do |t|
      t.references :user, null: false, foreign_key: true
      t.references :question, null: false, foreign_key: true

      t.timestamps
    end
  end
end
