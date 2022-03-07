# Dogelon - A not-so-stupid discord bot

This is Dogelon, a robot built with discord.js and a handful of other libraries.

After playing with some bots on Discord I found that none of them met my needs, which was:

- Stock information on request, but not as a single line command (needs to be inline), and nothing for Australian stocks!
  - use a stock API eventually, currently just mocking yahoo and scraping their API
- Crypto contained within as well, lots of bots do _some_ crypto with stocks, but not the whole lot from CoinMarketCap
  - yahoo one is insufficient, will need to find a decent crypto one
- Subreddit names don't link inline which for some reason FB Messenger does, so should do that too
  - Example: /r/wallstreetbets becomes https://www.reddit.com/r/wallstreetbets
- Any other junk i think is funny or could be useful (dice rolls, coin flips, the age-old question of "what's ligma?")
- Most of all, some bots aren't online all the time. Plan to solve by deploying to Heroku for 24/7 service while I am not online.

## Running

Clone repo then `npm install` to install dependencies, then `npm start` to compile and run. Plan is to containerise with Docker at some point so i can familiarise myself with that. You'll need to set a `.env` file with your discord bot token, a template is provided.

## TODO List

- Cache API responses so we aren't hitting the API while the stock market is closed
  - 5 min delay for stocks when market is open, until next open when market is closed
  - 1 min for crypto because it's 24/7
- Add little pictures of the stocks/coins,probably upload at first but will host eventually - coins done as of [1.0.5](#1.0.5)
- idk can add like coin flips and d20 rolls or whatever
- presence updates
- API rate limiting, for outbound messages too (discord allows 120/min)
- private messages dont work
- weather info might be cool to add
- encapsulate async stuff in promises or whatever just do it properly
- containerize with docker
- find a proper API(s) and use that for financial stuff
- refactor `Command` type with `Commands` class as `Command` is abstract and all of `Commands` is static so combining the two should be fine.

### Implemented Changes

- deploy to heroku for 24/7 madness - done as of [1.0.5](#1.0.5)
- error handling sucks so the bot dies if the data is bad and spews a bunch of stuff to the terminal - fixed (for now) as of [1.0.3](#1.0.3)
- code is all inline, need to refactor into modules - finance done as of [1.0.3](#1.0.3)
  - ligma and reddit modules done in [1.0.2](#1.0.2)
- as above, need to write proper parsing engine thing - done in [1.0.2](#1.0.1)
- could also convert the whole thing to typescript - done in [1.0.1](#1.0.1)
- Parsing ideas
  - finite state automaton
    - ~~[jssm](https://github.com/StoneCypher/jssm) looks like a cool way to do this~~
      - ~~seems like overkill for a discord robot designed to describe ligma~~ i have determined this is way overkill and more work, when regex can be chained together with groups named and reflection used to execute callbacks (and the fact that regex compiles to FSA like structures anyway under the hood).
    - regex in a list to check against -- done in [1.0.2]
      - could be slow with lots of commands
      - also, its regex
- help command - done in [1.0.3](#1.0.3)
- ~write API classes and interfaces and stuff to encapsulate things - is this really needed?~ - dont bother with this
- ~make the whole thing event driven (where appropriate)~ - it already is durr

# Changelog

## [1.0.5] - 2022-03-07

### Added

- we're live on heroku now! added a second bot for dev purposes.

### Changed

- added images to crypto output

## [1.0.4] - 2022-03-07

### Added

- cryptocurrency command, use `%{ticker}` to fetch a price

### Changed

- fixed bug where message regex would not reset until run twice.

## [1.0.3] - 2022-03-05

### Added

- if a command `.execute()` returns null or undefined we fail successfully silently and do not invoke the discord api.
- `!help` and `!h` command

### Changed

- refactored stock calls into `/src/commands/FinanceCommand.ts`, now the app is clean of raw command parsing and only parses based on imports.
- `FinanceCommand` now returns `null` for bad requests and throws an error instead of 1) crashing on bad api returns and 2) sending trash to the discord api.
- exchange name added to stock response footer

## [1.0.2] - 2022-03-05

### Added

- Commands now load dyanamically from directory `./src/commands/`
  - thanks to [stack overflow](https://stackoverflow.com/questions/51852938/typescript-dynamically-import-classes) again
- assembles regex string arrays and runs callback as defined in class files named `_______Command.ts`
  - will run against entire message first then against tokens and push all to queue for execution

### Changed

- refactored two commands into [LigmaCommand.ts](./src/commands/LigmaCommand.ts) and [RedditCommand.ts](./src/commands/RedditCommand.ts)

## [1.0.1] - 2022-03-01

### Added

- Added new types/classes `Action`, `Command` and a few sample commands `LigmaCommand` and `RedditCommand`.
- uml diagrams for a visual idea of how things should work
- This changelog lol

### Changed

- Converted the whole thing into a Typescript project for practice/sanity

## [1.0.0] - TODO date etc

### Added

- minimum viable product

[1.0.5]: ./
[1.0.4]: ./
[1.0.3]: ./
[1.0.2]: ./
[1.0.1]: ./
[1.0.0]: ./

```
Changelog template
## [1.0.0] - date
### Added
### Changed
### Removed
```

# Link dump for my use

Guide for development: https://stackabuse.com/guide-to-creating-a-discord-bot-in-javascript-with-discordjs-v13/

An API endpoint I can abuse until yahoo blocks me: https://query1.finance.yahoo.com/v10/finance/quoteSummary/ASX.AX?formatted=true&lang=en-AU&region=AU&modules=price%2CsummaryDetail%2CpageViews%2CfinancialsTemplate&corsDomain=au.finance.yahoo.com

Development, deployment and bears - oh my! https://www.smashingmagazine.com/2021/02/building-discord-bot-discordjs/

Rate limiting module https://github.com/xavi-/node-simple-rate-limiter

Convert to typescript https://javascript.plainenglish.io/how-to-convert-node-js-code-from-javascript-to-typescript-8e7d031a8f49

Changelog properly https://keepachangelog.com/en/1.0.0/

Getting direct messages https://github.com/discordjs/discord.js/issues/5516 https://stackoverflow.com/questions/41745070/sending-private-messages-to-user

JSON to types https://quicktype.io/typescript
