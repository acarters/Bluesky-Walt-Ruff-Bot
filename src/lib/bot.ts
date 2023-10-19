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

    var waltsFeed = await this.#agent.getAuthorFeed({actor: "notwaltruff.bsky.social", limit: 1,});
    var waltsReducedFeed = waltsFeed["data"]["feed"][0]["post"]["record"];
    var waltArr = Object.entries(waltsReducedFeed);
    var lastPost = waltArr[0][1];
    console.log(lastPost);
    console.log(text);
    console.log(lastPost === text)

    if (lastPost === text)
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
    const text = await getPostText();
    if (!dryRun) {
      await bot.post(text);
    }
    return text;
  }
}
