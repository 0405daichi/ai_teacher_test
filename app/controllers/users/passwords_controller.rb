# app/controllers/users/passwords_controller.rb

class Users::PasswordsController < Devise::PasswordsController
  protected

  # パスワード再設定後にユーザーをログインページにリダイレクトさせる
  def after_resetting_password_path_for(resource)
    new_user_session_path
  end
end
