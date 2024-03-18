class CreateApiLimits < ActiveRecord::Migration[6.1]
  def change
    create_table :api_limits do |t|
      t.boolean :is_limited, default: false, null: false

      t.timestamps
    end
  end
end
