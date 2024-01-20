class QuestionsController < ApplicationController
  # before_action :authenticate_user!, except: [:index, :show]
  # before_action :authenticate_user!, only: :get_answer, if: :more_than_one_question?
  # skip_before_action :verify_authenticity_token

  def index
    @questions = Question.page(params[:page])
    # if current_user
    #   @user_questions = current_user.questions # 自分が作成したカード
    #   @liked_questions = current_user.liked_questions # 自分がいいねしたカード
    #   # ※以下の部分は、SavedQuestionモデルとの関連を正しく設定していることを前提としています。
    #   @saved_questions = current_user.saved_questions # 自分が保存したカード
    # end
  end

  def show
    @question = Question.find(params[:id])
    image_url = @question.image.attached? ? rails_blob_url(@question.image, only_path: true) : nil
  
    is_liked = @question.likes.exists?(user: current_user)
    is_bookmarked = @question.bookmarks.exists?(user: current_user)
  
    # answer_typeごとに回答を取得
    answer_1 = @question.answers.find_by(answer_type: 1)
    answer_2 = @question.answers.find_by(answer_type: 2)
    answer_3 = @question.answers.find_by(answer_type: 3)
  
    # ユーザーがカードを編集でき、かつそれが自分の投稿である場合のみ編集権限を許可
    can_edit_own_post = current_user.can_edit? && @question.user == current_user
  
    respond_to do |format|
      format.html { render :show }
      format.json { 
        render json: { 
          question: @question.content, 
          image_url: image_url,
          answer_1: answer_1&.content, 
          answer_2: answer_2&.content, 
          answer_3: answer_3&.content, 
          is_liked: is_liked, 
          is_bookmarked: is_bookmarked,
          can_edit_own_post: can_edit_own_post
        } 
      }
    end
  end

  def edit
    @question = Question.find(params[:id])
    render :show
  end

  def update
    @question = Question.find(params[:id])
  
    # 更新する質問のデータを受け取る
    updated_question = params[:question][:question]
    puts "これパラメータ#{params}"
    puts "これparams[:question][:question]だよ#{params[:question][:question]}"
    
    # トランザクションを使用して質問と回答を更新
    ActiveRecord::Base.transaction do
      @question.update!(content: updated_question)
  
      # 各回答の更新
      (1..3).each do |index|
        answer_content = params[:question]["answer_type_#{index}"]
        # binding.pry
        if answer_content
          answer = @question.answers.find_or_initialize_by(answer_type: index)
          if answer.update(content: answer_content)
            # 更新成功
          else
            puts "更新に失敗: #{answer.errors.full_messages}"
          end
        end
      end
    end
  
    # 更新成功時の処理
    flash[:success] = "更新に成功しました。"
    redirect_to edit_question_path(@question)
  rescue => e
    # エラーが発生した場合の処理
    flash[:error] = "更新に失敗しました: #{e.message}"
    redirect_to edit_question_path(@question)
  end  


  # 編集ボタン（企業アカウントなどがLP的な回答を作成できるように）
  # ヒントボタン
  # ヘルプや推奨される使い方
  # 作品名とそれが何の部類（漢文,小説）なのかの情報を含める必要がある
  # カメラフォーカス
  # カメラ画面範囲
  # 範囲指定やり方
  # カード表示画面の「質問」「わかりやすく」を押したら折りたたむ
  # アプリ立ち上げ時、カメラ起動時、撮影時、回答作成時のアニメーションやアンケート機能
  # 目安箱
  # モーダル切り替え時などの選択内容初期化処理
  
  def get_answer
    puts "params: #{params.inspect}"
    question = params[:questionInputForm]
    image = params[:image] # 画像を受け取る
    answer_type = params[:answer_type]
    puts "コントローラー側：#{question}"
    ai_answer = generate_ai_response(params, question, true)
    puts "これが生成したai_answer: #{ai_answer}"
  
    @question = Question.new(content: question)
    @question.image.attach(image) if image.present? # 画像があれば添付
    @question.has_image = image.present? # 画像の有無を設定
  
    # build_answerの代わりにanswers.buildを使用
    @question.answers.build(content: ai_answer, answer_type: answer_type)
  
    # ログインしているユーザーのIDを紐づける
    @question.user = current_user if user_signed_in?
  
    puts "@question：#{@question}"
  
    if @question.save
      render json: { content: ai_answer }
    else
      # 保存に失敗した場合の処理を追加
      render json: { error: "Failed to save question and answer." }, status: :unprocessable_entity
    end
  end  

  def add_new_answer
    puts "params: #{params.inspect}"
    question_id = params[:question_id]
    @question = Question.find(question_id)
    answer_content = generate_ai_response(params, @question.content, false)
    answer_type = params[:answer_type]
    
    # 既存の回答の中で、同じanswer_typeを持つものを検索
    existing_answer = @question.answers.find_by(answer_type: answer_type)
    
    if existing_answer
      # 既存の回答が見つかった場合、contentを更新
      existing_answer.update(content: answer_content)
      if existing_answer.save
        render json: { content: existing_answer.content }
      else
        render json: { error: "Failed to update answer." }, status: :unprocessable_entity
      end
    else
      # 新しい回答を生成
      @answer = @question.answers.build(content: answer_content, answer_type: answer_type)
      
      if @answer.save
        # 保存成功時の処理
        render json: { content: @answer.content }
      else
        # 保存失敗時の処理
        render json: { error: "Failed to save answer." }, status: :unprocessable_entity
      end
    end
  end  

  def search
    query = params[:query]
    questions = Question.all.includes(:answer)
  
    calculator = SimilarityCalculator.new
    @results = calculator.similar_questions(query, questions)
    respond_to do |format|
      format.html { render partial: 'shared/search_results', locals: { results: @results } }
      format.js   # JavaScriptからのリクエストに応答
    end
  end  

  def analyze_image
    # Get the path to the temporary file
    image_path = params[:image].tempfile.path
    
    # Google Vision APIを使って画像からテキストを抽出
    result = GoogleVisionApiClient.new.analyze_image(image_path)

    puts "OCR Result: #{result}" # ログの追加
  
    if result
      render json: { text: result }
    else
      render json: { error: '画像からテキストを抽出できませんでした。' }, status: :unprocessable_entity
    end
  end  

  private

  def more_than_one_question?
    if session[:question_count].nil?
      session[:question_count] = 1
      return false
    else
      session[:question_count] += 1
      return session[:question_count] > 1
    end
  end

  def message_params
    params.require(:message).permit(:content, :sender, :user_id)
  end  

  def generate_ai_response(params, question, first)
    Rails.logger.info "アクセストークン：#{ENV['OPENAI_API_KEY']}"
    puts "アクセストークン：#{ENV['OPENAI_API_KEY']}"
    Rails.logger.info ENV.inspect
    api_key = ENV['OPENAI_API_KEY']
    gpt_client = Gpt35Client.new(api_key)
    response = gpt_client.generate_answer(params, question, first)
    puts "これがgenerate_ai_responseの答え: #{response}"
    response
  end

end
