import "./starter-inhoud.css"
import { useState } from "react"

function StarterInhoud() {
    const [doelgroep, setDoelgroep] = useState("ouder")

    const inhoudPerDoelgroep = {
        ouder: {
            titel: "Voor ouders",
            tekst: "Krijg overzicht in inkomsten en uitgaven van je gezin en stel samen spaardoelen in.",
        },
        kind: {
            titel: "Voor kinderen",
            tekst: "Leer op een leuke manier omgaan met geld en volg je spaargeld stap voor stap.",
        },
    }

    const huidigeInhoud = inhoudPerDoelgroep[doelgroep]

    return(
        <>
            <div className="Starter-inhoud">
                <div className="img-container">
                 <img src="/spaarvarken.png" alt="spaarvarken" />
                </div>
                <div className="btn-group">
                    <button
                        className={`btn ${doelgroep === "ouder" ? "active" : ""}`}
                        onClick={() => setDoelgroep("ouder")}
                    >
                        voor Ouders
                    </button>
                    <button
                        className={`btn ${doelgroep === "kind" ? "active" : ""}`}
                        onClick={() => setDoelgroep("kind")}
                    >
                        voor kinderen
                    </button>
                </div>
                <div className={`container ${doelgroep === "ouder" ? "container-ouder" : "container-kind"}`}>
                    <div className="container-tekst">
                        <h1>{huidigeInhoud.titel}</h1>
                        <p>{huidigeInhoud.tekst}</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default StarterInhoud