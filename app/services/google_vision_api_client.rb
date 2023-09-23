# app/services/google_vision_api_client.rb

require 'google/cloud/vision'

class GoogleVisionApiClient
  def initialize
    @client = Google::Cloud::Vision.image_annotator do |config|
      config.credentials = ENV['GOOGLE_APPLICATION_CREDENTIALS']
    end
  end

  def analyze_image(image_path)
    response = @client.text_detection image: image_path
    if response.responses.any? && response.responses.first.text_annotations.any?
      return response.responses.first.text_annotations.first.description
    else
      return 'No text found.'
    end
  end  
end
