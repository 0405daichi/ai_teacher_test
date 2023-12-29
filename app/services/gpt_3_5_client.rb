# app/services/gpt_3_5_client.rb

require 'openai'

class Gpt35Client
  def initialize(api_key)
    @api_client = OpenAI::Client.new(access_token: api_key)
  end

  def generate_answer(params, first)
    prompt = ""
    if (first)
      detailOptions = analyzeOptions(params)

      prompt = returnPrompt(params["option"], detailOptions) + "¥n" + params[:questionInputForm]
    else
      prompt = re_generate_prompt(params)
    end

    system_message = { role: "system", content: "You are a helpful assistant." }
    user_message = { role: "user", content: prompt }

    total_tokens = 4097
    # tokens_used = system_message[:content].length + user_message[:content].length

    response = @api_client.chat(
      parameters: {
        model: 'gpt-4-1106-preview',
        messages: [
          system_message,
          user_message
        ],
        n: 1,
        # stop: ["\n"]
      }
    )

    if response
      content = response['choices'][0]['message']['content'].strip if response
      puts "これがapiの返答内容#{response}"
      content
    else
      raise "GPT-3 API error"
    end
  end

  def returnPrompt(option, detailOptions)
    case option
    when '質問'
      if detailOptions["answerType"] == 'onlyAnswer'
        return "質問に対する回答のみを返してください。"
      elsif detailOptions["answerType"] == 'withExplain'
        return "質問に対する回答とその分かりやすい回答を返してください。"
      end
    when '直訳・翻訳'
      if detailOptions["fromLanguage"] == 'English'
        if detailOptions["translationType"] == 'translated'
          return "下記の内容を英語から日本語に翻訳してください。"
        elsif detailOptions["translationType"] == 'literal'
          return "下記の内容を英語から日本語に直訳してください。"
        end
      elsif detailOptions["fromLanguage"] == 'Japanese'
        if detailOptions["translationType"] == 'translated'
          return "下記の内容を日本語から英語に翻訳してください。"
        elsif detailOptions["translationType"] == 'literal'
          return "下記の内容を日本語から英語に直訳してください。"
        end
      end
    when '口語訳'
      return "下記の内容を口語訳してください。"
    when '現代語訳'
      return "下記の内容を現代語訳してください。"
    when '要約'
      return "下記の内容を#{detailOptions["count"]}#{detailOptions["comparison"]}の#{detailOptions["delimiter"]}で要約してください。"
    when '添削'
      return "下記の内容を添削し修正箇所と修正案を教えてください。"
    else
      return ""
    end
  end  

  def analyzeOptions(params)
    detailOptions = case params["option"]
    when "質問"
      { "answerType" => params["answerType"] }
    when "直訳・翻訳"
      { "fromLanguage" => params["fromLanguage"], "translationType" => params["translationType"] }
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
    case params['answerTypeId']
    when 1
      return "下記の解説を改善して下さい。"
    when 2
      return "下記の内容を、論理的かつ段階的に考え、「小学生にもわかるように」修正してください。¥n※修正した文章のみを返して下さい。"
    when 3
      return  "下記の内容を、何かに例えた解説に修正して下さい。¥n※ただし、論理的かつ段階的に考えた結果、例えとして最も適している例えを用いて下さい。¥n※修正した文章のみを返して下さい。"
    else
      return ""
    end
  end
end
