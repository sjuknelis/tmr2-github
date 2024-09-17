import { useEffect, useState } from "react";
import "./BillBox.css";
import { getLocalRep } from "./getLocalRep";
import { Bill, LocalRep, Party, Vote } from "./types";

const parties: Party[] = ["democratic", "republican", "independent"];
const votes: Vote[] = ["yes", "no", "notVoting"];
const partyColors = {
    democratic: "12, 71, 195",
    republican: "212, 52, 45",
    independent: "128, 128, 128"
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function BillBox({ bill }: { bill: Bill }) {
    function sumForParty(party: Party): number {
        return bill.voteTable[party].yes +
            bill.voteTable[party].no +
            bill.voteTable[party].notVoting;
    }

    function sumForVote(vote: Vote) {
        return bill.voteTable.democratic[vote] +
            bill.voteTable.republican[vote] +
            bill.voteTable.independent[vote];
    }

    const [localRep, setLocalRep] = useState<LocalRep | null>(null);
    useEffect(() => {
        (async () => {
            setLocalRep(await getLocalRep());
        })();
    }, []);

    if (!localRep) return null;

    return (
        <div className="card">
            <ExpandableTitle title={bill.title} />
            <p>
                <i>{bill.voteQuestion}</i>
            </p>
            <LocalRepText bill={bill} localRep={localRep} />
            <table>
                <tr>
                    <th>Breakdown by Party</th>
                    <th>Yes</th>
                    <th>No</th>
                    <th>P/NV</th>
                </tr>
                {parties.map(party => (
                    <tr>
                        <td>{capitalize(party)}</td>
                        {votes.map(vote => (
                            <td style={{
                                backgroundColor: `rgba(${partyColors[party]}, ${bill.voteTable[party][vote] / sumForParty(party) * 0.5})`
                            }}>{bill.voteTable[party][vote]}</td>
                        ))}
                    </tr>
                ))}
                <tr>
                    <td>Total</td>
                    {votes.map(vote => (
                        <td>{sumForVote(vote)}</td>
                    ))}
                </tr>
            </table>
        </div>
    );
}

function ExpandableTitle({ title }: { title: string }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <p className={`title ${expanded ? "expanded" : ""}`} onClick={() => setExpanded(!expanded)}>{title}</p>
    );
}

function LocalRepText({ bill, localRep }: { bill: Bill, localRep: LocalRep }) {
    const repData = localRep.data;
    if (!repData || repData.district == 98) return null;

    const districtText = repData.district != 0 ? `-${repData.district}` : "";

    if (bill.voteTable.localRep == "notVoting") {
        return (
            <p>{repData.firstName} {repData.lastName} ({repData.partyLetter}-{repData.state}{districtText}) <b>did not vote</b> on this bill.</p>
        );
    } else {
        return (
            <p>{repData.firstName} {repData.lastName} ({repData.partyLetter}-{repData.state}{districtText}) voted <b>{capitalize(bill.voteTable.localRep)}</b> on this bill.</p>
        );
    }
}