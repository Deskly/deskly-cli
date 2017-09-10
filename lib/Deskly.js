const got = require('got')
const util = require('util')

class Deskly {

  constructor(api = 'https://www.reddit.com') {
    this.__api = api
  }

  getRandomSubreddit(subreddits = ['earthporn', 'wallpaper', 'wallpapers']) {
    return subreddits[Math.floor(Math.random() * subreddits.length)]
  }

  getPosts(sort = 'hot', limit = 50, subreddit = this.getRandomSubreddit()) {
    let api = this.__api
    return got(util.format(
        '%s/r/%s/.json?sort=%s&limit=%s',
        api,
        subreddit,
        sort,
        limit))
      .then(data => {
        return JSON.parse(data.body).data.children
      })
  }

  getPost(promise = this.getPosts()) {
    return promise
      .then(posts => {
        return posts
          .map(post => post.data)
          .filter(post => post.post_hint == 'image')
      })
      .then(posts => {
        return posts[Math.floor(Math.random() * posts.length)]
      })
  }

}

module.exports = Deskly;
