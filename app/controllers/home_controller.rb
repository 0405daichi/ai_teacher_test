class HomeController < ApplicationController
  def index
    # Questionモデルから最新の10件のレコードを取得し、関連するanswersもプリロード
    @all_cards = Question.sorted_by_likes_and_bookmarks.includes(:answers).limit(10)

    if current_user
      # 各コレクションから最大10個のレコードを取得
      @user_questions = current_user.questions.order(id: "DESC").limit(10)
      @user_likes = current_user.liked_questions.includes(:likes).order('likes.created_at DESC').limit(10)
      @user_likes.each do |single|
        puts "#{single.content}"
      end
      @user_bookmarks = current_user.bookmarked_questions.includes(:bookmarks).order('bookmarks.created_at DESC').limit(10)
      @user_bookmarks.each do |single|
        puts "#{single.content}"
      end
    else
      @user_questions = ""
      @user_likes = ""
      @user_bookmarks = ""
    end
  
    @announcements = Announcement.all
  end  

  def refresh_card
    @user_card_least = Question.where(user_id: params[:id]).order(created_at: :desc).first

    respond_to do |format|
      format.js
    end
  end

  def refresh_all_cards
    existing_cards_count = params[:existing_cards_count].to_i
    remaining_count = 10 - existing_cards_count

    if remaining_count > 0
      @all_cards = Question.sorted_by_likes_and_bookmarks.includes(:answers).limit(remaining_count)
    else
      @all_cards = []
    end

    respond_to do |format|
      format.js
    end
  end

  def add_more_cards
    @category = params[:category]
    existing_cards_count = params[:existing_cards_count].to_i

    case @category
    when 'all'
      @cards = Question.sorted_by_likes_and_bookmarks.includes(:answers).offset(existing_cards_count).limit(10)
    when 'user-cards'
      @cards = current_user.questions.order(id: "DESC").offset(existing_cards_count).limit(10)
    when 'user-liked'
      @cards = current_user.liked_questions.includes(:likes).order('likes.created_at DESC').offset(existing_cards_count).limit(10)
    when 'user-bookmarked'
      @cards = current_user.bookmarked_questions.includes(:bookmarks).order('bookmarks.created_at DESC').offset(existing_cards_count).limit(10)
    else
      @cards = []
    end
    puts "aaaaaaaaaa#{@cards.present?}"

    respond_to do |format|
      format.js
    end
  end
end
