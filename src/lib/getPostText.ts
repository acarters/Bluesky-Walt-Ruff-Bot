import * as Mastodon from 'tsl-mastodon-api';
const mastodon = new Mastodon.API({access_token: 'PRZhmwmS5fpkXo442UE8SGHv8TL7XOiqjhpOh49heb0', api_url: 'https://mastodon.social/api/v1/'}); // access the Mastodon API using the access token.


/*
	getPostText():

	This function performs a Mastodon API GET request to get the most recent Tweet created by Walt Ruff. Using this, the function formats this string down into the desired plaintext of a Bluesky post, stripping out all of the unnecessary HTML formatting and handling formatting in a format compatible with Bluesky.

	args: None

	returns: A string representing the desired text of the Bluesky post we want to create.
*/
export default async function getPostText() 
{

	const limitVal = 10;


	var pReg = new RegExp("</p><p>", "g"); // A regex to deal with <p></p>. This should create a new section in the text, which we do via 2 line breaks.
	var brReg = new RegExp("<br>", "g"); // A regex to deal with <br>. This should go to the next line, which we do via a line break. 
	var quoteReg = new RegExp(`\\\\"`, "g");
	var andReg = new RegExp("&amp;", "g");
	var tagReg = new RegExp("<(:?[^>]+)>", "g"); // A general regex for HTML. Used to get the plaintext value of the mastodon post without tag notation.

	var awaitTweet = await mastodon.getStatuses("109764698354053424", {'limit':limitVal}); //Use the Mastodon API to get 1 most recent tweet from Walt Ruff's account.
	var string = JSON.stringify(awaitTweet); // Convert the tweet into a JSON string.
	var objJSON = JSON.parse(string)["json"]; // Convert the JSON string back to a JSON object. Kinda silly, but it doesn't work otherwise. 

	var stringArr = [];
	for (let i = 0; i < limitVal; i++) 
	{
		var contentJSON = objJSON[i]["content"]; // Convert the JSON string back to a JSON object. Kinda silly, but it doesn't work otherwise. Then go through all the array settings to get just the content of the post. 
		var contentString = JSON.stringify(contentJSON); // Convert the content of the post into a JSON string.
		contentString = contentString.slice(1,-1); // Remove the quotation marks.
		contentString = contentString.replace(quoteReg, `"`).replace(andReg, "&").replace(pReg, "\n\n").replace(brReg, "\n").replace(tagReg, ""); // First use the <p> and <br> regex to apply appropriate spacing. Then use the general regex to remove the HTML formatting from the mastodon post. 
		stringArr.push(contentString);
	}
	var finalString = stringArr.join("\/");
	return finalString;

}
