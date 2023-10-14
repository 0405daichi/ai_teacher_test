class HomeController < ApplicationController
  def index
    if current_user
      @user = current_user
      @user_questions = @user.questions
      @user_likes = @user.liked_questions
      @user_bookmarks = @user.bookmarked_questions
    end
  end
end
