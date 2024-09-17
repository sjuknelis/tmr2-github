import { readFileSync } from "fs";
import OpenAI from "openai";
import type { BillVoteUrls, SearchResponse } from "./types";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY
});

const billVoteUrls: BillVoteUrls[] = JSON.parse(readFileSync("votes.json").toString());
const indexedTitles = billVoteUrls.map((bill, index) => {return {title: bill.title, index}});

export async function makeSearchResponse(title: string): Promise<SearchResponse> {
    try {
        return await attemptSearch(title);
    } catch (e) {
        console.error(e);
        return null;
    }
}

async function attemptSearch(title: string): Promise<SearchResponse> {
    const completion = await openai.chat.completions.create({
        messages: [{role: "user", content: `I am trying to find the most relevant bills passed in the US Congress relating to this article: "${title}" Provide a JSON list comprising the top three keywords in this title that I can use to search my database of bills. Do not include any other information in your response. Each key word must be one word exactly. Ignore the name of the news organization in the article title.`}],
        model: "gpt-4o"
    });
    let content = completion.choices[0].message.content || "";
    if (content.startsWith("```json")) content = content.slice(7, -3).trim();
    console.log(content);
    let keywords: string[] = JSON.parse(content);
    keywords = keywords.map(keyword => keyword.toLowerCase());

    const matchingBillVoteUrls = keywords
        .map(keyword => indexedTitles.filter(({title}) => title.toLowerCase().indexOf(keyword) > -1))
        .reduce((a, b) => a.concat(b))
        .map(({index}) => billVoteUrls[index])
        .filter(bill => bill.voteUrls.some(url => url.indexOf("house") > -1))
        .slice(0, 4);

    return {
        keywords,
        billVoteUrls: matchingBillVoteUrls
    }
}