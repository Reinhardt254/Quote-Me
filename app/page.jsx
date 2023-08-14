import Feeds from "@components/Feeds"

const Home = () => {
  return (
    <section className="flex flex-col w-full flex-center ">
        <h1 className="text-center head_text">
            Discover & share
           <br />
            <span className="text-center orange_gradient"> Quotes</span>
            </h1>
            <p className="text-center desc">
               Quote-Me, Discover and post quotes about life, love, relationships and much more....
            </p>
            
            <Feeds />
    </section>
  )
}

export default Home

















