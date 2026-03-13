import "./Header.css"

function Header({ className}) {
    return(
        <>
            <div className={`Header ${className}`}>
               <img className="icon" src="/favicon.svg"></img>

               <h1>Naam App</h1>


            </div>
        </>
    )

}

export default Header
