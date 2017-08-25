const got = require('got')

class Deskly {

  constructor(config, api = 'https://www.reddit.com') {
    this.__config = config || {}
    this.__api = api
  }

  getRandomSubreddit() {
    let config = this.__config
    let subreddits = config.subreddits || ['earthporn', 'wallpaper']
    return subreddits[Math.floor(Math.random() * subreddits.length)]
  }

  getPosts(subreddit = this.getRandomSubreddit()) {
    let config = this.__config
    let api = this.__api
    let sort = config.sort || 'hot'
    let limit = config.limit || 1
    return got(api + '/r/' + subreddit + '/.json?sort=' + sort + '&limit=' + limit)
      .then(function(data) {
        return JSON.parse(data.body).data.children
      })
  }

  getPost(promise = this.getPosts()) {
    return promise
      .then(function(posts) {
        return posts
          .map(post => post.data)
          .filter(post => post.post_hint == 'image')
      })
      .then(function(posts) {
        return posts[Math.floor(Math.random() * posts.length)]
      })
  }

}
