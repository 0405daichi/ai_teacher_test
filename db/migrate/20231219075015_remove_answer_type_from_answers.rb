class RemoveAnswerTypeFromAnswers < ActiveRecord::Migration[6.1]
  def change
    remove_column :answers, :answer_type, :integer
  end
end
