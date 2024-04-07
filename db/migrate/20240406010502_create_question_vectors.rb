class CreateQuestionVectors < ActiveRecord::Migration[6.1]
  def change
    create_table :question_vectors do |t|
      t.integer :question_id
      t.column :vector_data, :decimal, array: true, default: []
      t.timestamps
    end
    add_index :question_vectors, :question_id
  end
end
