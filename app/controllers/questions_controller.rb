class QuestionsController < ApplicationController
  # before_action :authenticate_user!, except: [:index, :show]
  # before_action :authenticate_user!, only: :get_answer, if: :more_than_one_question?
  # skip_before_action :verify_authenticity_token

  def index
    @questions = Question.page(params[:page])
    if (current_user)
      @user = current_user
    end
  end  
  
  def get_answer
    # binding.pry
    puts "params: #{params.inspect}"
    question = params[:questionInputForm]
    ai_answer = generate_ai_response(params)
  
    @question = Question.new(content: question)
    @question.build_answer(content: ai_answer)
  
    if @question.save
      render json: { content: ai_answer }
    else
      # 保存に失敗した場合の処理を追加
      render json: { error: "Failed to save question and answer." }, status: :unprocessable_entity
    end
  end  

  def search
    query = params[:query]
    questions = Question.all.includes(:answer)
    
    calculator = SimilarityCalculator.new
    similar_questions = calculator.similar_questions(query, questions)
    similar_questions_with_answers = similar_questions.map do |question, similarity|
      { question: question, answer: question.answer, similarity: similarity }
    end
    
    render json: { similar_questions: similar_questions_with_answers }
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

  def generate_ai_response(params)
    api_key = ENV['OPENAI_API_KEY']
    gpt_client = Gpt35Client.new(api_key)
    response = gpt_client.generate_answer(params)
    response
  end

end
