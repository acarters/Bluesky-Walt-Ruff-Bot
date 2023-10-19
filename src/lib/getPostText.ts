import * as Mastodon from 'tsl-mastodon-api';


const mastodon = new Mastodon.API({access_token: 'PRZhmwmS5fpkXo442UE8SGHv8TL7XOiqjhpOh49heb0', api_url: 'https://mastodon.social/api/v1/'});

export default async function getPostText() {
//var account = await mastodon.getAccount();

var account = await mastodon.getStatuses("109764698354053424", {'limit':1});
var string = JSON.stringify(account);
var parse = JSON.parse(string);
var jsonObj = parse["json"];
var string2 = JSON.stringify(jsonObj);
var parse2 = JSON.parse(string2);
var jsonObj2 = parse2[0]["content"];
var string3 = JSON.stringify(jsonObj2);
var reg = new RegExp("<(:?[^>]+)>", "g");
var split = string3.replace(reg, "");
split = split.slice(1,-1);
console.log(`string3: ${string3}`);
console.log(`split: ${split}`);


  // Generate the text for your post here. You can return a string or a promise that resolves to a string
  return split;
}
