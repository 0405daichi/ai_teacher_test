# app/controllers/saved_questions_controller.rb

class SavedQuestionsController < ApplicationController

  def create
    puts "bbbbbbbbbbbbbbbbbbbbbb"
    if user_signed_in?
      @question = Question.find(params[:question_id])
      @save = @question.saved_questions.new(user: current_user)

      if @save.save
        render json: { status: 'success', save_id: @save.id, action: 'created' }
      else
        render json: { status: 'error', message: @save.errors.full_messages }, status: :unprocessable_entity
      end
    else
      puts "aaaaaaaaaaaaaaaaaaaaaa"
      render json: { message: 'ログインが必要です', status: 'error' }, status: :unauthorized
    end
  end

  def destroy
    if user_signed_in?
      @save = SavedQuestion.find(params[:id])
      if @save.destroy
        render json: { status: 'success' }
      else
        render json: { status: 'error' }
      end
    else
      render json: { message: 'ログインが必要です', status: 'error' }, status: :unauthorized
    end
  end
end
