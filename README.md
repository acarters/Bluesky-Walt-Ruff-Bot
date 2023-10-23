# Walt Ruff Bluesky Bot

This is a bot that automatically reposts the Twitter posts of Carolina Hurricanes reporter, Walt Ruff to [Bluesky](https://bsky.app/). Because the Twitter API now costs money to use, this bot instead collects data from the Walt Ruff Mastodon API created by sportsbots.xyz. It uses [TypeScript](https://www.typescriptlang.org/) to build the bot and [GitHub Actions](https://docs.github.com/en/actions) to schedule the posts. Although this repository is specifically for Walt Ruff, this codebase could be leveraged to produce bots to repost other Mastodon profiles to Bluesky without too much additional effort. I plan to do this for @Canes in the future, once the featureset is sufficiently dense. 

This bot used the [Bluesky Bot Template](https://github.com/philnash/bsky-bot) created by Phil Nash as a beginning codebase to work from. Thanks, Phil!

* [Current Feature Set](#current-feature-set)
  * [Schedule](#schedule)
  * [Reposting](#reposting)
  * [Iterative Post Clustering](#iterative-post-clustering)
  * [Parsing Long Posts](#parsing-long-posts)
* [Things To Do](#things-to-do)
* 


## Current Feature Set

### Schedule
This bot uses the GitHub Actions interface to automatically run the code. It has a cron specified to post every 5 minutes, but in reality it is considerably slower in most cases. Average time taken between executions seems to be around 10-15 minutes during normal times, and upwards of 25-45 minutes during busy times.

### Reposting
This bot uses the Mastodon Walt Ruff API to collect tweets created by Walt Ruff. The Mastodon API returns content values in HTML, so considerable regex formatting is needed in order to get the content into a plaintext value that can be used by the Bluesky API. This Mastodon API is flawed, leading some posts to not be collected and given to my bot. This is not really a workable problem for me, as my code sees the Mastodon API as a black box, and I am essentially forced to play telephone with the posts through a middleman unless I am willing to spend the money to pay Elon Musk for Twitter API. Instead, I cannot guarantee that this bot will repost every post made by Walt Ruff on Twitter. Instead, I guarantee that this bot will repost all posts collected by the Mastodon API. 

### Iterative Post Clustering 
Because the execution occurs in inconsistent intervals and it is possible that Walt Ruff posts large amounts of posts at a time, this API takes a iterative approach to posting. When executed, the bot collects a constant number of posts already made by the bot, and a constant number of posts from the Mastodon API. The bot checks each Mastodon post, ensuring that they do not match with any of the posts already posted. If the posts match, the post is discarded to avoid duplicates. If the post does not match, this post has not been posted by the bot yet, and the bot posts it. This iterative process goes in reverse sequential order, ensuring that the bot posts old posts before trying to post new posts, ensuring that even during long wait times between executions, the bot does not miss a post.

### Parsing Long Posts
When Elon Musk purchased twitter, he allowed Twitter Blue accounts to post ridiculously long posts. Walt Ruff is a Twitter Blue member, and sometimes uses this feature. However, Bluesky still has a 300 character limit on posts. To remedy this, the Walt Ruff parses posts longer than 300 characters into multiple smaller posts. These posts are 295 characters long, and include a 5 character "[.../...]" counter to allow a reader to know that a post is part of a larger post. In the future, I would prefer these chunked posts to be replies to one another. 

## Things To Do
