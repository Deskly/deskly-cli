class Deskly {

  constructor(config, api = 'https://www.reddit.com') {
    this.__config = config || {}
    this.__api = api
  }

  getRandomSubreddit() {
    let config = this.__config
    let subreddits = config.subreddits
    return subreddits[Math.floor(Math.random() * subreddits.length)]
  }

}
