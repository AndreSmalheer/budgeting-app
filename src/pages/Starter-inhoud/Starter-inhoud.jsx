import "./starter-inhoud.css"
import Header from "../../components/Header/Header"

function StarterInhoud() {
    function Ouder() {
    }

    function Kinderen() {
    }

    return(
        <>
            <div className="Starter-inhoud">
                <div className="img-container">
                 <img src="/spaarvarken.png" alt="spaarvarken" />
                </div>
                <div className="btn-group">
                    <button className="btn" onClick={Ouder}>
                        voor Ouders
                    </button>
                    <button className="btn" onClick={Kinderen}>
                        voor kinderen
                    </button>
                </div>
                <div className="container">
                    <h1>Spaar bewust</h1>
                    <p>Hier kunt u uw budgetten beheren en uw uitgaven bijhouden.</p>
                </div>
            </div>
        </>
    )
}

export default StarterInhoud
