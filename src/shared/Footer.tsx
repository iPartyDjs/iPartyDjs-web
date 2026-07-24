const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-top">
                <div className="footer-brand">
                    <span className="footer-logo">
                        <span>iParty</span>
                        <span className="gold">DJs</span>
                    </span>
                    <p className="footer-tagline">
                        Producción &amp; Coordinación de Eventos Sociales.
                        <br />
                        Ciudad de México.
                    </p>
                </div>

                <div className="footer-nav">
                    <div className="footer-col">
                        <span className="footer-col-title">Navegación</span>
                        <a href="#inicio">Inicio</a>
                        <a href="#servicios">Servicios</a>
                        <a href="#proceso">Proceso</a>
                        <a href="#galeria">Galería</a>
                        <a href="#contacto">Contacto</a>
                    </div>
                    <div className="footer-col">
                        <span className="footer-col-title">Eventos</span>
                        <a href="#contacto">Bodas</a>
                        <a href="#contacto">XV Años</a>
                        <a href="#contacto">Cumpleaños</a>
                        <a href="#contacto">Corporativos</a>
                        <a href="#contacto">Graduaciones</a>
                    </div>
                    <div className="footer-col">
                        <span className="footer-col-title">Acceso</span>
                        <a href="/Login">Iniciar sesión</a>
                        <a href="/registro">Registrarse</a>
                        <a href="/admin">Administración</a>
                    </div>
                </div>
            </div>

            <div className="footer-divider" />

            <div className="footer-bottom">
                <span className="footer-copy">
                    © {year} iPartyDJs. Todos los derechos reservados.
                </span>
                <div className="footer-links">
                    <a href="#">Aviso de Privacidad</a>
                    <a href="#">Términos y Condiciones</a>
                </div>
                <div className="footer-social">
                    <a
                        href="https://www.instagram.com/iparty_djs/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                    >
                        Instagram
                    </a>
                    <a
                        href="https://wa.me/527775102313"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                    >
                        WhatsApp
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
