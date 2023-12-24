class AddAnswerTypeToAnswers < ActiveRecord::Migration[6.1]
  def change
    add_column :answers, :answer_type, :integer
  end
end
