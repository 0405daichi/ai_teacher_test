class SurveyResponsesController < ApplicationController
  def create
    # パラメータからユーザーIDとサーベイIDを取得する
    # 実際のアプリケーションでは、適切にユーザー認証を行い、ユーザーIDを取得すること
    user_id = current_user.id # 例としてDeviseを使用している場合
    survey_id = params[:survey_id]
    
    feedback = params[:feedback]
    
    # アンケート回答を新しく作成して保存する
    SurveyResponse.create(user_id: user_id, survey_id: survey_id, feedback: feedback, answered_at: Time.current)
    
    respond_to do |format|
      format.js   # JavaScriptからのリクエストに応答
    end
  end

  def create_feedback
    user_id = current_user.id # 例としてDeviseを使用している場合
    survey_id = 1
    
    feedback = params[:feedback]
    
    # アンケート回答を新しく作成して保存する
    SurveyResponse.create(user_id: user_id, survey_id: survey_id, feedback: feedback, answered_at: Time.current)
    
    respond_to do |format|
      format.js # JavaScriptリクエストに応答
    end
  end
end
