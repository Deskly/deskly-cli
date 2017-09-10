#!/usr/bin/env node

const Deskly = require('../lib/Deskly')
const pkg = require('../package.json')
const fs = require('fs')
const path = require('path')
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
let dir = path.join(__dirname, 'generated/')

commander
  .version(pkg.version)

commander
  .command('show-defaults')
  .description('Prints the default values.')
  .action(() => {
    console.log(conf.all)
  })

commander
  .command('clear-defaults')
  .description('Clears the default values.')
  .action(() => {
    conf.clear()
    console.log('Default values cleared.')
  })

commander
  .command('defaults-path')
  .description('Returns the path of the defaults config file.')
  .action(() => {
    console.log(conf.path)
  })

commander
  .command('add-subreddit <subreddit>')
  .action((subreddit) => {
    let array = conf.get('subreddits')
    array.push(subreddit)
    conf.set('subreddits', array)
  })

commander
  .command('remove-subreddit <subreddit>')
  .action((subreddit) => {
    let array = conf.get('subreddits')
    let index = array.indexOf(subreddit);
    if (index > -1) {
      conf.set('subreddits', array)
    }
  })

commander
  .command('sort-type <type>')
  .action((type) => {
    conf.set('sort', type)
  })

commander
  .command('path')
  .description('Returns the path of your current desktop image.')
  .action(() => {
    wallpaper.get().then(p => {
      console.log(p);
    })
  })

commander
  .command('generate')
  .description('Generates a new desktop image.')
  .option('-r, --subreddit <subreddit>', 'Specify the subreddit to use.')
  .option('-s, --sort <sort>', 'Specify the sort-type to use.')
  .option('-l, --limit <limit>', 'Specify the limit of posts fetched.')
  .action((options) => {
    let def = conf.all
    let sort = options.sort || def.sort
    let limit = options.limit || def.limit
    let subreddit = options.subreddit || d.getRandomSubreddit(def.subreddits)
    let promise = d.getPosts(sort, limit, subreddit)
      .catch(error => {
        console.log(util.format('Failed to retrieve images due to \'%s\'', error.statusMessage.red))
      })

    console.log(util.format('Searching for images on r/%s..', subreddit.green))

    d.getPost(promise)
      .then(post => {
        let p = dir + post.id + '.jpg'

        console.log(util.format('Downloading %s by %s', post.title.green, post.author.green))
        if (!fs.existsSync(dir)) fs.mkdirSync(dir)
        got.stream(post.url)
          .pipe(fs.createWriteStream(p))
          .on('finish', () => {
            wallpaper.set(p)
            console.log(util.format('Aand we\'re done! Saved image to %s', p.green))
          })
      })
      .catch(error => {
        console.log('Failed to download image.')
      })
  })

commander
  .command('clear-generated')
  .description('Clears the generated cache of desktop images.')
  .action((options) => {
    wallpaper.get().then(curr => {
      fs.readdir(dir, (err, files) => {
        for (const file of files) {
          let p = path.join(dir, file)
          if (p != curr) fs.unlinkSync(p)
        }
        console.log('Successfully cleared desktop images in the cache.')
      })
    })
  })

if (!process.argv.slice(2).length) {
  commander.outputHelp();
}

commander.parse(process.argv);
