module.exports =
  port: 3000
  host: 'http://huabot.com'
  img_host: 'http://huabot.b0.upaiyun.com'
  title: '花苞儿'
  mongod: "mongodb://localhost/tweet"
  api_prefix: ""
  cookie_secret: "your cookie secret"
  upyun:
    operater: 'your username'
    password:'your passwd'
    bucket: 'your bucket'
    endpoint: 'v0'
  services:
    tqq:
      appkey: "your appkey"
      secret: "your secret"
    weibo:
      appkey: "your appkey"
      secret: "your secret"
    qzone:
      appkey: "your appkey"
      secret: "your secret"
    renren:
      appkey: "your appkey"
      secret: "your secret"
    douban:
      appkey: "your appkey"
      secret: "your secret"
