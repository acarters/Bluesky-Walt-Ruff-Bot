import { bskyAccount, bskyService } from "./config.js";
import type {
  AtpAgentLoginOpts,
  AtpAgentOpts,
  AppBskyFeedPost,
} from "@atproto/api";
import atproto from "@atproto/api";
const { BskyAgent, RichText } = atproto;

type BotOptions = {
  service: string | URL;
  dryRun: boolean;
};

export default class Bot {
  #agent;

  static defaultOptions: BotOptions = {
    service: bskyService,
    dryRun: false,
  } as const;

  constructor(service: AtpAgentOpts["service"]) {
    this.#agent = new BskyAgent({ service });
  }

  login(loginOpts: AtpAgentLoginOpts) {
    return this.#agent.login(loginOpts);
  }

  async post(
    text:
      | string
      | (Partial<AppBskyFeedPost.Record> &
          Omit<AppBskyFeedPost.Record, "createdAt">)
  ) {

    var bskyFeedAwait = await this.#agent.getAuthorFeed({actor: "notwaltruff.bsky.social", limit: 12,});
    var bskyFeed = bskyFeedAwait["data"]["feed"];
    console.log('bskyFeed: %s\n', bskyFeed);
    var stringArr = [];
  for (let i = 0; i < 10; i++) 
  {
    console.log(i);
    var bsky0 = bskyFeed[i];
    var bsky = bsky0["post"]["record"];
    var bskyArr = Object.entries(bsky);
    var bskyText = bskyArr[0][1];
    if (text === bskyText || text === "")
    {
      console.log("failed on %d\n", i);
      return "37";
    }
    stringArr.push(bskyText);
  }
  console.log('Bluesky string array: %s\n', stringArr);

    console.log(text === stringArr[0])


      if (typeof text === "string") {
        const richText = new RichText({text});
        await richText.detectFacets(this.#agent);
        const record = {
          text: richText.text,
          facets: richText.facets,
        };
        return this.#agent.post(record);
      } else {
        return this.#agent.post(text);
      }
  }

  static async run(
    getPostText: () => Promise<string>,
    botOptions?: Partial<BotOptions>
  ) {
    const { service, dryRun } = botOptions
      ? Object.assign({}, this.defaultOptions, botOptions)
      : this.defaultOptions;
    const bot = new Bot(service);
    await bot.login(bskyAccount);
    const mastodonAwait = await getPostText();
    const mastodonArr = mastodonAwait.split("\/");

    console.log('Mastodon string array: %s\n', mastodonArr);

    if (!dryRun) {
      for (let i = 10 - 1; i >= 0; i--) 
      {
        //var img = {imgpath: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fchorus.fm%2Fwp-content%2Fuploads%2F2016%2F05%2Fcc.jpg&f=1&nofb=1&ipt=ad629262928e0166e2f43e1535d9fbeb6f4f33ba24064c97eb667f47a0a26266&ipo=images', $type: 'image/jpeg', alttext: 'A jagged bolt of lightning strikes a large building',}

        if (mastodonArr[i].length <= 300)
        {
          await bot.post(mastodonArr[i]);//, embed: img});
        }
        else
        {
          var postLen = mastodonArr[i].length;
          var numberOfPosts = ~~(postLen / 294) + 1;
          console.log("sliced! %d\n", numberOfPosts);

          for (let j = 0; j < numberOfPosts; j++)
          {
          console.log("(" + j * 295 + "," + (j * 295 + 294) + ")\n");
          var partialStr = mastodonArr[i].slice((j * 294), (j * 295 + 294)) + " [" + (j + 1) + "/" + numberOfPosts + "]";
          /*if (j != 0)
          {
            partialStr = '"' + partialStr; 
          }*/
          await bot.post(partialStr);
          }
        }
      }
    }
    return mastodonArr[0];
  }
}
