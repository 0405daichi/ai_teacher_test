# app/controllers/saved_questions_controller.rb
class SavedQuestionsController < ApplicationController
  before_action :authenticate_user!

  def create
    question = Question.find(params[:id])
    save = question.bookmarks.new(user: current_user)

    respond_to do |format|
      if save.save
        format.js # JavaScript形式での応答
        format.json { render json: { status: 'success', save_id: save.id, save_count: question.bookmarks.count } }
      else
        format.js # JavaScript形式での応答
        format.json { render json: { status: 'error', message: save.errors.full_messages }, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    question = Question.find(params[:id])
    save = question.bookmarks.find_by(user: current_user)

    respond_to do |format|
      if save.destroy
        format.js # JavaScript形式での応答
        format.json { render json: { status: 'success', save_count: question.bookmarks.count } }
      else
        format.js # JavaScript形式での応答
        format.json { render json: { status: 'error' } }
      end
    end
  end
end
