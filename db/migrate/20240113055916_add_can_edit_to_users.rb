class AddCanEditToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :can_edit, :boolean
  end
end
