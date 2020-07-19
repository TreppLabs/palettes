// usage:
//     node Scraper-colorhunt.js <start> <finish>
// 
// Or
//    ./scrapeloop-colorhunt.sh  
//
// Scrape some palettes 
// Website "Colorhunt.co" has 4-color palettes
// individual palette screens with URLs of the form
//    https://colorhunt.co/palette/174976
// (Numbering is a bit sparse--not all numbers have palettes)
// within HTML, lines containing "itemer" have the 24-character palette string
// NOTE:
//  output includes all requests, most of which return nothing, need to prune to get json palettes

const fs = require('fs');
const cheerio = require('cheerio');
const got = require('got');

function extractPalette(s) {
  // String s should look something like:
  //   itemer('0','174976', 'f4eeffdcd6f7a6b1e1424874', '03/02/20', '4170');$('.item[data-id=174976]').addClass('focus').find('.palette a').removeAttr('href'); $('body').addClass('single'); focus('Purple Blue Cold Pastel');
  // we want the palette:
  //   f4eeffdcd6f7a6b1e1424874
  // slice s on commas
  // take third piece
  // remove leading spaces
  // take part between single quotes
  // expect 24 hex chars (4 x RGB values)
  var s2 = s.split(',')[2];  // third comma-delimited piece
  var i = s2.indexOf("'");
  var j = s2.indexOf("'", i+1);
  var s3 = s2.substring(i+1,j);
  if (s3.length !== 24) {
  	console.log("not 24 chars!?!??!" + s3);
  }
  return s3;
}

function extractPaletteId(s) {
  var s2 = s.split(',')[1];  // Id in second comma-delimited piece
  var i = s2.indexOf("'");
  var j = s2.indexOf("'", i+1);
  var s3 = s2.substring(i+1,j);
  return s3;
}

function extractDate(s) {
  var s2 = s.split(',')[3];  // date in fourth comma-delimited piece
  var i = s2.indexOf("'");
  var j = s2.indexOf("'", i+1);
  var s3 = s2.substring(i+1,j);
  return s3;
}

function extractLikes(s) {
  var s2 = s.split(',')[4];  // likes in fifth comma-delimited piece
  var i = s2.indexOf("'");
  var j = s2.indexOf("'", i+1);
  var s3 = s2.substring(i+1,j);
  return s3;
}

const startPalette = parseInt(process.argv[2]);
const finishPalette = parseInt(process.argv[3]);

for (paletteId = startPalette; paletteId < finishPalette; paletteId += 1) {
	// const paletteId = 174976;
	var url= 'https://colorhunt.co/palette/' + paletteId;
	console.log("fetching URL: " + url);


	got(url).then(response => {
	  const $ = cheerio.load(response.body);

	  // console.log("this is a test".indexOf("is", 2));

	  // print page title
	  // console.log($('title')[0]);
	  const html = $.html();
	  var i = j = 0;
	  while ((j = html.indexOf('\n', i)) !== -1) {
	  	if (((html.substring(i,j)).indexOf("itemer") !== -1)) {
	      var paletteIdString = extractPaletteId(html.substring(i,j));
	      var paletteString = extractPalette(html.substring(i,j));
	      var dateString = extractDate(html.substring(i,j));
	      var likes = extractLikes(html.substring(i,j));   // likes is an int, not a string
	      // console.log(paletteString);
	      console.log('{"id": ' + '"' + paletteIdString + '", ' +
	      	          '"color1": ' + '"' + paletteString.substring(0,6) + '", ' +
	      	          '"color2": ' + '"' + paletteString.substring(6,12) + '", ' +
	      	          '"color3": ' + '"' + paletteString.substring(12,18) + '", ' +
	      	          '"color4": ' + '"' + paletteString.substring(18,24) + '", ' +
	      	          '"likes": ' + likes + ', ' +
	                  '"date": ' + '"' + dateString + '"}');
	    }
	    i = j + 1;
	  }
	  // we could miss one last "itemer" in last line of html if no trailing '\n'
	}).catch(err => {
	  console.log(err);
	});
}