# app/services/gpt_3_5_client.rb

require 'openai'
require 'open-uri'
require_relative 'prompts'
require 'tiktoken_ruby'
require 'net/http'
require 'uri'
require 'json'
require 'logger'

class Gpt35Client
  include Prompts
  MAX_TOKENS = 100000 # APIリクエストごとの最大トークン数
  MAX_RETRIES = 3 # 最大再試行回数
  RETRY_WAIT = 2 # 再試行までの待機時間（秒）

  def initialize(api_key)
    @api_client = OpenAI::Client.new(access_token: api_key)
    @conversation_history = [] # 会話の履歴を保存する配列
  end

  # APIから回答を得るメソッド
  def get_answer(params, question, first)
    prompt = create_prompt(params, question, first)
    response = generate_answer(params, question, first, prompt)
    response # 分割された全ての応答を結合して返す
  end

  private

  # パラメータと質問からプロンプトを生成するメソッド
  def create_prompt(params, question, first)
    # 実装済みのロジック
    prompt = ""
    if first
      detailOptions = analyzeOptions(params)
      prompt = returnPrompt(params, detailOptions)
    else
      prompt = re_generate_prompt(params) + question
    end
    puts "これがプロンプトですよーーーーーー#{prompt}"

    case params['option']
    when '質問'
      logger = Logger.new('custom6.log')
      logger.info("create_prompt内の質問の場合")
      # 英語で回答生成->翻訳
      # prompt += "Please answer according to **Conditions**. In English"
      prompt += "**条件に従って日本語で答えてください！**"
    when '直訳・翻訳', '現代語訳・口語訳', '要約', '添削'
      logger = Logger.new('custom7.log')
      logger.info("create_prompt内の質問以外の場合")
      prompt += "**条件に従って日本語で答えてください！**"
    else
      logger = Logger.new('custom6.log')
      logger.info("create_prompt内のそれ以外の場合")
      # 英語で回答生成->翻訳
      # prompt += "Please answer according to **Conditions**. In English"
      prompt += "**条件に従って日本語で答えてください！**"
    end    
  end

  # システムメッセージを返すメソッド
  def return_system_message(params, first)
    # 実装済みのロジック
    if (first)
      case params['option']
      when '質問'
        return SYSTEM_PROMPTS[:question]
      when '直訳・翻訳'
        return SYSTEM_PROMPTS[:translation]
      when '現代語訳・口語訳'
        return SYSTEM_PROMPTS[:ancient_translation]
      when '要約'
        return SYSTEM_PROMPTS[:wrap_up]
      when '添削'
        return SYSTEM_PROMPTS[:check_and_correct]
      else
        return SYSTEM_PROMPTS[:question]
      end
    else
      case params['answer_type']
      when 1
        return RE_GENERATE_SYSTEM_PROMPTS[:answer_type_1]
      when 2
        return RE_GENERATE_SYSTEM_PROMPTS[:answer_type_2]
      when 3
        return RE_GENERATE_SYSTEM_PROMPTS[:answer_type_3]
      else
        return RE_GENERATE_SYSTEM_PROMPTS[:answer_type_1]
      end
    end
  end

  # プロンプトのトークン数を計算するメソッド
  def calculate_tokens(text)
    # トークン数を計算する実装。実際にはtiktoken_rubyのメソッドを使用
    encoder = Tiktoken.get_encoding("cl100k_base")
    tokens = encoder.encode(text)
    tokens.length
  end

  # APIリクエストを行い、回答を生成するメソッド
  def generate_answer(params, question, first, prompt)
    token_count = calculate_tokens(prompt)
    puts "トークン合計トークン合計トークン合計#{token_count}"
  
    if token_count > MAX_TOKENS
      flash[:error] = '字数が多いです。' # フラッシュメッセージにエラーを追加
      return redirect_to request.referer || root_path # ユーザーを前のページまたはルートページにリダイレクト
    end
  
    system_message = { role: "system", content: return_system_message(params, first) }
    puts "これがシステムメッセージですよーーー#{system_message}"
    user_message = { role: "user", content: prompt }
    response = @api_client.chat(
      parameters: {
        model: 'gpt-4-turbo',
        messages: [
          system_message,
          user_message
        ],
        n: 1,
      }
    )

    update_api_limit_status(response.headers);
    # response オブジェクトとそのヘッダーを UTF-8 として安全に出力する
    puts "これがレスポンスですよ...#{response.to_s.encode("UTF-8", invalid: :replace, undef: :replace, replace: '?')}"
    puts "これがレスポンスのヘッダーですよ...#{response.headers.to_s.encode("UTF-8", invalid: :replace, undef: :replace, replace: '?')}"

    if response.key?('error')
      puts "エラーが発生しました: #{response['error']['message']}" # サーバーログにエラーを出力
      flash[:error] = "エラーが発生しました: #{response['error']['message']}" # フラッシュメッセージにエラーを追加
      return redirect_to request.referer || root_path
    elsif response && response['choices'] && !response['choices'].empty? && response['choices'][0]['message'] && response['choices'][0]['message']['content']
      content = response['choices'][0]['message']['content'].strip
      puts "#### これがgptの答え#{content}"

      # 回答を翻訳する場合の条件式
      # if params['option'] == '質問' || params['action'] == 'add_new_answer'
      if false
        logger = Logger.new('custom4.log')
        logger.info("generate_answer内の質問の場合ok")

        # 1. テキストから数式とマークダウンをプレースホルダーに置き換える
        replaced_text, placeholders = replace_latex_markdown_and_newlines(content)

        begin
          # 2. 置き換えたテキストを翻訳する
          translated_text = translate_with_deepl(replaced_text)
        rescue => e
          puts "翻訳中にエラーが発生しました: #{e.message}"
          # 翻訳プロセスでエラーが発生した場合、元のcontentを返す
          return content
        end

        # 3. 翻訳後のテキストでプレースホルダーを元に戻す
        if translated_text
          restored_text = restore_from_placeholders(translated_text, placeholders)
        else
          # 翻訳でエラーが発生した場合は、置換前のテキストを返す
          restored_text = content
        end
        return restored_text
      else
        logger = Logger.new('custom5.log')
        logger.info("generate_answer内の質問の場合ok")
        # '質問'以外のオプションまたはオプションが指定されていない場合、元のcontentを返す
        return content
      end
    else
      return nil
    end
  end  

  # 補助メソッド (analyzeOptions, returnPrompt, re_generate_prompt) の実装は省略
  def returnPrompt(params, detailOptions)
    option = params['option'];
    question = params['questionInputForm']

    case option
    when '質問'
      if detailOptions["answerType"] == 'onlyAnswer'
        return USER_PROMPTS[:only_answer] + question
      elsif detailOptions["answerType"] == 'withExplain'
        return USER_PROMPTS[:with_explanation] + question
      elsif detailOptions["answerType"] == 'hint'
        return USER_PROMPTS[:hint] + question
      end
    when '直訳・翻訳'
      if detailOptions["fromLanguage"] == 'English'
        if detailOptions["translationType"] == 'translated'
          return USER_PROMPTS[:translation][:from_english_translated] + question
        elsif detailOptions["translationType"] == 'literal'
          return USER_PROMPTS[:translation][:from_english_literal] + question
        end
      elsif detailOptions["fromLanguage"] == 'Japanese'
        if detailOptions["translationType"] == 'translated'
          return USER_PROMPTS[:translation][:from_japanese_translated] + question
        elsif detailOptions["translationType"] == 'literal'
          return USER_PROMPTS[:translation][:from_japanese_literal] + question
        end
      end
    when '現代語訳・口語訳'
      if (detailOptions['option_select'] == 'no_image')
        work_text = execute_search_based_on_text_type(detailOptions)
        if detailOptions['ancient_type'] == 'modern'
          return USER_PROMPTS[:ancient_translation][:no_image_to_modern] + 
          "- **注意**: 口語訳ではなく、現代語訳をする\n
          - **作品名**: #{detailOptions['work_name']}\n
          - **種類**: #{detailOptions['text_type']}\n
          - **本文**: " + work_text
        elsif detailOptions['ancient_type'] == 'colloquial'
          return USER_PROMPTS[:ancient_translation][:no_image_to_colloquial] + 
          "- **注意**: 現代語訳ではなく、口語訳をする\n
          - **作品名**: #{detailOptions['work_name']}\n
          - **種類**: #{detailOptions['text_type']}\n
          - **本文**: " + work_text
        end
      else
        if detailOptions['ancient_type'] == 'modern'
          return USER_PROMPTS[:ancient_translation][:image_to_modern] + question
        elsif detailOptions['ancient_type'] == 'colloquial'
          return USER_PROMPTS[:ancient_translation][:image_to_colloquial] + question
        end
      end
    when '要約'
      return USER_PROMPTS[:wrap_up] + 
      "- **制約**: #{detailOptions["count"]}#{detailOptions["comparison"]}の#{detailOptions["delimiter"]}\n
      - **文章**: "+ question
    when '添削'
      return USER_PROMPTS[:check_and_correct] + question
    else
      return question
    end
  end  

  def analyzeOptions(params)
    detailOptions = case params["option"]
    when "質問"
      { "answerType" => params["answerType"] }
    when "直訳・翻訳"
      { "fromLanguage" => params["fromLanguage"], "translationType" => params["translationType"] }
    when "現代語訳・口語訳"
      { 
        "ancient_type" => params["ancient_type"], 
        "work_name" => params["work_name"], 
        "text_type" => params["text_type"], 
        "option_select" => params["option_select"]
      }
    when "要約"
      if params["delimiter"] == "日本語"
        { "fromLanguage" => params["fromLanguage"], "count" => params["character_count"] }
      else
        { "fromLanguage" => params["fromLanguage"], "count" => params["word_count"] }
      end
    else
      {}
    end
  
    return detailOptions
  end  

  def re_generate_prompt(params)
    puts "これがアンサータイプですよーーー#{params['answer_type']}"
    case params['answer_type']
    when '1'
      return RE_GENERATE_USER_PROMPTS[:answer_type_1]
    when '2'
      return RE_GENERATE_USER_PROMPTS[:answer_type_2]
    when '3'
      return RE_GENERATE_USER_PROMPTS[:answer_type_3]
    else
      return RE_GENERATE_USER_PROMPTS[:answer_type_1]
    end
  end

  def search_work_page(work_name, site, css_selector)
    api_url = "https://www.googleapis.com/customsearch/v1"
    api_key = ENV['GOOGLE_CUSTOM_SEARCH_API']
    cx = ENV['CUSTOM_SEARCH_ENGINE_ID']

    # 青空文庫とkanbun.infoで検索条件を変更
    query = site == 'www.aozora.gr.jp' ? "site:#{site} #{work_name}" : "#{site} #{work_name}"
    uri = URI(api_url)
    uri.query = URI.encode_www_form({
      q: query,
      key: api_key,
      cx: cx,
      num: site == 'www.aozora.gr.jp' ? 3 : 1 # 青空文庫では上位3件を検討
    })

    response = Net::HTTP.get_response(uri)

    if response.is_a?(Net::HTTPSuccess)
      search_results = JSON.parse(response.body)
      if search_results['items'] && !search_results['items'].empty?
        # 青空文庫の場合、適切なリンクを選択するロジックを使用
        page_url = site == 'www.aozora.gr.jp' ? select_appropriate_link(search_results['items']) : search_results['items'].first['link']
        if page_url
          scrape_work_text(page_url, css_selector)
        else
          "適切な作品が見つかりませんでした。"
        end
      else
        "作品が見つかりませんでした。"
      end
    else
      "HTTPリクエストに失敗しました: #{response.message}"
    end
  rescue => e
    "検索中にエラーが発生しました: #{e.message}"
  end

  def select_appropriate_link(items)
    items.each do |item|
      link = item['link']
      if link.match?(/\/cards\/\d+\/files\/\d+_\d+\.html$/)
        return link
      end
    end
    nil
  end

  def scrape_work_text(url, css_selector)
    html = URI.open(url)
    doc = Nokogiri::HTML(html)
    text = doc.css(css_selector).text.strip
    text
  rescue => e
    "スクレイピング中にエラーが発生しました: #{e.message}"
  end

  def execute_search_based_on_text_type(detailOptions)
    work_name = detailOptions["work_name"]
    text_type = detailOptions["text_type"]
    
    case text_type
    when '古文'
      return search_work_page(work_name, 'www.aozora.gr.jp', '.main_text')
    when '漢文'
      return search_work_page(work_name, 'kanbun.info', 'article')
    else
      return "指定された種類のテキストはサポートされていません。"
    end
  end

  # ヘッダーからレートリミット情報を解析し、制限状態を更新する関数
  def update_api_limit_status(headers)
    # ヘッダーからレートリミット情報を取得
    limit_requests = headers['x-ratelimit-limit-requests'].to_i
    puts "これリミットリクエスト#{limit_requests}"
    remaining_requests = headers['x-ratelimit-remaining-requests'].to_i
    puts "これリリマイニングリクエスト#{remaining_requests}"
    limit_tokens = headers['x-ratelimit-limit-tokens'].to_i
    puts "これリミットトークン#{limit_tokens}"
    remaining_tokens = headers['x-ratelimit-remaining-tokens'].to_i
    puts "これリリマイニングトークン#{remaining_tokens}"

    # リクエスト制限とトークン制限を計算
    request_diff = limit_requests - remaining_requests
    token_diff = limit_tokens - remaining_tokens

    # 制限状態を判断
    is_limited = request_diff <= 1 || token_diff <= 1500

    # データベースのフラグを更新（ここではシングルトンパターンを想定）
    api_limit = ApiLimit.first_or_initialize
    api_limit.update(is_limited: is_limited)

    # フラグがtrueに設定された場合、1分後にフラグをfalseに戻すジョブをスケジュール
    if is_limited
      ResetApiLimitJob.set(wait: 1.minute).perform_later(api_limit.id)
    end
  end

  def replace_latex_markdown_and_newlines(text)
    placeholders = {}
    counter = 1
  
    # LaTeX数式とマークダウンのパターン
    patterns = [
      /\\\\\[(.*?)\\\\\]/,                 # \\[ ... \\] LaTeX display math
      /\\\\\((.*?)\\\\\)/,                 # \\( ... \\) LaTeX inline math
      /\$\$(.*?)\$\$/,                     # $$ ... $$ display math
      /\$(.*?)\$/,                         # $ ... $ inline math
      /(```\n?[\s\S]*?\n?```)/,            # ``` code block
      /(`[\s\S]*?`)/,                      # ` inline code
      /\\\[(.*?)\\\]/,                     # \[ ... \] LaTeX display math without double backslashes
      /\\\((.*?)\\\)/,                     # \( ... \) LaTeX inline math without double backslashes
      /\\\[\\begin\{align\*\}(.*?)\\end\{align\*\}\\\]/m,
      /^-\s/,                              # - List item
      /^\*\s/,                             # * List item
      /^\+\s/                              # + List item
    ]
  
    replaced_text = text.dup
    patterns.each do |pattern|
      replaced_text.gsub!(pattern) do |match|
        placeholder = case match
                      when /^-\s/
                        "LS01"
                      when /^\*\s/
                        "LS02"
                      when /^\+\s/
                        "LS03"
                      else
                        "FO#{format('%02d', counter)}"
                      end
        placeholders[placeholder] = match unless placeholder.start_with?("LS")
        counter += 1 unless placeholder.start_with?("LS")
        placeholder
      end
    end
  
    # カスタムログファイルを作成
    logger = Logger.new('custom3.log')
    logger.info("#### これが翻訳のために書き換えた文\n#{replaced_text}")
    puts "#### これが翻訳のために書き換えた文\n#{replaced_text}"
  
    [replaced_text, placeholders]
  end
  
  def restore_from_placeholders(translated_text, placeholders)
    restored_text = translated_text
  
    # プレースホルダーを元に戻す
    placeholders.each do |placeholder, original|
      restored_text.gsub!(placeholder, original)
    end

    # カスタムログファイルを作成
    logger = Logger.new('custom2.log')
    logger.info("#### これが翻訳後に書き換えた文\n#{restored_text}")
    puts "#### これが翻訳後に書き換えた文\n#{restored_text}"
  
    restored_text
  end  

  def translate_with_deepl(text)
    auth_key = ENV['DEEPL_AUTH_KEY']
    target_lang = 'JA'
    source_lang = 'EN'
    uri = URI.parse('https://api.deepl.com/v2/translate')
    request = Net::HTTP::Post.new(uri)
    request.content_type = 'application/json'
    request['Authorization'] = "DeepL-Auth-Key #{auth_key}"
    request['User-Agent'] = 'YourApp/1.2.3'
    request.body = JSON.dump({
      "text" => [text],
      "target_lang" => target_lang,
      "source_lang" => source_lang,
      "glossary_id": "dba8a984-15e9-4719-bd1c-04979693c83d"
    })

    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == 'https') do |http|
      http.request(request)
    end

    response_body = JSON.parse(response.body)
    logger1 = Logger.new('custom5.log')
    logger1.info("#### response--body\n#{response.body}")
    puts "#### これがresponse\n#{response_body['translations']}"
    if response_body['translations'] && response_body['translations'][0]
      text = response_body['translations'][0]['text']
      puts "#### これが翻訳文\n#{text}"
      # カスタムログファイルを作成
      logger = Logger.new('custom1.log')
      logger.info("#### これが翻訳文\n#{text}")
      text
    else
      puts "Translation failed or unexpected response format."
      return nil
    end
  rescue => e
    puts "Error: #{e.message}"
    nil
  end

end
