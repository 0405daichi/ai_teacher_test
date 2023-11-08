class HomeController < ApplicationController
  def index
    @all_cards = Question.all.includes(:answer)
    if current_user
      @user = current_user
      @user_questions = @user.questions
      @user_likes = @user.liked_questions
      @user_bookmarks = @user.saved_questions
    end
  end
end
