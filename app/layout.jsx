import "@styles/globals.css";
import Nav from "@components/Nav";

export const metadata = {
  title: "Quote-me",
  description: "Discover & Share your quotes",
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <main className="app">
          <Nav />
          {children}
        </main>
      </body>
    </html>
  );
};

export default RootLayout;
