class Survey < ApplicationRecord
  has_many :survey_responses
  has_many :users, through: :survey_responses

  def self.create_unique_survey(title, description)
    # 同じタイトルと説明のアンケートが既に存在するかチェック
    unless self.exists?(title: title, description: description)
      # 存在しない場合は新しいアンケートを保存
      self.create(title: title, description: description)
    end
  end
end

# アンケートの内容を決定し、保存する機能を実装するには、まずアンケートの内容を決定するためのメソッドを`Survey`モデルに追加し、その内容がデータベースにまだ存在しない場合にのみ保存するロジックを実装します。以下の例では、アンケートのタイトルと説明を引数として受け取り、同じタイトルと説明のアンケートがデータベースに存在しない場合にのみ、新しいアンケートを保存するメソッドを`Survey`モデルに定義します。

# ### ステップ 1: Surveyモデルにメソッドを追加

# `app/models/survey.rb`ファイルを開き、アンケートの内容を決定し保存するメソッドを追加します。

# ```ruby
# class Survey < ApplicationRecord
#   has_many :survey_responses
#   has_many :users, through: :survey_responses

#   # アンケートの内容を決定し、保存するメソッド
#   def self.create_unique_survey(title, description)
#     # 同じタイトルと説明のアンケートが既に存在するかチェック
#     unless self.exists?(title: title, description: description)
#       # 存在しない場合は新しいアンケートを保存
#       self.create(title: title, description: description)
#     end
#   end
# end
# ```

# ### ステップ 2: アンケートの内容を決定し保存

# 開発者がアンケートの内容を決定し、それを保存したい場合には、Railsコンソールまたは適切なコントローラーのアクションから上記メソッドを呼び出します。

# 例えば、Railsコンソールで新しいアンケートを作成するには、次のように実行します。

# ```ruby
# Survey.create_unique_survey("アンケートのタイトル", "アンケートの説明")
# ```

# また、特定のビューからアンケートを作成する場合（例えば、管理者用のインターフェースなど）、適切なコントローラーにアクションを追加し、その中で`create_unique_survey`メソッドを呼び出すことができます。

# ### 注意点

# - この方法は、アンケートのタイトルと説明が完全に一致する場合にのみ、新しいアンケートの作成を防ぎます。異なるタイトルや説明であれば、新しいアンケートとして保存されます。
# - このメソッドは非常に基本的な形で実装されています。より複雑なロジック（例えば、特定の期間内にのみアンケートを作成するなど）が必要な場合は、追加の条件をメソッドに組み込む必要があります。
# - 実際のアプリケーションでは、アンケートの作成を管理者のみが行えるようにするなど、適切なアクセス制御を実装することが重要です。