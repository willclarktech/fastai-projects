const fs = require("fs");
const rp = require("request-promise");
const $ = require("cheerio");

const sleep = (ms = 5000) =>
	new Promise(resolve => {
		setTimeout(resolve, ms);
	});

const getLinks = url =>
	rp(url).then(html =>
		Array.from($("#listAlbum", html).children("a")).map(el => el.attribs.href),
	);

const getLyrics = url =>
	rp(url)
		.then(html => $(".main-page .row .col-lg-8 div", html)[6])
		.then(html => $.load(html).text());

const saveLyrics = dirName => (lyric, i) =>
	fs.writeFileSync(`./data/${dirName}/${i}.txt`, lyric);

const saveBritney = saveLyrics("spears");
const saveJustin = saveLyrics("bieber");

const baseUrl = "https://www.azlyrics.com/";
const britneyLinksPage = `${baseUrl}s/spears.html`;
const justinLinksPage = `${baseUrl}j/justinbieber.html`;

async function main() {
	const [britneyLinks, justinLinks] = (await Promise.all([
		getLinks(britneyLinksPage),
		getLinks(justinLinksPage),
	])).map(links =>
		links
			.filter(link => !link.startsWith("http"))
			.map(link => `${baseUrl}${link.slice(3)}`),
	);
	console.info(`Got Britney links (${britneyLinks.length})`);
	console.info(`Got Justin links (${justinLinks.length})`);

	for (let i = 0; i < britneyLinks.length; ++i) {
		await sleep();
		const link = britneyLinks[i];
		console.info(`Getting ${link}`);
		const lyrics = await getLyrics(link);
		saveBritney(lyrics, i);
	}
	for (let i = 0; i < justinLinks.length; ++i) {
		await sleep();
		const link = justinLinks[i];
		console.info(`Getting ${link}`);
		const lyrics = await getLyrics(link);
		saveJustin(lyrics, i);
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
