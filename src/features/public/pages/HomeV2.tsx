import { useEffect } from "react";
import HeroV2 from "@/features/public/components-v2/HeroV2";
import ServiciosV2 from "@/features/public/components-v2/ServiciosV2";
import ProcesoV2 from "@/features/public/components-v2/ProcesoV2";
import SociosV2 from "@/features/public/components-v2/SociosV2";
import WeddingExperiences from "@/features/public/components/WeddingExperiences";
import Gallery from "@/features/public/components/Gallery";
import Contact from "@/features/public/components/Contact";

const HomeV2 = () => {
    useEffect(() => {
        document.title = "iPartyDJs — Producción & Coordinación de Eventos";
    }, []);

    return (
        <main>
            <HeroV2 />
            <SociosV2 />
            <ServiciosV2 />
            <ProcesoV2 />
            <WeddingExperiences />
            <Gallery />
            <Contact />
        </main>
    );
};

export default HomeV2;
