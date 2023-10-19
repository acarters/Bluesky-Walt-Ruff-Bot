import * as Mastodon from 'tsl-mastodon-api';


const mastodon = new Mastodon.API({access_token: 'PRZhmwmS5fpkXo442UE8SGHv8TL7XOiqjhpOh49heb0', api_url: 'https://mastodon.social/api/v1/'});

export default async function getPostText() {
//var account = await mastodon.getAccount();

var account = await mastodon.getStatuses("109764698354053424", {'limit':1});
var string = JSON.stringify(account);
var jsonObj = JSON.parse(string)["json"];
var string2 = JSON.stringify(jsonObj);
var parse2 = JSON.parse(string2);
var jsonObj2 = parse2[0]["content"];
var string3 = JSON.stringify(jsonObj2);
var reg = new RegExp("<(:?[^>]+)>", "g");
var pReg = new RegExp("</p><p>", "g");
var brReg = new RegExp("<br>", "g");
var split = string3.replace(pReg, "\n\n").replace(brReg, "\n").replace(reg, ""); // Use the regex to remove the HTML formatting from the mastodon 
split = split.slice(1,-1); // Remove the quotation marks.
  return split;
}
