#!/usr/bin/env node
const Deskly = require('../lib/Deskly')
const pkg = require('../package.json')
const commander = require('commander')

let d = new Deskly()

commander
  .version(pkg.version)

commander
  .command('generate')
  .description('Generates a new desktop image.')
  .action(() => {
    d.getPost().then(post => {
      console.log(post.title)
    })
  })

if (!process.argv.slice(2).length) {
  commander.outputHelp();
}

commander.parse(process.argv);
