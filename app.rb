require 'rubygems'
require 'sinatra'

get '/inbound' do
  content_type 'text/xml'
  '<Response><Message>Ji py30ng @1 .2 3</Message></Response>'
end