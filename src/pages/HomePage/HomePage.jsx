import { useState, useEffect } from "react";

import Header from "../../components/Header/Header";
import "./HomePage.css"

function HomePage() {
    const [isMobile, setMoble] = useState(window.innerWidth < 768)

    useEffect(() => {
        const handleResize = () => {
        setMoble(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
      <>
        <Header />

        {isMobile && (
            <div className="Balance-container Mobile">
            <div>
                <h1>Balance</h1>

                <div className="Balance-items">
                <div className="Balance-item positive">
                    <span className="Balance-icon"></span>
                    <h2 className="Balance-value">200</h2>
                </div>

                <div className="Balance-item negetive">
                    <span className="Balance-icon"></span>
                    <h2 className="Balance-value">300</h2>
                </div>
                </div>
            </div>

            <div className="Grapgh"></div>
            </div>
        )}


        {!isMobile &&(
            <h1>Desktop placeholder</h1>
        )}

      </>
    );
}

export default HomePage;
