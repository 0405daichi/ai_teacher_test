source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '3.0.2'

gem 'rails', '~> 6.1.7', '>= 6.1.7.3'
gem 'puma', '~> 5.0'
gem 'sass-rails', '>= 6'
gem 'webpacker', '~> 5.0'
gem 'turbolinks', '~> 5'
gem 'jbuilder', '~> 2.7'
gem 'bootsnap', '>= 1.4.4', require: false
gem 'httparty'
gem 'jquery-rails'
gem 'kaminari'
gem 'devise'
gem 'ruby-openai'
gem 'pry', group: :development
gem 'google-cloud-vision'
gem 'nokogiri', '~> 1.16.0'
gem 'tiktoken_ruby'
gem 'redcarpet'
gem 'omniauth-google-oauth2'
gem "omniauth-rails_csrf_protection"
gem 'katex', '~> 0.10.0'
gem 'recaptcha', require: 'recaptcha/rails'
gem 'aws-sdk-s3'

group :development, :test do
  gem 'sqlite3', '~> 1.4'
  gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
  gem 'web-console', '>= 4.1.0'
  gem 'rack-mini-profiler', '~> 2.0'
  gem 'listen', '~> 3.3'
  gem 'spring'
  gem 'dotenv-rails'
end

group :test do
  gem 'capybara', '>= 3.26'
  gem 'selenium-webdriver', '>= 4.0.0.rc1'
  gem 'webdrivers'
end

group :production do
  gem 'pg'
end

gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]
