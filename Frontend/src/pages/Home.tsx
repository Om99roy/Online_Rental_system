import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import FullScreenNav from "../components/FullScreenNav";
import FeaturedProducts from "../components/home/FeaturedProducts.tsx";
import { useAuthStore } from "../store/AuthContext.tsx";
import Footer from "../components/Footer.tsx";

const Home = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const heroRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        ".hero-eyebrow",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
      )
        .fromTo(
          ".hero-title",
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.3",
        )
        .fromTo(
          ".hero-subtitle",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.4",
        )
        .fromTo(
          ".hero-cta",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
          "-=0.3",
        )
        .fromTo(
          ".hero-stat",
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
          "-=0.2",
        );
    },
    { scope: heroRef },
  );

  return (
    <>
      <Navbar />
      <FullScreenNav />
      <main className="min-h-screen text-white">
        <section
          ref={heroRef}
          className="relative overflow-hidden pt-32 pb-20 md:pt-40 lg:pt-48"
        >
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-4xl text-center">
              <p className="hero-eyebrow text-sm font-semibold uppercase tracking-widest text-primary mb-4">
                Rent smarter, not harder
              </p>
              <h1 className="hero-title text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Everything you need,
                <br />
                without owning it
              </h1>
              <p className="hero-subtitle mx-auto max-w-2xl text-lg leading-8 text-white/80 mt-6">
                Cameras, drones, laptops, gear for your next project or weekend
                adventure — rent by the day, pick up or get it delivered, and
                send it back when you're done. No commitment, no clutter.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => navigate("/products")}
                  className="hero-cta rounded-md bg-white px-8 py-4 font-semibold text-primary transition hover:bg-white/90"
                >
                  Browse Products
                </button>
                <button
                  onClick={() => navigate(user ? "/dashboard" : "/register")}
                  className="hero-cta rounded-md border border-white/30 bg-white/10 px-8 py-4 font-semibold text-white transition hover:bg-white hover:text-primary"
                >
                  {user ? "Go to Dashboard" : "Create an Account"}
                </button>
              </div>

              <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
                <div className="hero-stat">
                  <p className="text-2xl lg:text-3xl font-bold">350+</p>
                  <p className="text-xs text-white/60 mt-1">
                    Products available
                  </p>
                </div>
                <div className="hero-stat">
                  <p className="text-2xl lg:text-3xl font-bold">24hr</p>
                  <p className="text-xs text-white/60 mt-1">
                    Pickup & delivery
                  </p>
                </div>
                <div className="hero-stat">
                  <p className="text-2xl lg:text-3xl font-bold">100%</p>
                  <p className="text-xs text-white/60 mt-1">Deposit refunds</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FeaturedProducts />

        <section className="px-6 py-16 max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-surface border border-border rounded-2xl p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center mb-4 text-lg">
                1
              </div>
              <h3 className="font-semibold mb-1">Browse & select</h3>
              <p className="text-sm text-text-muted">
                Pick your gear and choose how many days you need it for.
              </p>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center mb-4 text-lg">
                2
              </div>
              <h3 className="font-semibold mb-1">Pick up or get delivered</h3>
              <p className="text-sm text-text-muted">
                Collect from our store or have it shipped to your door.
              </p>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center mb-4 text-lg">
                3
              </div>
              <h3 className="font-semibold mb-1">Return & get refunded</h3>
              <p className="text-sm text-text-muted">
                Bring it back on time and your full deposit comes right back.
              </p>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
};

export default Home;
