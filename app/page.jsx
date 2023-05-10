import Feeds from "@components/Feeds"

const Home = () => {
  return (
    <section className="flex flex-col w-full flex-center">
        <h1 className="text-center head_text">
            Discover & share
           <br />
            <span className="text-center orange_gradient">AI-Powered Prompts</span>
            </h1>
            <p className="text-center desc">
               promptopia is an open-source AI prompting tool for modern world to discover, create and share creative prompts
            </p>
            
            <Feeds />
    </section>
  )
}

export default Home

















