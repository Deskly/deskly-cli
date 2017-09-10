#!/usr/bin/env node

const Deskly = require('../lib/Deskly')
const pkg = require('../package.json')
const fs = require('fs')
const util = require('util')
const commander = require('commander')
const wallpaper = require('wallpaper')
const got = require('got')
const colors = require('colors');
const Configstore = require('configstore')

const conf = new Configstore(pkg.name, {
  subreddits: ['earthporn', 'wallpaper', 'wallpapers'],
  sort: 'hot',
  limit: 50
})

let d = new Deskly()
let dir = __dirname + '/generated/'

commander
  .version(pkg.version)

commander
  .command('generate')
  .description('Generates a new desktop image.')
  .option("-r, --subreddit <subreddit>", "Specify the subreddit to use.")
  .option("-s, --sort <sort>", "Specify the sort-type to use.")
  .option("-l, --limit <limit>", "Specify the limit of posts fetched.")
  .action((options) => {
    let def = conf.all
    let sort = options.sort || def.sort
    let limit = options.limit || def.limit
    let subreddit = options.subreddit || d.getRandomSubreddit(def.subreddits)
    let promise = d.getPosts(sort, limit, subreddit)

    console.log(util.format('Searching for wallpapers on r/%s..', subreddit.green))

    d.getPost(promise).then(post => {
      let path = dir + post.id + '.jpg'

      console.log(util.format('Downloading %s by %s', post.title.green, post.author.green))
      if (!fs.existsSync(dir)) fs.mkdirSync(dir)
      got.stream(post.url)
        .pipe(fs.createWriteStream(path))
        .on('finish', () => {
          wallpaper.set(path)
          console.log(util.format('Aand we\'re done! Saved image to %s', path.green))
        })
    })
  })

if (!process.argv.slice(2).length) {
  commander.outputHelp();
}

commander.parse(process.argv);
