# app/controllers/bookmarks_controller.rb
class BookmarksController < ApplicationController
  before_action :authenticate_user!

  def create
    @question = Question.find(params[:id])
    bookmark = @question.bookmarks.new(user: current_user)
    bookmark.save

    # respond_to do |format|
    #   if save.save
    #     format.js # JavaScript形式での応答
    #     format.json { render json: { status: 'success', save_id: save.id, save_count: question.bookmarks.count } }
    #   else
    #     format.js # JavaScript形式での応答
    #     format.json { render json: { status: 'error', message: save.errors.full_messages }, status: :unprocessable_entity }
    #   end
    # end
  end

  def destroy
    @question = Question.find(params[:id])
    bookmark = @question.bookmarks.find_by(user: current_user)
    bookmark.destroy

    # respond_to do |format|
    #   if save.destroy
    #     format.js # JavaScript形式での応答
    #     format.json { render json: { status: 'success', save_count: question.bookmarks.count } }
    #   else
    #     format.js # JavaScript形式での応答
    #     format.json { render json: { status: 'error' } }
    #   end
    # end
  end
end
