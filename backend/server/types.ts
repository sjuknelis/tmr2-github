export type SearchResponse = {
    keywords: string[],
    billVoteUrls: BillVoteUrls[]
} | null

export type BillVoteUrls = {
    title: string,
    voteUrls: string[]
}

export type BillData = {
    keywords: string[],
    bills: Bill[]
}

export type Bill = {
    title: string,
    voteQuestion: string,
    voteTable: {
        democratic: PartyVote,
        republican: PartyVote,
        independent: PartyVote,
        localRep: Vote
    }
}

export type PartyVote = {
    yes: number,
    no: number,
    notVoting: number
}

export type Party = "democratic" | "republican" | "independent";

export type Vote = "yes" | "no" | "notVoting";

export type LocalRep = {
    data: {
        firstName: string,
        lastName: string,
        partyLetter: string,
        state: string,
        district: number
    } | null
}