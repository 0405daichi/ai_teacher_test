# db/migrate/[timestamp]_change_vector_data_type_to_float.rb
class ChangeVectorDataTypeToFloat < ActiveRecord::Migration[6.1]
  def change
    change_column :question_vectors, :vector_data, :float, array: true, default: [], using: 'vector_data::float[]'
  end
end
