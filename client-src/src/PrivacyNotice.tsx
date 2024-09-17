import "./PrivacyNotice.css";
import { closeWindow, setStorageKey } from "./chrome";

export default function PrivacyNotice({ setCheckedPrivacy }: { setCheckedPrivacy: (value: boolean) => void }) {
    async function saveAndSetCheckedPrivacy() {
        await setStorageKey("checkedPrivacy", "true");
        setCheckedPrivacy(true);
    }

    return (
        <div className="center">
            <h3>Privacy Notice</h3>
            <p>If you continue, TrackMyRep will send the title of this web page to TrackMyRep's server and to OpenAI, where your data will be handled according to <a target="_blank" href="https://openai.com/policies/privacy-policy/" rel="noreferrer">OpenAI's privacy policy</a>. This will occur every time you open TrackMyRep. TrackMyRep will not permanently store any data sent to its server.<br /><br />It's not recommended to open TrackMyRep on web pages with sensitive information (bank account or medical pages, etc.)</p>
            <button className="privacy-btn btn btn-primary" onClick={saveAndSetCheckedPrivacy}>Continue, and don't show this again</button>
            <br />
            <button className="privacy-btn btn btn-secondary" onClick={() => setCheckedPrivacy(true)}>Continue</button>
            <button className="privacy-btn btn btn-secondary" onClick={closeWindow}>Close</button>
        </div>
    );
}