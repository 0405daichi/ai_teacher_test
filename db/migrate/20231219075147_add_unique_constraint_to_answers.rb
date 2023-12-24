class AddUniqueConstraintToAnswers < ActiveRecord::Migration[6.1]
  def change
    add_index :answers, [:question_id, :answer_type], unique: true
  end
end
