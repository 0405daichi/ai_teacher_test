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
  
    is_liked = @question.likes.exists?(user: current_user)
    is_bookmarked = @question.bookmarks.exists?(user: current_user)
  
    # answer_typeごとに回答を取得
    answer_1 = @question.answers.find_by(answer_type: 1)
    answer_2 = @question.answers.find_by(answer_type: 2)
    answer_3 = @question.answers.find_by(answer_type: 3)
  
    # ユーザーがカードを編集でき、かつそれが自分の投稿である場合のみ編集権限を許可
    # can_edit_own_post = current_user.can_edit? && @question.user == current_user

    image_url = @question.image.attached? ? rails_blob_url(@question.image, only_path: true) : nil
  
    respond_to do |format|
      format.html
      format.js
    end
  end

  def edit
    @question = Question.find(params[:id])
    render :edit
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

  # オープンソースライセンス表記-----保留
  # ベクトル化して保存-----保留
  # 未ログインユーザーがいいねした時-----保留
  # 再生成を質問の種類で場合分け-----保留
  # api制限-----一旦済み
  # 質問種類検証-----一旦済み
  # 画面拡大縮小-----一旦済み
  # 範囲選択方法-----一旦済み
  # プロンプト内の改行調整-----一旦済み
  # ベクトル化-----一旦済み
  # 写真の切り取りがうまく行っていない-----一旦済み
  # 撮影ボタンを押した後の画面分かりずらい-----一旦済み
  # 類似度検索結果で、見つかった文を保存せずに表示する。-----一旦済み
  # 未ログインで回答生成後表示されない-----一旦済み
  # 制限の計算ができていない-----一旦済み
  # ボタンによる生成には制限をつける-----一旦済み（re-generateは一旦保留）
  # gptリクエスト周りのエラー対応-----一旦済み
  # 軌道に乗るまで質問制限（100回/月?10回/日?）-----保留
  # 各APIの詳細や設定方法をナレッジ化
  # 回答生成中の広告表示
  # その他api制限管理
  # 分野ごとにapi分散(日本語メインはクロード?)
  # 回答生成後、ユーザーがした質問一覧に追加されない。多分非表示にされている状態で追加しようとしているから
  # 文章から単語帳作成、単語帳から英語の問題作成
  
  def get_answer
    # APIリクエスト制限の確認
    api_limit = ApiLimit.first_or_initialize
    if api_limit.is_limited
      # 制限がかかっている場合、処理を中止して警告メッセージを返す
      render json: { limit: true, message: "APIのリクエスト制限に達しました。1分後再試行してください。" }
      return # この時点でメソッドを終了する
    end

    # 未ログインユーザーの複数回の回答生成を制限
    unless user_signed_in?
      session[:query_count] ||= 0 # セッションにquery_countキーが存在しない場合は0を設定
      session[:query_count] += 1 # query_countをインクリメント
  
      if session[:query_count] >= 2
        # query_countが2以上の場合、ログインページへの移動を促す
        render json: { prompt_login: true, message: "質問を続けるにはログインが必要です。" }
        return # この時点でメソッドを終了する
      end
    end

    question = params[:questionInputForm]
    image = params[:image] # 画像を受け取る
    answer_type = params[:answer_type]

    @question = Question.new(content: question)
    @question.image.attach(image) if image.present? # 画像があれば添付
    @question.has_image = image.present? # 画像の有無を設定

    # 質問をベクトル化
    question_vector = Vectorizer.vectorize_text_with_python(question)
    puts "これがベクトル化した結果#{question_vector}"
    # 類似質問の検索
    similar_question = QuestionVector.similar_to?(question_vector, threshold: 0.95)
    puts "これが類似検索の結果#{similar_question.inspect}"

    if similar_question
      # 類似質問が存在する場合、その質問に紐づく回答を取得して再利用
      existing_answer = similar_question.answers.first.content
      # 再利用された回答を現在の質問に紐づける
      @question.answers.build(content: existing_answer, answer_type: answer_type)
    else
      # 類似質問が存在しない場合、新たにAIから回答を生成
      ai_answer = generate_ai_response(params, question, true)
      # ai_answer = nil
      if ai_answer.nil?
        render json: { no_answer: true }
        return
      end
      @question.answers.build(content: ai_answer, answer_type: answer_type)
    end

    # ログインしているユーザーのIDを紐づける
    @question.user = current_user if user_signed_in?
    user_id = @question.user_id if user_signed_in?

    puts "コントローラー側：#{question}"
    # ai_answer = generate_ai_response(params, question, true)
    # ai_answer = "test"
    # sleep 5
    # puts "これが生成したai_answer: #{ai_answer}"
    puts "@question：#{@question}"

    # アンケートモーダルを表示するか否かのフラグを設定
    survey_id = 1 # アンケートID
    show_survey = false # デフォルトではfalseに設定

    if user_signed_in?
      # 指定したアンケートにまだ回答していない場合のみshow_surveyをtrueにする
      # show_survey = !SurveyResponse.exists?(user_id: current_user.id, survey_id: survey_id)

      # 全てのログインユーザーに表示しない場合
      show_survey = false
    end
  
    if @question.save
      QuestionVector.create(question_id: @question.id, vector_data: question_vector)
      render json: { content: @question.answers.find_by(answer_type: answer_type), user_id: user_id, question_id: @question.id, show_survey: show_survey }
    else
      # 保存に失敗した場合の処理を追加
      render json: { error: "Failed to save question and answer." }, status: :unprocessable_entity
    end
  end  

  def add_new_answer
    puts "params: #{params.inspect}"

    unless user_signed_in?
      respond_to do |format|
        format.json { render json: { status: "limit" }, status: :too_many_requests }
      end
      return
    end

    # APIリクエスト制限の確認
    api_limit = ApiLimit.first_or_initialize
    if api_limit.is_limited
      # 制限がかかっている場合、処理を中止して警告メッセージを返す
      @limit = true;
      respond_to do |format|
        format.json { render json: { status: "login_required" } }
      end
      return # この時点でメソッドを終了する
    end
    
    question_id = params[:question_id]
    @question = Question.find(question_id)
    
    # 質問に紐付いた答えの中からanswer_typeが1のものを検索し、そのcontentを取得
    specific_answer_content = @question.answers.find_by(answer_type: 1)&.content
    
    question_content = @question.content.presence || specific_answer_content
    
    # generate_ai_responseメソッドの第二引数としてquestion_contentを渡す
    # answer_content = generate_ai_response(params, question_content, false)
    answer_content = nil
    if answer_content.nil?
      render json: { status: "no_answer" }
      return
    end
    # answer_content = 'test'
    # sleep 5
    answer_type = params[:answer_type]
    
    # 既存の回答の中で、同じanswer_typeを持つものを検索
    existing_answer = @question.answers.find_by(answer_type: answer_type)
    
    @answer = existing_answer || @question.answers.build(answer_type: answer_type)
    @answer.content = answer_content
    respond_to do |format|
      if @answer.save
        format.json { render json: { status: "success", answer_type: @answer.answer_type, content: @answer.content }, status: :ok }
      else
        format.json { render json: { status: "error" }, status: :unprocessable_entity }
      end
    end
  end

  def search
    query = params[:query]
    questions = Question.all.includes(:answers)
  
    calculator = SimilarityCalculator.new
    @results = calculator.similar_questions(query, questions)
    respond_to do |format|
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

  def show_card
    @question = Question.find(params[:id])
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
    api_key = ENV['OPENAI_API_KEY']
    gpt_client = Gpt35Client.new(api_key)
    response = gpt_client.get_answer(params, question, first)
    puts "これがgenerate_ai_responseの答え: #{response}"
    response
  end

end
