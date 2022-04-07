# Dogelon - A not-so-stupid discord bot

This is Dogelon, a robot built with discord.js and a handful of other libraries.

After playing with some bots on Discord I found that none of them met my needs, which was:

-   Stock information on request, but not as a single line command (needs to be inline), and nothing for Australian stocks!
    -   use a stock API eventually, currently just mocking yahoo and scraping their API
-   Crypto contained within as well, lots of bots do _some_ crypto with stocks, but not the whole lot from CoinMarketCap
    -   yahoo one is insufficient, will need to find a decent crypto one
-   Subreddit names don't link inline which for some reason FB Messenger does, so should do that too
    -   Example: /r/wallstreetbets becomes https://www.reddit.com/r/wallstreetbets
-   Any other junk i think is funny or could be useful (dice rolls, coin flips, the age-old question of "what's ligma?")
-   Most of all, some bots aren't online all the time. Plan to solve by deploying to Heroku for 24/7 service while I am not online.

## Running

Clone repo then `npm install` to install dependencies, then `npm start` to compile and run. Plan is to containerise with Docker at some point so i can familiarise myself with that. You'll need to set a `.env` file with your discord bot token, a template is provided.

## TODO List

-   Cache API responses so we aren't hitting the API while the stock market is closed - in progress as of [1.1.0](#1.1.0)
    -   5 min delay for stocks when market is open, until next open when market is closed
    -   1 min for crypto because it's 24/7 - done as of [1.1.0](#1.1.0)
-   Add little pictures of the stocks/coins,probably upload at first but will host eventually - coins done as of [1.0.5](#1.0.5)
-   idk can add like coin flips and d20 rolls or whatever
-   presence updates
-   private messages dont work
-   weather info might be cool to add
-   containerize with docker
-   find a proper API(s) and use that for financial stuff
-   direct api from binance

## Implemented Changes

<details>
<summary>Click to expand</summary>

-   API rate limiting, for outbound messages too (discord allows 120/min) - this is done from [1.0.0](#1.0.0) as the commands are queued to run one every half second to match discord's rates.
-   deploy to heroku for 24/7 madness - done as of [1.0.5](#1.0.5)
-   error handling sucks so the bot dies if the data is bad and spews a bunch of stuff to the terminal - fixed (for now) as of [1.0.3](#1.0.3)
-   code is all inline, need to refactor into modules - finance done as of [1.0.3](#1.0.3)
    -   ligma and reddit modules done in [1.0.2](#1.0.2)
-   as above, need to write proper parsing engine thing - done in [1.0.2](#1.0.1)
-   could also convert the whole thing to typescript - done in [1.0.1](#1.0.1)
-   Parsing ideas
    -   finite state automaton
        -   ~~[jssm](https://github.com/StoneCypher/jssm) looks like a cool way to do this~~
            -   ~~seems like overkill for a discord robot designed to describe ligma~~ i have determined this is way overkill and more work, when regex can be chained together with groups named and reflection used to execute callbacks (and the fact that regex compiles to FSA like structures anyway under the hood).
        -   regex in a list to check against -- done in [1.0.2]
            -   could be slow with lots of commands
            -   also, its regex
-   help command - done in [1.0.3](#1.0.3)
-   db is sqlite in-memory, need to migrate to postgres - done in [1.5.0](#1.5.0)
-   refactor `Command` type with `Commands` class as `Command` is abstract and all of `Commands` is static so combining the two should be fine. - done in [1.6.0](#1.6.0)
-   dynamic coin tickers from coingecko/binance - done in [1.6.0](#1.6.0)
-   encapsulate async stuff in promises or whatever just do it properly - done in general as required.
-   ~write API classes and interfaces and stuff to encapsulate things - is this really needed?~ - dont bother with this
-   ~make the whole thing event driven (where appropriate)~ - it already is durr

</details><br />

# Development Guidelines

## Branching

-   `master` - godmode branch, autodeployed.
-   `next/{x}` - next version for deployment with new features.
-   `feature/{x}` - new features to be merged into `next/` branches.
-   `hotfix/{x}` - bug fixing

Remember to update the version number in the changelog in `README.md`, `package.json` and `package-lock.json`, change the changelog date and tag the git commit after merging.

## Versioning and Changelog

Using [SemVer](semver.org) and [Keep a Changelog](keepachangelog.com) (except the links are contained with each entry). Dev versions are suffixed with `-next`.

# Changelog

## [1.9.1] - 2022-04-08

[1.9.1]: https://github.com/jarrodpan/dogelon-discord/releases/tag/v1.9.1

### Changed

-   binance month fixed (issue #82)
-   binance month and date padded
-   news links fixed (issue #81)
-   added unit test to check that version numbers and dates are correct on all files

## [1.9.0] - 2022-04-07

[1.9.0]: https://github.com/jarrodpan/dogelon-discord/releases/tag/v1.9.0

### Added

-   direct messages are now supported (issue #23)

### Changed

-   reworked logging override to not stuff up and be more useful
-   alpha etc versions do not spam chat every time they launch
-   fixed issue with database caching using js time instead of unit time (issue #75)

# Previous Changes

<details>
<summary>Click to expand</summary>

## [1.8.0] - 2022-04-03

[1.8.0]: https://github.com/jarrodpan/dogelon-discord/releases/tag/v1.8.0

### Added

-   News headline command `!news` and `!n`. Caches for one hour. (enhancement #69)

### Changed

-   fixed issue where subscriptions would not poll on bot restart (issue #70)
-   refactored subscription module to be modular with feeds. (issue #62)
-   crypto bug fixed where it was breaking with `%` and it was returning crap (issue #72))
-   crypto `%_:all` has command and currency reversed to improve readabillity (issue #73)
-   added dynamic decimal place decided on crypto prices to help for low value crypto (issue #71)
-   tidied up timeframe validation for crypto module.
-   crypto help shows timeframe options and added a few more aliases in the module too.
-   added type definitions for API responses to help with intellisense.

## [1.7.1] - 2022-03-27

[1.7.1]: https://github.com/jarrodpan/dogelon-discord/releases/tag/v1.7.1

### Changed

-   fixed #65 in crypto module which was throwing an error on a preference debug echo that is muted in prod. sigh.

## [1.7.0] - 2022-03-27

[1.7.0]: https://github.com/jarrodpan/dogelon-discord/releases/tag/v1.7.0

### Added

-   crypto command allows for multiple ticker matches to be specified (enhancement #58)
-   added market cap to crypto output (enhancement #59)
-   crypto command also allows saving of preferences for channels (enhancement #61)

### Changed

-   icon on footer of embeds is now applied globally.

## [1.6.2] - 2022-03-26

[1.6.2]: https://github.com/jarrodpan/dogelon-discord/releases/tag/v1.6.2

### Changed

-   fix crypto math for longer time frames (issue #54)
-   internal logging is now more detailed with file and function calls
-   added little icon to footer and removed author placeholder.

## [1.6.1] - 2022-03-26

[1.6.1]: https://github.com/jarrodpan/dogelon-discord/releases/tag/v1.6.1

### Changed

-   fix security vulnerablility in package (issue #53)
-   fixed new deployment notifications, again

## [1.6.0] - 2022-03-26

[1.6.0]: https://github.com/jarrodpan/dogelon-discord/releases/tag/v1.6.0

### Added

-   coingecko api now updates the coin list once per week (improvement #26)
-   crypto command now take arguments for timeframe and currency (improvements #42 and #45)
-   `!changes` to show the latest changelog entry (improvement #35)

### Changed

-   refactored Command and Commands classes into one class (improvement #22)
-   broke and fixed subscriber function again (issue #46)
-   uplift commands to have optional initialisers called after definition (improvement #44)
-   refactored first run to utilise `ChangesCommand` (improvement #35)
-   `binance-new` feed now expands the timestamp on reported news (improvement #19)

## [1.5.2] - 2022-03-25

[1.5.2]: https://github.com/jarrodpan/dogelon-discord/releases/tag/v1.5.2

### Changed

-   fixed notification on new versions (issue #40)
-   fixed subscribe/unsubscribe notifications (issue #29)
-   fixed forex labels on Finance command (issue #4)
-   minor adjustment to help command

## [1.5.1] - 2022-03-25

[1.5.1]: https://github.com/jarrodpan/dogelon-discord/releases/tag/v1.5.1

### Changed

-   reduced discord message sending to 550ms from 750ms
-   fixed issue #36 with multiple queries in one transaction (made it an `OR` statement)
-   fixed issue #8 where the statement would not match partial of a whole message with a space.
-   implemented issue #18 to poll every 10 mins for subscription feed `binance-new`

## [1.5.0] - 2022-03-25

[1.5.0]: ./

### Added

-   `PostgresDatabase.ts` and unit test. Postgres is now the default database.
-   Heroku does not allow pools on free postgres, had to refactor to single client connect.

### Changed

-   database calls are now awaited on before proceeding.
-   uplifted `Database.ts` to allow Promises as a return value.
-   switch db from sqlite to postgres
-   all data is now persistent between deploys
-   unit tests no longer compile because that's dumb
-   stop spamming channels on every reset, only on upgrades.
-   Changelog is easier to read in readme now

## [1.4.2] - 2022-03-21

[1.4.2]: https://github.com/jarrodpan/dogelon-discord/releases/tag/v1.4.2

### Changed

-   Fixed bug where only the first channel would subscribe to a feed.
-   Fixed `binance-new` feed embed to actually link the article that is found.
-   The first subscriber will get the last 24h news worth of updates, will potentially extend to all new subscribers in future.
-   When a feed is first subscribed to run the check immediately instead of after the delay.
-   Changed subscription poll interval from 30 to 20 minutes.

## [1.4.1] - 2022-03-19

[1.4.1]: ./

### Changed

-   Message replies/channel sends now await a response before sending another (I think discord is rate limiting the bot so this will mitigate bans).
-   Changed messaging interval to 750ms instead of 500ms to help with rate limiting issues.
-   Removed excess logging for production to help diagnose issues.

## [1.4.0] - 2022-03-18

[1.4.0]: ./

### Added

-   Notify all channels of upgrade from changelog.
-   Discord webhook integration for notification of deployment.

### Changed

-   Removed timestamps from messages to channels.
-   Condensed `!subscribe` and `!unsubscribe` in help command.

## [1.3.0] - 2022-03-18

[1.3.0]: ./

### Added

-   Added `!subscribe` and `!unsubscribe` command to subscribe channels to feeds. Current feeds: `binance-new`.

### Changed

-   action queue can now accept channels as an argument to send directly instead of replying to messages.

## [1.2.0] - 2022-03-16

[1.2.0]: ./

### Added

-   Added `!binance` command to show the latest 5 news articles on binance listings (feature request)

## [1.1.0] - 2022-03-13

[1.1.0]: ./

### Added

-   Added Database class and sample implementation of SQLite in-memory , as well as cache checking on CryptocurrencyCommand.

## [1.0.6] - 2022-03-10

[1.0.6]: ./

### Changed

-   fixed issue #5 where the reddit links were going nuts
-   replace newlines with spaces before tokenizing
-   cleaned up some stuff in the typescript

## [1.0.5] - 2022-03-07

[1.0.5]: ./

### Added

-   we're live on heroku now! added a second bot for dev purposes.

### Changed

-   added images to crypto output
-   moved parsing interval into ready callback

## [1.0.4] - 2022-03-07

[1.0.4]: ./

### Added

-   cryptocurrency command, use `%{ticker}` to fetch a price

### Changed

-   fixed bug where message regex would not reset until run twice.

## [1.0.3] - 2022-03-05

[1.0.3]: ./

### Added

-   if a command `.execute()` returns null or undefined we fail successfully silently and do not invoke the discord api.
-   `!help` and `!h` command

### Changed

-   refactored stock calls into `/src/commands/FinanceCommand.ts`, now the app is clean of raw command parsing and only parses based on imports.
-   `FinanceCommand` now returns `null` for bad requests and throws an error instead of 1) crashing on bad api returns and 2) sending trash to the discord api.
-   exchange name added to stock response footer

## [1.0.2] - 2022-03-05

[1.0.2]: ./

### Added

-   Commands now load dyanamically from directory `./src/commands/`
    -   thanks to [stack overflow](https://stackoverflow.com/questions/51852938/typescript-dynamically-import-classes) again
-   assembles regex string arrays and runs callback as defined in class files named `_______Command.ts`
    -   will run against entire message first then against tokens and push all to queue for execution

### Changed

-   refactored two commands into [LigmaCommand.ts](./src/commands/LigmaCommand.ts) and [RedditCommand.ts](./src/commands/RedditCommand.ts)

## [1.0.1] - 2022-03-01

[1.0.1]: ./

### Added

-   Added new types/classes `Action`, `Command` and a few sample commands `LigmaCommand` and `RedditCommand`.
-   uml diagrams for a visual idea of how things should work
-   This changelog lol

### Changed

-   Converted the whole thing into a Typescript project for practice/sanity

## [1.0.0] - 2022-02-26

[1.0.0]: ./

### Added

-   minimum viable product

</details><br />

<!--
```
# Changelog template
## [1.0.0] - date
[1.0.0]: ./
### Added
### Changed
### Removed
```
-->

# Link dump for my use

Guide for development: https://stackabuse.com/guide-to-creating-a-discord-bot-in-javascript-with-discordjs-v13/

An API endpoint I can abuse until yahoo blocks me: https://query1.finance.yahoo.com/v10/finance/quoteSummary/ASX.AX?formatted=true&lang=en-AU&region=AU&modules=price%2CsummaryDetail%2CpageViews%2CfinancialsTemplate&corsDomain=au.finance.yahoo.com

Development, deployment and bears - oh my! https://www.smashingmagazine.com/2021/02/building-discord-bot-discordjs/

Rate limiting module https://github.com/xavi-/node-simple-rate-limiter

Convert to typescript https://javascript.plainenglish.io/how-to-convert-node-js-code-from-javascript-to-typescript-8e7d031a8f49

Changelog properly https://keepachangelog.com/en/1.0.0/

Getting direct messages https://github.com/discordjs/discord.js/issues/5516 https://stackoverflow.com/questions/41745070/sending-private-messages-to-user

JSON to types https://quicktype.io/typescript

Get a class name reflectively https://stackoverflow.com/questions/13613524/get-an-objects-class-name-at-runtime

heroku webhooks? https://stackoverflow.com/questions/50358737/connecting-heroku-webhooks-with-discord

more: https://github.com/muan/discord-webhooks

free apis: https://github.com/toddmotto/public-apis
