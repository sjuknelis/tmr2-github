import "./TopBar.css";

export default function TopBar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
            <div className="navbar-brand">
                <img src="/popup/icon-wide.png" alt="" />
                <span>TrackMyRep</span>
            </div>
            </div>
        </nav>
    );
}