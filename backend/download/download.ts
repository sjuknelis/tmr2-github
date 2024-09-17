import { readFile, writeFile } from "fs/promises";

const API_KEY = "xyz";

type Bill = {
    type: string,
    number: string,
    title: string,
    laws: object[] | undefined
}

type BillAPIResponse = {
    bills: Bill[],
    pagination: {
        count: number
    }
}

type Action = {
    text: string,
    recordedVotes: [
        {
            url: string
        }
    ] | undefined
}

type ActionAPIResponse = {
    actions: Action[],
    error: object | undefined
}

type BillWithVotes = {
    type: string,
    number: string,
    title: string,
    voteUrls: string[]
}

async function downloadBills(status: string, type: string): Promise<Bill[]> {
    console.log(status, type);
    let bills: Bill[] = [];

    let offset = 0, offsetLimit = 1;
    while (offset < offsetLimit) {
        const response: BillAPIResponse = await (await fetch(`https://api.congress.gov/v3/${status}/118/${type}?api_key=${API_KEY}&offset=${offset}&limit=250&format=json`)).json() as BillAPIResponse;

        bills = bills.concat(response.bills);
        offsetLimit = response.pagination.count;
        console.log(offset + "/" + offsetLimit);
        offset += 250;
    }

    return bills;
}

async function saveAllBills() {
    const billTypes = ["hr", "s", "hres", "sres", "hjres", "sjres", "hconres", "sconres"];
    let bills: Bill[] = [];

    for (const type of billTypes) bills = bills.concat(await downloadBills("bill", type));
    bills = bills.concat(await downloadBills("law", "pub"));

    await writeFile("bills.json", JSON.stringify(bills, null, 4));
}

async function downloadVoteUrls(status: string, type: string, number: string): Promise<string[]> {
    const response: ActionAPIResponse = await (await fetch(`https://api.congress.gov/v3/${status}/118/${type}/${number}/actions?api_key=${API_KEY}&limit=250&format=json`)).json() as ActionAPIResponse;

    console.log(response)
    if (response.error) throw "rate limit";
    return response.actions
        .filter(action => action.recordedVotes != undefined && action.text.toLowerCase().indexOf("pass") > -1)
        .map(action => (action.recordedVotes || [{ url: "" }])[0].url);
}

async function saveAllVotes(offset: number, limit: number) {
    const bills: Bill[] = JSON.parse((await readFile("bills.json")).toString());

    const votes: BillWithVotes[] = [];
    let index = offset;
    for (; index < offset + limit; index++) {
        console.log(index);
        const bill = bills[index];
        const status = bill.laws ? "law" : "bill";

        try {
            const voteUrls = await downloadVoteUrls(status, bill.type.toLowerCase(), bill.number);
            if (voteUrls.length != 0) {
                votes.push({
                    type: bill.type,
                    number: bill.number,
                    title: bill.title,
                    voteUrls
                });
            }
        } catch (e) {
            console.log(e);
            break;
        }
    }

    await writeFile(`votes_${offset}_${index}.json`, JSON.stringify(votes, null, 4));
}

saveAllVotes(16042, 107 - 42);

// 0 rate limit at 10:37 pm
// 16107 total bills