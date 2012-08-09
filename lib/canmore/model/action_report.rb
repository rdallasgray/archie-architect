require 'data_mapper'
DataMapper.setup(:default, ENV['HEROKU_POSTGRESQL_VIOLET_URL'] || 'postgres://localhost/canmore')


module Canmore
  module Model
    class ActionReport
      include DataMapper::Resource
      
      property :id, Serial
      property :action, String
      property :time, DateTime
      property :device_id, String
      property :lat, Float
      property :long, Float
    end
  end
end
  
DataMapper.finalize