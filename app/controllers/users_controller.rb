class UsersController < ApplicationController
  before_action :authenticate_user!
  
  def show
    @user = User.find(params[:id])
  end

  def likes
    @user = User.find(params[:id])
    @likes = @user.liked_questions
    render template: "likes/show"
  end
end
