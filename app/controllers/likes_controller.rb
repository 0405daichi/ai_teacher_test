# app/controllers/likes_controller.rb
class LikesController < ApplicationController

  def create
    if user_signed_in?
      @question = Question.find(params[:id])
      @like = @question.likes.new(user: current_user)

      if @like.save
        render json: { status: 'success', like_id: @like.id, action: 'created' }
      else
        render json: { status: 'error', message: @like.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { message: 'ログインが必要です', status: 'error' }, status: :unauthorized
    end
  end  

  def destroy
    if user_signed_in?
      @like = Like.find(params[:id])
      if @like.destroy
        render json: { status: 'success' }
      else
        render json: { status: 'error' }
      end
    else
      render json: { message: 'ログインが必要です', status: 'error' }, status: :unauthorized
    end
  end
end
