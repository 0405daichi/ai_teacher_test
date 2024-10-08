Rails.application.routes.draw do
  get 'home/index'
  devise_scope :users do
    get '/users', to: redirect("/users/sign_up")
  end

  devise_for :users, controllers: {
    omniauth_callbacks: 'users/omniauth_callbacks',
    passwords: 'users/passwords',
    registrations: 'users/registrations'
  }


  resources :questions do
    collection do
      post :get_answer
      post :add_new_answer
      get :search
    end
    member do
      post 'like', to: 'likes#create', as: 'like' # 質問に対するいいねのルート
      delete 'unlike', to: 'likes#destroy', as: 'unlike' # いいねの取り消しのルート
      post 'bookmark', to: 'bookmarks#create', as: 'bookmark' # 質問の保存のルート
      delete 'unbookmark', to: 'bookmarks#destroy', as: 'unbookmark' # 保存の取り消しのルート
      get 'edit', to: 'questions#edit', as: 'edit'
      patch 'update', to: 'questions#update'
      get 'show_card', to: 'questions#show_card'
    end
  end

  resources :users, only: [:show] do
    member do
      get :likes
    end
  end

  resources :announcements, only: [:new, :create, :show]
  get 'announcements/:id/detail', to: 'announcements#detail', as: 'announcement_detail'

  get '/refresh_card/:id', to: 'home#refresh_card'
  get '/refresh_all_cards', to: 'home#refresh_all_cards'
  get '/add_more_cards', to: 'home#add_more_cards'

  post '/survey_responses', to: 'survey_responses#create'
  post '/feedback', to: 'survey_responses#create_feedback'

  # root 'questions#index'
  root to: 'home#index'
  post '/ocr', to: 'questions#analyze_image'

  # get '*not_found' => 'application#routing_error'
  # post '*not_found' => 'application#routing_error'
  # Active Storageのルーティングをエラーハンドリングの対象外とする
  direct :rails_active_storage do
    # 何もしない（Active Storageのデフォルトの動作をそのまま利用）
  end

  # カスタムエラーページへのリダイレクト（Active Storageのパスを除外）
  match '*path', to: 'application#routing_error', via: :all, constraints: lambda { |req|
    !req.path.starts_with?('/rails/active_storage')
  }
end
