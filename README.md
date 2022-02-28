# Dogelon - A not-so-stupid discord bot
This is Dogelon, a robot built with discord.js and a handful of other libraries.

After playing with some bots on Discord I found that none of them met my needs, which was:

- Stock information on request, but not as a single line command (needs to be inline), and nothing for Australian stocks!
- Crypto contained within as well, lots of bots do _some_ crypto with stocks, but not the whole lot from CoinMarketCap
- Subreddit names don't link inline which for some reason FB Messenger does, so should do that too
- Any other junk i think is funny or could be useful (dice rolls, coin flips, the age-old question of "what's ligma?")
- Most of all, some bots aren't online all the time. This will improve my CI/CD skills by deploying to Heroku for 24/7 service while I am not online.

## To run
Clone repo then `npm init` to install dependencies, then `node app.js` to run. Plan is to containerise with Docker at some point.

## Link dump for my use

Guide for development: https://stackabuse.com/guide-to-creating-a-discord-bot-in-javascript-with-discordjs-v13/

An API endpoint I can abuse until yahoo blocks me: https://query1.finance.yahoo.com/v10/finance/quoteSummary/ASX.AX?formatted=true&lang=en-AU&region=AU&modules=price%2CsummaryDetail%2CpageViews%2CfinancialsTemplate&corsDomain=au.finance.yahoo.com

Development, deployment and bears - oh my! https://www.smashingmagazine.com/2021/02/building-discord-bot-discordjs/