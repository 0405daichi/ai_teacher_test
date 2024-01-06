# app/services/gpt_3_5_client.rb

require 'openai'

class Gpt35Client
  def initialize(api_key)
    @api_client = OpenAI::Client.new(access_token: api_key)
  end

  def generate_answer(params, question, first)
    prompt = ""
    conditions = "¥n# 条件
    ¥n・回答は必ず日本語
    ¥n・回答のフォーマットはMarkdownで統一¥n
    ¥n・LaTeX表現は使用しない¥n"
    partition = "¥n--------------------¥n"
    puts "これが元々の質問だよ#{question}"
    # 素の回答があるか無いかで場合わけし、ある場合は、他の種類の回答を修正もしくは追加（どちらも質問から生成する）（解説を渡して修正はしていない）
    if (first)
      detailOptions = analyzeOptions(params)

      prompt = returnPrompt(params["option"], detailOptions) + conditions + partition + question
    else
      prompt = re_generate_prompt(params) + conditions + partition + question
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
        return "質問に対する解答のみを返してください。¥n※解答に対する解説は必要ありません。簡潔に解答のみを返して下さい。"
      elsif detailOptions["answerType"] == 'withExplain'
        return "質問に対する解答とその分かりやすい回答を返してください。"
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
    case params['answer_type']
    when 1
      return "下記の質問に対するわかりやすい解説を、「論理的かつ段階的に」考えて下さい。"
    when 2
      return "下記にの質問に対する解説を、「小学生にもわかるような内容で」考えて下さい。"
    when 3
      return "下記にの質問に対する解説を、「別の概念に例えて」考えて下さい。¥n例えば、スポーツや食べ物、人の行動などです。¥n※ただし、論理的かつ段階的に考えた結果、例えとして最も適している概念を例えとして用いて下さい。"
    else
      return ""
    end
  end
end
