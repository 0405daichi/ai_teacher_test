# app/controllers/likes_controller.rb
class LikesController < ApplicationController
  before_action :authenticate_user!

  def create
    question = Question.find(params[:id])
    like = question.likes.new(user: current_user)

    respond_to do |format|
      if like.save
        format.js # JavaScript形式での応答
        format.json { render json: { status: 'success', like_id: like.id, like_count: question.likes.count } }
      else
        format.js # JavaScript形式での応答
        format.json { render json: { status: 'error', message: like.errors.full_messages }, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    question = Question.find(params[:id])
    like = question.likes.find_by(user: current_user)

    respond_to do |format|
      if like&.destroy
        format.js # JavaScript形式での応答
        format.json { render json: { status: 'success', like_count: question.likes.count } }
      else
        format.js # JavaScript形式での応答
        format.json { render json: { status: 'error' } }
      end
    end
  end
end
