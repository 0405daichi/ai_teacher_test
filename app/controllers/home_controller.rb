class HomeController < ApplicationController
  def index
    @all_cards = Question.all.order(id: "DESC").includes(:answers)
    if current_user
      @user_questions = current_user.questions.order(id: "DESC")
      @user_likes = current_user.liked_questions.includes(:likes).order('likes.created_at DESC')
      @user_likes.each do |single|
        puts "#{single.content}"
      end
      @user_bookmarks = current_user.bookmarked_questions.includes(:bookmarks).order('bookmarks.created_at DESC')
      @user_bookmarks.each do |single|
        puts "#{single.content}"
      end
    end

    @announcements = Announcement.all
  end

  def refresh_card
    @user_card_least = Question.where(user_id: params[:id]).order(created_at: :desc).first

    respond_to do |format|
      format.js
    end
  end
end
