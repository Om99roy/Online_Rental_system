import Navbar from "../components/Navbar";
import FullScreenNav from "../components/FullScreenNav";

const Home = () => {
  return (
    <>
      <Navbar />
      <FullScreenNav />

      <main className="min-h-screen text-white">
        <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 lg:pt-48">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit
              </h1>

              <p className="mx-auto max-w-2xl text-lg leading-8 text-white/80">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <button className="rounded-md bg-white px-8 py-4 font-semibold text-primary transition hover:bg-white/90">
                  Get Started
                </button>

                  <button className="rounded-md border border-white/30 bg-white/10 px-8 py-4 font-semibold text-white transition hover:bg-white hover:text-primary">
                    Learn More
                  </button>
                </div>
	      </div>
            </div>
        </section>
      </main>
    </>
  );
};

export default Home;
