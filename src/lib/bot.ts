import { bskyAccount, bskyService } from "./config.js";
import type {
  AtpAgentLoginOpts,
  AtpAgentOpts,
  AppBskyFeedPost,
} from "@atproto/api";
import atproto from "@atproto/api";
const { BskyAgent, RichText } = atproto;

type BotOptions = 
{
  service: string | URL;
  dryRun: boolean;
};

export default class Bot {
  #agent; // Private value containing our bluesky agent.
  public rootCid: string; // Public variable in the class to store the CID of the most recent non-reply post, the root we need for replies. 
  public rootUri: string; // Public variable in the class to store the URI of the most recent non-reply post, the root we need for replies. 

  static defaultOptions: BotOptions = 
  {
    service: bskyService, // Variable detailing the service we want to initialize the Bluesky agent on.
    dryRun: false, // Change this to true if you want the bot to not actually post to Bluesky for testing purposes.
  } as const; // The options can't be changed mid-execution. Change these manually in source code if you want them to be different.

  /*
    constructor(service):

    This function sets the parameters of the Bot object on initialization.

    args:
      service: An AtpAgentOpts value that specifies what Bluesky service to use.
      
    returns: void
  */
  constructor(service: AtpAgentOpts["service"]) 
  {
    this.#agent = new BskyAgent({service}); // Initialize the Bluesky agent on the specified service. Allows us to interface with the Bluesky API.
    this.rootCid = ""; // Initialize the root CID as the empty string. Only define this as a value when attempting to post a reply.
    this.rootUri = ""; // Initialize the root URI as the empty string. Only define this as a value when attempting to post a reply.
  }

  /*
    login(loginOpts):

    This function logs the Agent into the Bluesky account.

    args:
      loginOpts: an AtpAgentLoginOpts object that specifies the options to be used to login. 

    returns: The output of an Agent.login request.
  */
  login(loginOpts: AtpAgentLoginOpts) 
  {
    return this.#agent.login(loginOpts); // Login to Bluesky using the specified login details. Allows us to access Bluesky via the account we are logging in.
  }

  /*
    post(isReply, text):

    This function performs a Bluesky POST request to the agent that has been logged in, posting the plaintext supplied by the text argument. Checks the text first to ensure that the text has not been posted recently by this user, and that the text is not blank. If either of these are the case, return an arbitrary value instead.

    args:
      isReply: boolean value that determines whether the post is made as a reply to the previous post made, or as a root post. Use isReply == 0 for a root post, isReply == 1 for a reply to the previous post.
      text: string or record (but usually string) value that determines the plaintext to post. 

    returns: The output of a successful Agent.post request if successful, int 37 on invalid input.
  */
  async post
  (
    isReply: boolean, text:
      | string
      | (Partial<AppBskyFeedPost.Record> &
          Omit<AppBskyFeedPost.Record, "createdAt">)
  ) 
  {
    const postNum = 10; // Specify the number of recent posts to compare from the logged in user's feed.
    var bskyFeedAwait = await this.#agent.getAuthorFeed({actor: "notwaltruff.bsky.social", limit: postNum + 2,}); // Get a defined number + 2 of most recent posts from the logged in user's feed.
    var bskyFeed = bskyFeedAwait["data"]["feed"]; // Filter down the await values so we are only looking at the feeds.
    var bskyFeed0 = bskyFeed[0]; // Select post 0, the most recent post made by this user.
    var bskyPost0 = bskyFeed0["post"]; // Filter down the values of the post so we can look at the params.
    var parentId = {uri: "", cid: ""}; // Initialize the parent ID as 2 empty strings. This should never matter, because it shouldn't be possible to use parentId without assigning it.
    if (isReply == false) // Check if this is not a reply, meaning it is a root post.
    {
      this.rootUri = ""; // Reset the root URI to the empty string, since we are no longer replying under a previous post.
      this.rootCid = ""; // Reset the root CID to the empty string, since we are no longer replying under a previous post.
    }
    else // If this is a reply
    {
      var bskyUri = bskyPost0["uri"]; // Collect the URI from the most recent post by the logged in user.
      var bskyCid = bskyPost0["cid"]; // Collect the CID from the most recent post by the logged in user.
      parentId = {uri: bskyUri, cid: bskyCid}; // Create an ID object using the URI and CID from the most recent post.
      if (this.rootUri == "") // Only change the root once per thread. Root stays constant regardless of if this is post 2 or post 37.
      {
        this.rootUri = bskyUri; // Change the root URI to be the most recent post's URI.
        this.rootCid = bskyCid; // Change the root CID to be the most recent post's CID.
      }
    }
    for (let i = 0; i < postNum; i++) // Consider 2 less posts than were collected. 
    {
      var bskyPost = bskyFeed[i]; // Get the post i from the collected Bluesky feed.
      var bskyRecord = bskyPost["post"]["record"]; // Filter post i down so we are only considering the record.
      var bskyText = Object.entries(bskyRecord)[0][1]; // Accessing the values from here is weird, so I put them all in an array and access the one corresponding to text (0,1).
      if (text === bskyText || text === "") // Check if the text we are trying to post has already been posted in the last postNum posts, or is empty. Might change empty conditional if I get images working.  
      {
        return "37"; // Output an arbitrary value that can be treated as a fail code. Could be anything, I picked 37 because I like the number 37. 
      }
    }
    if (typeof text === "string") // Check that text is a string (This should always be the case in this codebase, but it seems to break if I get rid of the option for it to not be.)
    {
      const richText = new RichText({text}); // Create a new RichText object from our text string. Sorta arcane object type detailed in ATProto API.
      await richText.detectFacets(this.#agent); // Detect facets from the agent.
      var record; // Create empty record variable that we will put our post details into.
      if (isReply == true) // If we are trying to post a reply
      {
        var rootId = {uri: this.rootUri, cid: this.rootCid}; // Format the root URI and root CID from the public object variables into a form that can be used.
        record = 
        {
          text: richText.text, // Specify the text of our post as the text in the RichText obj (should be our plaintext string)
          facets: richText.facets, // Specify the facets of our post to be the facets of the RichText.
          reply: {root: rootId, parent: parentId,}, // Specify the reply details. Make the root the values from our public root variables, make the parent the ID values collected from this function (the ones from the most recent post)
        };
      }
      else // If we are trying to post a root post
      {
        record = 
        {
          text: richText.text, // Specify the text of our post as the text in the RichText obj (should be our plaintext string)
          facets: richText.facets, // Specify the facets of our post to be the facets of the RichText.
        };
      }
      return this.#agent.post(record); // Post the record we have specified using the Bluesky agent, return the output from doing this.
    }
    else // If we are trying to post text not in the format of a string. Shouldn't happen in this unmodified codebase, I don't think
    {
      return this.#agent.post(text); // Post the raw text value using the Bluesky agent, return the output from doing this.
    }
  }

  /*
    run(getPostText, botOptions?):

    This function creates the Bot object, collects recent Mastodon posts from the desired Mastodon account, and queues Bot.post requests. This function is also responsible for parsing text from HTML to plaintext, and chunking text longer than 300 characters.

    args:
      getPostText: function value that returns a string value, which is then parsed out into a String[] value. Used to get the most recent Mastodon posts. 
      botOptions?: optional BotOptions value that allows us to change the settings of the bot as needed. Default is usually fine. 

    returns: void
  */
  static async run(
    getPostText: () => Promise<string>,
    botOptions?: Partial<BotOptions>
  ) 
  {
    const { service, dryRun } = botOptions
      ? Object.assign({}, this.defaultOptions, botOptions) //Set the bot's options.
      : this.defaultOptions;
    const bot = new Bot(service); // Instantiate a constant bot value as a new Bot under the supplied Bluesky service.
    await bot.login(bskyAccount); // Log the bot into the specified Bluesky account determined by the bskyAccount value.
    const mastodonAwait = await getPostText(); // Get the desired number of recent Mastodon posts from the specified user in getPostText.
    var mastodonArr = mastodonAwait.split("\/"); // mastodonAwait is a string value that is subdivided by "\/". Turn it into an array of values that we can reason on individually. Clunky implementation but it works without changing getPostText's signature too much. 
    if (!dryRun) // Make sure that we don't wanna run the bot without posting. Tbh, I think I might have broken this feature through my changes to the source code. May need to reimplement dry run as a working option when I generalize the code for other purposes.
    { 
      for (let i = mastodonArr.length - 1; i >= 0; i--) // Iterate over the recent Mastodon posts in reverse sequential order. -1 may not be necessary, do some more testing.
      {
        if (mastodonArr[i].length <= 300) // Simple case, where a post is 300 characters or less, within the length bounds of a Bluesky post.
        {
          await bot.post(false, mastodonArr[i]); // Run bot.post on this text value, posting to Bluesky if the text is new. Post this as a root value.
        }
        else // Complicated case where a post is longer than 300 characters, longer than a valid Bluesky post. 
        {
          var postLen = mastodonArr[i].length; // Get the post's length. This will be > 300. 
          var numberOfPosts = ~~(postLen / 294) + 1; // Calculate the number of posts needed, by int dividing the post length by 294. Add 1 to deal with remainder.
          for (let j = 0; j < numberOfPosts; j++) // Iterate over the number of posts needed. I recognize that this is O(n^2), but the n value will always be low so it's not a big issue.
          {
            var partialStr = mastodonArr[i].slice((j * 294), (j * 294 + 294)) + " [" + (j + 1) + "/" + numberOfPosts + "]"; // Create this new chunked post by taking the next 294 bits. Concatenate them with a "[j+1/numberOfPosts]" construction to tell the user what post they are on, and how many posts in the thread are left.
            if (j == 0) // If we are on the first iteration
            {
              await bot.post(false, partialStr); // If j == 0, we have yet to post anything. Therefore, we want this to be a root value rather than a reply. Run bot.post on the partial text value with isReply set to false.
            }
            else // If we are not on the first iteration
            {
              await bot.post(true, partialStr); // If j != 0, we have already posted our root post. Therefore, we want this to be a reply to that root post. Run bot.post on the partial text value with isReply set to true.
            }
          }
        }
      }
    }
    return; // Return void, we're done. 
  }
}