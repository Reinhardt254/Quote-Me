import "@styles/globals.css"
import Nav from "@components/Nav"
import Provider from "@components/Provider"

export const metadata = {
    title:"Quote-me",
    description:"Discover & Share your quotes"
}

const RootLayout = ({children}) => {
  return (
    <html Lang="en">
        <body className="">
            <Provider> 
            {/* <div className="main">
                <div className="gradient"/>
            </div> */}
            <main className=" app">
                <Nav />
                {children}
            </main>
            </Provider>
        </body>
    </html>
  )
}

export default RootLayout;




















