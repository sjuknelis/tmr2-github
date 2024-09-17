import { getLocalRep } from "./getLocalRep";
import { getTabTitle } from "./chrome";
import { Bill, BillData, BillVoteUrls, LocalRep, PartyVote, SearchResponse, Vote } from "./types";

const SEARCH_URL = "https://tmr-server-1f5caa7aa813.herokuapp.com";

export async function getBillData(): Promise<BillData | null> {
    const title = await getTabTitle();
    const response: SearchResponse = await (await fetch(`${SEARCH_URL}/s?t=${title}`)).json();

    if (!response) return null;

    if (response.billVoteUrls.length == 0) return null;

    return {
        keywords: response.keywords,
        bills: await Promise.all(response.billVoteUrls.map(getProcessedBill))
    }
}

async function getProcessedBill(billVoteUrls: BillVoteUrls): Promise<Bill> {
    const url = billVoteUrls.voteUrls.filter(url => url.indexOf("house") > -1)[0];

    const xmlData = await (await fetch(url)).text();
    const doc = new DOMParser().parseFromString(xmlData, "application/xml");

    const partyVoteDocs = doc.getElementsByTagName("totals-by-party");
    let localRepVote = getLocalRepVote(await getLocalRep(), doc);
    
    return {
        title: billVoteUrls.title,
        voteQuestion: doc.getElementsByTagName("vote-question")[0].innerHTML,
        voteTable: {
            republican: getPartyVote(partyVoteDocs[0]),
            democratic: getPartyVote(partyVoteDocs[1]),
            independent: getPartyVote(partyVoteDocs[2]),
            localRep: localRepVote
        }
    }
}

function getPartyVote(partyVoteDoc: Element): PartyVote {
    return {
        yes: parseInt(partyVoteDoc.getElementsByTagName("yea-total")[0].innerHTML),
        no: parseInt(partyVoteDoc.getElementsByTagName("nay-total")[0].innerHTML),
        notVoting: parseInt(partyVoteDoc.getElementsByTagName("present-total")[0].innerHTML) +
            parseInt(partyVoteDoc.getElementsByTagName("not-voting-total")[0].innerHTML)
    }
}

const removeAccents = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function getLocalRepVote(rep: LocalRep, doc: Document): Vote {
    const repData = rep.data;
    if (!repData) return "notVoting";

    const repLastName = removeAccents(repData.lastName);
    let repItem = doc.querySelector(`[sort-field="${repLastName}"]`);
    if (!repItem) repItem = doc.querySelector(`[sort-field="${repLastName} (${repData.state})"]`);
    if (!repItem) return "notVoting";

    const repVoteText = repItem.parentElement?.getElementsByTagName("vote")[0].innerHTML || "no";
    return {
        "Yes": "yes",
        "Yea": "yes",
        "No": "no",
        "Nay": "no",
        "Present": "notVoting",
        "Not Voting": "notVoting"
    }[repVoteText] as Vote;
}