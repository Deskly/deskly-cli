#!/usr/bin/env node

const Deskly = require('../lib/Deskly')
const pkg = require('../package.json')
const fs = require('fs')
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
  .command('show-config')
  .action(() => {
    console.log(conf.all)
  })

commander
  .command('clear-config')
  .action(() => {
    conf.clear()
  })

commander
  .command('generate')
  .description('Generates a new desktop image.')
  .action(() => {
    console.log('Searching for wallpapers..'.green)
    d.getPost().then(post => {
      console.log(('Downloading ' + post.title + ' by ' + post.author + ' from r/' + post.subreddit).cyan)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      let path = dir + post.id + '.jpg'
      got.stream(post.url)
        .pipe(fs.createWriteStream(path))
        .on('finish', function() {
          wallpaper.set(path)
          console.log(('Aaaand we\'re done! Image to ' + path).cyan)
        })
    })
  })

commander
  .command('path')
  .description('Returns the path of your current desktop image.')
  .action(() => {
    wallpaper.get().then(path => {
      console.log(path);
    })
  })

if (!process.argv.slice(2).length) {
  commander.outputHelp();
}

commander.parse(process.argv);
