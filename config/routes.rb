Rails.application.routes.draw do
  get 'home/index'
  get 'users/show'
  devise_for :users
  resources :questions do
    collection do
      post :get_answer
      get :search
    end
    member do
      post 'like', to: 'likes#create', as: 'like' # 質問に対するいいねのルート
      delete 'unlike', to: 'likes#destroy', as: 'unlike' # いいねの取り消しのルート
      post 'save', to: 'saved_questions#create', as: 'save' # 質問の保存のルート
    end
  end

  resources :saved_questions, only: [:destroy] do
    member do
      delete 'unsave', to: 'saved_questions#destroy', as: 'unsave' # 保存の取り消しのルート
    end
  end

  resources :users, only: [:show] do
    member do
      get :likes
    end
  end

  # root 'questions#index'
  root to: 'home#index'
  post '/ocr', to: 'questions#analyze_image'
end
