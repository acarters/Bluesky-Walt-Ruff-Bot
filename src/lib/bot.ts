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

    var bskyFeedAwait = await this.#agent.getAuthorFeed({actor: "notwaltruff.bsky.social", limit: 5,});
    var bskyFeed = bskyFeedAwait["data"]["feed"];
    console.log('bskyFeed: %s\n', bskyFeed);
    var stringArr = [];
  for (let i = 0; i < 5; i++) 
  {
    console.log(i);
    var bsky0 = bskyFeed[i];
    var bsky = bsky0["post"]["record"];
    var bskyArr = Object.entries(bsky);
    console.log(bskyArr[0][1]);
    var bskyText = bskyArr[0][1];
    stringArr.push(bskyText);
  }
  console.log('bot.ts string array: %s\n', stringArr);

    console.log(text === stringArr[0])

    if (text === stringArr[0])
    {
      return "37";
    }
    else
    {
      if (typeof text === "string") {
        const richText = new RichText({ text });
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
    const textAwait = await getPostText();
    const textArr = textAwait.split("\/");


    const text0 = textArr[0];
    if (!dryRun) {
      await bot.post(text0);
    }
    return text0;
  }
}
