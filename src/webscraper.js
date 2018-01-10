/**
 * Created by khopf on 10/01/2018.
 */
var request = require('request');
var q = require('q');

function scrapeUrl(sUrl)
{
	const deferred = q.defer();
	request(sUrl, function (err, response, html)
	{
		if (err && response !== 200)
		{
			console.log("Something happened when scraping " + sUrl);
			console.log(err);
			deferred.reject(err);
		}
		else
		{
			deferred.resolve(html);
		}
	});
	return deferred.promise;
}

module.exports.scrapeUrl = scrapeUrl;
