import { useCursor } from "@/core/hooks/useCursor";
import Marquee from "@/shared/Marquee";
import { useEffect } from "react";
import Gallery from "../components/Gallery";
import Hero from "../components/Hero";
import Process from "../components/Process";
import Services from "../components/Services";
import Stats from "../components/Stats";
import WeddingExperiences from "../components/WeddingExperiences";
import Contact from "../components/Contact";

const Home = () => {
    useCursor();

    useEffect(() => {
        document.title = "iPartyDJs — Producción & Coordinación de Eventos";
    }, []);

    return (
        <>
            <div className="cursor" />
            <div className="cursor-follower" />
            {/* <Navbar /> */}
            <main>
                <Hero />
                <Marquee />
                <Services />
                <WeddingExperiences />
                <Stats />
                <Process />
                <Gallery />
                <Contact />
            </main>
            {/* <Footer /> */}
        </>
    );
};

export default Home;
