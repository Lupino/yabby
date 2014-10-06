/** @jsx React.DOM */

if (!config) {
  var config = {};
}

var FileItem = React.createClass({
  render: function() {
    var file = this.props.file || {};
    return <img src={config.img_host + '/' + file.file_bucket + '/' + file.file_key} />;
  }
});


var FileForm = React.createClass({
  getInitialState: function() {
    return {};
  },
  handleFile: function() {
    if (!isLogin()) {return;}
    $(".choose-file").text("正在上传");
    $(this.refs.fileForm.getDOMNode()).submit();
  },
  handleClick: function() {
    if (!isLogin()) {return;}
    $(this.refs.file.getDOMNode()).click();
  },
  render: function() {
    return (
      <form className="fileForm" ref="fileForm" encType="multipart/form-data" method="POST" action="/api/upload">
        <button className="choose-file" onClick={this.handleClick}> 选择图片 </button>
        <input ref="file" type="file" name="file" onChange={this.handleFile} />
      </form>
    );
  }
});


var Pagenavi = React.createClass({
  render: function() {
    var html = [];
    var limit = this.props.limit || 10;
    var total_page = Math.floor(this.props.total / limit);
    if (total_page * limit < this.props.total) {
      total_page ++;
    }
    var current = this.props.current || 1;
    if (current > 3) {
      html.push(<a className="first" href={config.url + "/"}>« 最新</a>);
    }

    if (current == 2) {
      html.push(<a className="prev" href={config.url + "/"}>«</a>);
    }

    if (current > 2) {
      html.push(<a className="prev" href={config.url + '/p/' + (current - 1)}>«</a>);
    }

    if (current > 3) {
      html.push(<span className="extend">...</span>);
    }

    var start = current - 2;
    var end = current + 2;

    if (start < 1) {
      start = 1;
    }

    if (end > total_page) {
      end = total_page;
    }

    for(var i = start; i <= end; i ++) {
      if (i == current) {
        html.push(<span className="current">{i}</span>)
      } else if (i < current) {
        html.push(<a className="page smaller" href={config.url + "/p/" + i}>{i}</a>);
      } else {
        html.push(<a className="page larger" href={config.url + "/p/" + i}>{i}</a>);
      }
    }

    if (end < total_page) {
      html.push(<span className="extend">...</span>);
    }

    if (current < total_page) {
      html.push(<a className="next" href={config.url + "/p/" + total_page}>»</a>);
    }

    if (end < total_page) {
      html.push(<a className="last" href={config.url + "/p/" + total_page}>最旧 »</a>);
    }

    return (
      <div className="pagenavi">
        <span className="pages">{'第' + current + '页，共' + total_page + ' 页'}</span>
        {html}
      </div>
    );
  }
});


var TweetItem = React.createClass({
  getInitialState: function() {
    var tweet = this.props.tweet || {};
    var like_count = tweet.like_count;
    var unlike_count = tweet.unlike_count;
    return {like_count: like_count, unlike_count: unlike_count};
  },
  handleLike: function() {
    var self = this;
    if (!isLogin()) {return;}
    $.post("/api/tweets/" + this.props.tweet.tweet_id + '/like', function(data) {
      self.setState(data);
    });
  },
  handleUnLike: function() {
    var self = this;
    if (!isLogin()) {return;}
    $.post("/api/tweets/" + this.props.tweet.tweet_id + '/unlike', function(data) {
      self.setState(data);
    });
  },
  handleFavorite: function() {
    var self = this;
    if (!isLogin()) {return;}
    $.post("/api/tweets/" + this.props.tweet.tweet_id + '/favorite', function(data) {
      var fav = data.favorite? "fav": "unfav"
      self.setState({favorite: fav});
    });
  },
  handleDelete: function(evt) {
    var self = this;
    if (!isLogin()) {return;}
    $(self.getDOMNode()).hide();
    $.ajax("/api/tweets/" + this.props.tweet.tweet_id, {method: 'DELETE'}).done(function(data) {});
  },
  render: function() {
    var tweet = this.props.tweet || {};
    var user = tweet.user || {};
    var like_count = this.state.like_count;
    if (!like_count)  {
      if (like_count !== 0) {
        like_count = tweet.like_count || 0;
      }
    }
    var unlike_count = this.state.unlike_count;
    if (!unlike_count) {
      if (unlike_count !== 0) {
        unlike_count = tweet.unlike_count || 0;
      }
    }
    var favorite = 'unfav';
    if (tweet.favorite) {
      favorite = 'fav'
    }
    favorite = this.state.favorite || favorite;

    var file = '';
    if (tweet.file) {
      file = <FileItem file={tweet.file} />;
    }

    var avatar;
    if (tweet.user && tweet.user.file) {
      avatar  = <FileItem file={tweet.user.file} />;
    } else {
      avatar = <img src='/static/images/human.png' />
    }

    var entryBtn = "";
    if (config.user.user_id == user.user_id) {
      entryBtn = (
          <div className="entry-btn">
            <button className="delBtn" onClick={this.handleDelete}>删除</button>
          </div>
      );
    }

    var createdAt = DateFormat.format.date(new Date(tweet.created_at), '发布于 yyyy-M-dd HH:mm:ss');

    return (
      <article className="tweetItem">
        <header className="entry-header">
          <div className="avatar">
            {avatar}
          </div>
          <h3 className="entry-title">
            <a href={"/users/" + user.user_id} title={user.username}>{user.username}</a>
          </h3>

          <div className="entry-meta">
            <time className="entry-date">{createdAt}</time>
          </div>
          {entryBtn}
        </header>

        <div className="entry-content clearfix">
          <p>
            {tweet.text}
          </p>
          {file}
        </div>
        <div className="entry-status">
          <button className="like" onClick={this.handleLike}>{like_count}</button>
          <button className="unlike" onClick={this.handleUnLike}>{unlike_count}</button>
          <button className={favorite} onClick={this.handleFavorite}></button>
          <div className="right">
            <a href={"/tweets/" + tweet.tweet_id + "#comment"}>
              <button className="comment">{tweet.comment_count}</button>
            </a>
          </div>
        </div>
      </article>
    );
  }
});


var TweetForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    if (!isLogin()) {return;}
    var text = this.refs.text.getDOMNode().value.trim();
    var file_id = this.refs.file_id.getDOMNode().value.trim();
    if (!text) {
      return;
    }
    $.post("/api/tweets", {text: text, file_id: file_id}, function(data) {
      console.log(data);
      $(".choose-file").text("选择图片");
    });
    this.refs.text.getDOMNode().value = '';
    this.refs.file_id.getDOMNode().value = '';
    return;
  },
  handleFocus: function() {
    $('.tweetForm .placeholder').hide();
  },
  handleBlur: function() {
    var text = this.refs.text.getDOMNode().value.trim();
    if (!text) {
      $('.tweetForm .placeholder').show();
    }
  },
  render: function() {
    return (
      <form className="tweetForm clearfix" onSubmit={this.handleSubmit}>
        <input ref="file_id" type="hidden" id="tweetFile" />
        <div className="placeholder">把好玩的图片，好笑的段子或糗事发到这里，接受千万网友的拜模吧！ </div>
        <textarea ref="text" onFocus={this.handleFocus} onBlur={this.handleBlur}> </textarea>
        <input type="submit" value="发布" className="clearfix" />
      </form>
    );
  }
});


var TweetList = React.createClass({
  render: function() {
    var tweetNodes = this.props.tweets.map(function(tweet, index) {
      return <TweetItem tweet={tweet} />
    });
    return (
      <div className="tweetList">
      {tweetNodes}
      </div>
    );
  }
});


var TweetBox = React.createClass({
  loadTweetsFromServer: function() {
    var self = this;
    var url = config.api;
    if (config.current > 1) {
      var limit = config.limit || 10;
      url = url + "?page=" + (config.current - 1) + "&limit=" + limit;
    }
    $.get(url, function(data) {
      self.setState(data);
    });
  },
  getInitialState: function() {
    return {tweets: [], current: config.current, total: config.total, limit: config.limit};
  },
  componentDidMount: function() {
    this.loadTweetsFromServer();
  },
  render: function() {
    return (
      <div className="container">
        <TweetList tweets={this.state.tweets} />
        <Pagenavi current={this.state.current} total={this.state.total} limit={this.state.limit}/>
      </div>
    );
  }
});


var LoginForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var username = this.refs.username.getDOMNode().value.trim();
    var passwd = this.refs.passwd.getDOMNode().value.trim();
    if (!passwd || !username) {
      return;
    }
    this.props.onLoginSubmit({passwd: passwd, username: username});
    this.refs.username.getDOMNode().value = '';
    this.refs.passwd.getDOMNode().value = '';
    return;
  },
  render: function() {
    return (
      <form className="loginForm" onSubmit={this.handleSubmit}>
        <label htmlFor="username"> 用户名 </label>
        <input type="text" placeholder="用户名/邮箱" ref="username" />
        <label htmlFor="passwd"> 密码 </label>
        <input type="password" placeholder="密码" ref="passwd" />
        <label htmlFor="submit"> </label>
        <input type="submit" value="登录" />
      </form>
    )
  }
});


var PopupLoginBox = React.createClass({
  handleLogin: function(info) {
    var self = this;
    $.post('/auth', info, function(data) {
      if (data.user) {
        window.location.reload();
      } else {
        window.alert('用户名／密码不正确！');
      }
    });
  },
  handleRegisterClick: function(evt) {
    evt.preventDefault();
    React.renderComponent(<PopupRegisterBox />, document.querySelector('#popup'));
  },
  destory: function(evt) {
    if (evt.target.className === 'popup-outer') {
      umountPopup();
    }
  },
  render: function() {
    return (
      <div className="popup-outer" onClick={this.destory}>
        <div className="popup-inner">
          <h1> 登陆花苞儿 </h1>
          <LoginForm onLoginSubmit={this.handleLogin} />
          <div className="other">
            <a href="/forget_passwd" className="forget_passwd">忘记密码</a>
            <span>还没有花苞儿账号?</span>
            <a href="/register" className="register" onClick={this.handleRegisterClick}>点击注册</a></div>
        </div>
      </div>
    );
  }
});


var RegisterForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var username = this.refs.username.getDOMNode().value.trim();
    var email = this.refs.email.getDOMNode().value.trim();
    var passwd = this.refs.passwd.getDOMNode().value.trim();
    var repasswd = this.refs.repasswd.getDOMNode().value.trim();
    if (!passwd || !username || !email) {
      return;
    }
    if (repasswd !== passwd) {
      return;
    }
    this.props.onRegisterSubmit({passwd: passwd, username: username, repasswd: repasswd});
    this.refs.username.getDOMNode().value = '';
    this.refs.passwd.getDOMNode().value = '';
    this.refs.repasswd.getDOMNode().value = '';
    this.refs.email.getDOMNode().value = '';
    return;
  },
  render: function() {
    return (
      <form className="registerForm" onSubmit={this.handleSubmit}>
        <label htmlFor="username"> 用户名 </label>
        <input type="text" placeholder="用户名" ref="username" />
        <label htmlFor="email"> 邮箱 </label>
        <input type="text" placeholder="邮箱" ref="email" />
        <label htmlFor="passwd"> 密码 </label>
        <input type="password" placeholder="密码" ref="passwd" />
        <label htmlFor="repasswd"> 重复密码 </label>
        <input type="password" placeholder="重复密码" ref="repasswd" />
        <label htmlFor="submit"> </label>
        <input type="submit" value="注册" />
      </form>
    )
  }
});


var PopupRegisterBox = React.createClass({
  handleRegister: function(info) {
    var self = this;
    $.post('/api/users/register', info, function(data) {
      if (data.user) {
        React.renderComponent(<PopupLoginBox />, document.querySelector('#popup'));
      } else {
        window.alert(data.msg);
      }
    });
  },
  handleLoginClick: function(evt) {
    evt.preventDefault();
    React.renderComponent(<PopupLoginBox />, document.querySelector('#popup'));
  },
  destory: function(evt) {
    if (evt.target.className === 'popup-outer') {
      umountPopup();
    }
  },
  render: function() {
    return (
      <div className="popup-outer" onClick={this.destory}>
        <div className="popup-inner popup-reg">
          <h1> 注册花苞儿 </h1>
          <RegisterForm onRegisterSubmit={this.handleRegister} />
          <div className="other">
          <span>已有花苞儿账号?</span><a href="login" className="login" onClick={this.handleLoginClick}>登陆</a></div>
        </div>
      </div>
    );
  }
});


var InfoBox = React.createClass({
  handleLogout: function(evt) {
    var self = this;
    evt.preventDefault();
    $.get('/logout', function() {
      window.location.reload();
    });
  },
  handleLoginClick: function() {
    React.renderComponent(<PopupLoginBox />, document.querySelector('#popup'));
  },
  handleRegisterClick: function() {
    React.renderComponent(<PopupRegisterBox />, document.querySelector('#popup'));
  },
  loadUserInfo: function() {
    var self = this;
    $.get('/api/users/me', function(data) {
      self.setState(data);
    });
  },
  getInitialState: function() {
    return {user: config.user};
  },
  componentDidMount: function() {
    if (!config.user) {
      // this.loadUserInfo();
    }
  },
  render: function() {
    if (!this.state.user || !this.state.user.user_id) {
      return (
        <div className="btns">
          <button onClick={this.handleLoginClick}>登陆</button>
          <button onClick={this.handleRegisterClick}>注册</button>
        </div>
      );
    }

    var user = this.state.user;

    var avatar;
    if (user.file) {
      avatar  = <FileItem file={user.file} />;
    } else {
      avatar = <img src='/static/images/human.png' />
    }
    return (
      <div className="btns">
        <div className='settings'>
          <a href="/settings">
            {avatar}
            {user.username}
          </a>
        </div>
        <button onClick={this.handleLogout}> 登出 </button>
      </div>
    );
  }
});


var OneTweetBox = React.createClass({
  loadTweetFromServer: function() {
    var self = this;
    $.get(config.api, function(data) {
      self.setState(data);
    });
  },
  getInitialState: function() {
    return {tweet: {}};
  },
  componentDidMount: function() {
    this.loadTweetFromServer();
  },
  render: function() {
    return (
      <div className="container">
        <TweetItem tweet={this.state.tweet} />
        <CommentBox />
      </div>
    );
  }
});


var CommentItem = React.createClass({
  getInitialState: function() {
    var comment = this.props.comment || {};
    var like_count = comment.like_count;
    var unlike_count = comment.unlike_count;
    return {like_count: like_count, unlike_count: unlike_count};
  },
  handleLike: function() {
    var self = this;
    if (!isLogin()) {return;}
    var commentId = this.props.comment.comment_id;
    var tweetId = this.props.comment.tweet_id;
    $.post("/api/tweets/" + tweetId + '/comments/' + commentId + '/like', function(data) {
      self.setState(data);
    });
  },
  render: function() {
    var comment = this.props.comment;
    var like_count = this.state.like_count;
    if (!like_count) {
      if (like_count !== 0) {
        like_count = comment.like_count || 0;
      }
    }

    var user = comment.user || {};

    var avatar;
    if (user.file) {
      avatar  = <FileItem file={user.file} />;
    } else {
      avatar = <img src='/static/images/human.png' />
    }

    return (
      <div className="comment">
        <div className="avatar">
          {avatar}
        </div>
        <h3 className="entry-title">
          <a href={"/users/" + user.user_id} title={user.username}>{user.username}</a>
        </h3>
        <div className="text">
          <p>{comment.text}</p>
        </div>
        <div className="right">
          <button className="like" onClick={this.handleLike}>{like_count}</button>
        </div>
      </div>
    );
  }
});


var CommentForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var text = this.refs.text.getDOMNode().value.trim();
    if (!text) {
      return;
    }
    this.props.onCommentSubmit({text: text});
    this.refs.text.getDOMNode().value = '';
    return;
  },
  handleFocus: function() {
    $('.commentForm .placeholder').hide();
  },
  handleBlur: function() {
    var text = this.refs.text.getDOMNode().value.trim();
    if (!text) {
      $('.commentForm .placeholder').show();
    }
  },
  render: function() {
    return (
      <form className="commentForm clearfix" onSubmit={this.handleSubmit}>
        <div className="placeholder">这里是评论！ </div>
        <textarea ref="text" onFocus={this.handleFocus} onBlur={this.handleBlur}> </textarea>
        <input type="submit" value="评论" />
      </form>
    );
  }
});


var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.comments.map(function(comment, index) {
      return <CommentItem comment={comment} />
    });
    return (
      <div className="commentList">
      {commentNodes}
      </div>
    );
  }
});


var CommentBox = React.createClass({
  loadCommentsFromServer: function() {
    var self = this;
    var tweetId = this.props.tweetId;
    $.get(config.api + '/comments', function(data) {
      self.setState(data);
    });
  },
  getInitialState: function() {
    this.loadCommentsFromServer();
    return {comments: []};
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
  },
  handleComment: function(comment) {
    var self = this;
    $.post(config.api + '/comments', comment, function() {
      self.loadCommentsFromServer();
    })
  },
  render: function() {
    return (
      <div className="commentBox">
        <CommentList comments={this.state.comments} />
        <CommentForm onCommentSubmit={this.handleComment} />
      </div>
    );
  }
});


function render_tweets() {
  React.renderComponent(
    <TweetBox />,
    document.querySelector("#content")
  );
}

function render_info() {
  React.renderComponent(
    <InfoBox />,
    document.querySelector("#info")
  );
}


function render_tweet() {
  React.renderComponent(
    <OneTweetBox />,
    document.querySelector("#content")
  );
}


function render_new_tweet() {
  React.renderComponent(
    <div className="newTweetBox">
      <FileForm />
      <TweetForm />
    </div>,
    document.querySelector("#content"),
    function() {
      $(".fileForm").ajaxForm(function(result) {
        $(".choose-file").text("上传完成");
        $("#tweetFile").val(result.file.file_id);
      });
    }
  );
}
var isLogin = function() {
  if (config.user && config.user.user_id) {
    return true;
  }
  React.renderComponent(<PopupLoginBox />, document.querySelector('#popup'));
  return false;
};

var umountPopup = function(evt) {
  React.unmountComponentAtNode(document.getElementById('popup'));
};
