import { useEffect, useState } from "react";
import "./App.css";
import BillBox from "./BillBox";
import TopBar from "./TopBar";
import PrivacyNotice from "./PrivacyNotice";
import { BillData } from "./types";
import { getQuery, getStorageKey, openPopout } from "./chrome";
import { getBillData } from "./getBillData";

export default function App() {
    return (
        <>
            <TopBar />
            <div className="row main-container">
                <ContentView />
            </div>
        </>
    );
}

function ContentView() {
    const isPopup = getQuery() == "";

    const [checkedPrivacy, setCheckedPrivacy] = useState(false);
    const [billData, setBillData] = useState<BillData | null>(null);
    const [billDataLoaded, setBillDataLoaded] = useState(false);

    useEffect(() => {
        if (isPopup) {
            if (checkedPrivacy) {
                (async () => {
                    setBillData(await getBillData());
                    setBillDataLoaded(true);
                })();
            }
        } else {
            setBillData(JSON.parse(decodeURIComponent(getQuery())));
            setBillDataLoaded(true);
        }
    }, [checkedPrivacy]);

    useEffect(() => {
        (async () => {
            setCheckedPrivacy(await getStorageKey("checkedPrivacy") == "true");
        })();
    }, []);

    function openLoadedPopout() {
        if (billData) openPopout(encodeURIComponent(JSON.stringify(billData)));
    }

    console.log(billData, billDataLoaded)
    
    if (checkedPrivacy) {
        if (billDataLoaded) {
            if (billData) {
                if (isPopup) {
                    return (
                        <>
                            <ArticleKeywords keywords={billData.keywords} />
                            <BillBox bill={billData.bills[0]} />
                            <button className="btn btn-outline-primary full-button" onClick={openLoadedPopout}>See more votes</button>
                        </>
                    );
                } else {
                    return (
                        <>
                            <ArticleKeywords keywords={billData.keywords} />
                            <div className="col-6">
                                {billData.bills.filter((bill, index) => index % 2 == 0).map(bill => (
                                    <BillBox bill={bill} />
                                ))}
                            </div>
                            <div className="col-6">
                                {billData.bills.filter((bill, index) => index % 2 == 1).map(bill => (
                                    <BillBox bill={bill} />
                                ))}
                            </div>
                        </>
                    );
                }
            } else {
                return (
                    <p>There was an error collecting bills relating to this article.</p>
                );
            }
        } else {
            return (
                <p className="center">Loading...</p>
            );
        }
    } else {
        return (
            <PrivacyNotice setCheckedPrivacy={setCheckedPrivacy} />
        );
    }
}

function ArticleKeywords({keywords}: {keywords: string[]}) {
    return (
        <p className="center">
            <b>Article keywords</b>:
            {keywords.map(keyword => `"${keyword}"`).join(", ")}
        </p>
    );
}