import { useCursor } from "@/core/hooks/useCursor";
import Footer from "@/shared/Footer/Footer";
import Marquee from "@/shared/Marquee/Marquee";
import Navbar from "@/shared/Navbar/Navbar";
import { useEffect } from "react";
import Gallery from "../../components/Gallery/Gallery";
import Hero from "../../components/Hero/Hero";
import Process from "../../components/Process/Process";
import Services from "../../components/Services/Services";
import Stats from "../../components/Stats/Stats";
import WeddingExperiences from "../../components/WeddingExperiences/WeddingExperiences";
import Contact from "../../components/Contact/Contact";

const Home = () => {
    useCursor();

    useEffect(() => {
        document.title = "iPartyDJs — Producción & Coordinación de Eventos";
    }, []);

    return (
        <>
            <div className="cursor" />
            <div className="cursor-follower" />
            <Navbar />
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
            <Footer />
        </>
    );
};

export default Home;
