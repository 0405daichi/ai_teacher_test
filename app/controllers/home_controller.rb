class HomeController < ApplicationController
  def index
    @all_cards = Question.all.includes(:answers)
    if current_user
      @user_questions = current_user.questions
      @user_likes = current_user.liked_questions
      @user_likes.each do |single|
        puts "#{single.content}"
      end
      @user_bookmarks = current_user.bookmarked_questions
      @user_bookmarks.each do |single|
        puts "#{single.content}"
      end
      
    end
  end
end
