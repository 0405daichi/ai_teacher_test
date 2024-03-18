# app/jobs/reset_api_limit_job.rb
class ResetApiLimitJob < ApplicationJob
  queue_as :default

  def perform(api_limit_id)
    api_limit = ApiLimit.find_by(id: api_limit_id)
    api_limit&.update(is_limited: false) if api_limit
  end
end
