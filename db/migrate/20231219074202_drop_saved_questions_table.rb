class DropSavedQuestionsTable < ActiveRecord::Migration[6.1]
  def change
    drop_table :saved_questions do |t|
      t.integer :user_id, null: false
      t.integer :question_id, null: false
      t.timestamps
    end
  end
end
