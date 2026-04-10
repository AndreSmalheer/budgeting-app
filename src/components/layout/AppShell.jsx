import Header from "../Header/Header";
import MobileBottomNav from "../navigation/MobileBottomNav";
import "./AppShell.css";

function AppShell({ children }) {
  return (
    <div className="AppShell">
      <Header />
      <div className="AppShell__content">{children}</div>
      <MobileBottomNav />
    </div>
  );
}

export default AppShell;
