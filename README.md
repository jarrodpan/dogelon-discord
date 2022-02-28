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
Clone repo then `npm init` to install dependencies, then `node app.js` to run. Plan is to containerise with Docker at some point so i can familiarise myself with that. You'll need to set a `.env` file with your discord bot token.

## TODO List
- error handling sucks so the bot dies if the data is bad and spews a bunch of stuff to the terminal
- Cache API responses so we aren't hitting the API while the stock market is closed
  - 5 min delay for stocks when market is open, until next open when market is closed
  - 1 min for crypto because it's 24/7
- Add little pictures of the stocks/coins, whether to host/hotlink/upload I havent decided (will host eventually)
- idk can add like coin flips and d20 rolls or whatever
- code is all inline, need to refactor into modules
- as above, need to write proper parsing engine thing
- presence updates
- API rate limiting
- private messages dont work
- weather info might be cool to add

## Link dump for my use

Guide for development: https://stackabuse.com/guide-to-creating-a-discord-bot-in-javascript-with-discordjs-v13/

An API endpoint I can abuse until yahoo blocks me: https://query1.finance.yahoo.com/v10/finance/quoteSummary/ASX.AX?formatted=true&lang=en-AU&region=AU&modules=price%2CsummaryDetail%2CpageViews%2CfinancialsTemplate&corsDomain=au.finance.yahoo.com

Development, deployment and bears - oh my! https://www.smashingmagazine.com/2021/02/building-discord-bot-discordjs/