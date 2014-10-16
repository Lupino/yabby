{User, Passwd, OauthToken, Tweet, Comment, File, Like, CommentLike, Favorite,
  Channel, ChannelTweet, Sequence, UserView, Binding} = require './lib/models'

{host} = require "./config"

{clean_obj} = require './lib/util'

async = require 'async'


module.exports = (app, yabby) ->
  require_login = yabby.require_login
  require_admin = yabby.require_admin

  index = (req, res) ->
    page = req.params.page or 1
    limit = if req.query.limit then Number(req.query.limit) else 10
    limit = 100 if limit > 100
    user = if req.user then clean_obj(req.user) else {}
    Tweet.count (err, total) ->
      res.render 'index', {
        current: page
        total: total
        limit: limit
        user: user
        api: '/api/tweets'
        url: "#{host}"
      }


  favorite = (req, res) ->
    page = req.params.page or 1
    limit = if req.query.limit then Number(req.query.limit) else 10
    limit = 100 if limit > 100
    user = if req.user then clean_obj(req.user) else {}
    Favorite.count {user_id: user.user_id}, (err, total) ->
      res.render 'favorite', {
        current: page
        total: total
        limit: limit
        user: user
        api: "/api/users/#{user.user_id}/favorite"
        url: "/favorite"
      }

  user_tweets = (req, res) ->
    page = req.params.page or 1
    user_id = req.params.user_id
    limit = if req.query.limit then Number(req.query.limit) else 10
    limit = 100 if limit > 100
    user = if req.user then clean_obj(req.user) else {}
    Tweet.count {user_id: user_id}, (err, total) ->
      res.render 'user_tweet', {
        current: page
        total: total
        limit: limit
        user: user
        api: "/api/users/#{user_id}/tweets"
        url: "/users/#{user_id}"
      }


  app.get "/", index
  app.get "/p/:page", index

  app.get "/users/:user_id", user_tweets
  app.get "/users/:user_id/p/:page", user_tweets

  app.get "/favorite", require_login(), favorite
  app.get "/favorite/p/:page", require_login(), favorite

  app.get "/tweets/new", require_login(), (req, res) ->
    user = if req.user then clean_obj(req.user) else {}
    tweet_id = req.params.tweet_id
    res.render 'new_tweet', {
      user: user
      api: "/api/tweets"
      url: "/tweets/new"
    }

  app.get "/tweets/:tweet_id", (req, res) ->
    user = if req.user then clean_obj(req.user) else {}
    tweet_id = req.params.tweet_id
    res.render 'tweet', {
      user: user
      api: "/api/tweets/#{tweet_id}"
      url: "/tweets/#{tweet_id}"
    }


  app.get "/logout", (req, res) ->
    if req.session and req.session.user
      delete req.session.user

    res.json {}


  app.get "/settings", require_login(), (req, res) ->
    user = if req.user then clean_obj(req.user) else {}
    res.render 'settings', {
      user: user
      api: "/api/users/me"
      url: "/settings"
    }
