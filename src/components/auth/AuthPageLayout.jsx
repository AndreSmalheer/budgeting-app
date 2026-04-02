import Header from "../Header/Header";

function AuthPageLayout({ children }) {
  return (
    <>
      <Header />
      <main className="AuthPage">{children}</main>
    </>
  );
}

export default AuthPageLayout;
