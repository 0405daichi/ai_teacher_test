class AnnouncementsController < ApplicationController
  before_action :check_admin, only: [:new, :create]

  def new
    @announcement = Announcement.new
  end

  def create
    @announcement = Announcement.new(announcement_params)
    if @announcement.save
      redirect_to @announcement, notice: 'お知らせが作成されました。'
    else
      render :new
    end
  end

  def detail
    @announcement = Announcement.find(params[:id])
    render partial: 'shared/announcement_detail', locals: { announcement: @announcement }
  end

  private

  def announcement_params
    params.require(:announcement).permit(:title, :content)
  end

  def check_admin
    unless current_user&.admin?
      puts "これユーザー#{current_user.attributes}"
      redirect_to root_path, alert: '管理者権限が必要です。'
    end
  end
end
