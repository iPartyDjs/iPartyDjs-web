import "@/styles/tailwind.css";
import Card from "../components/Card";

const AdminDashboard = () => {
    return (
        <>
            <header className="mb-5">
                <p className="font-semibold text-2xl">Hola Admin</p>
            </header>
            <main>
                <section className="mb-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card
                        title="Solicitudes"
                        value="2"
                        subtitle="1 pendiente · 1 en proceso"
                    ></Card>
                    <Card
                        title="Solicitudes"
                        value="2"
                        decorationClass="text-warning"
                        subtitle="1 pendiente · 1 en proceso"
                    ></Card>
                    <Card
                        title="Solicitudes"
                        value="2"
                        subtitle="1 pendiente · 1 en proceso"
                    ></Card>
                    <Card
                        title="Solicitudes"
                        value="2"
                        subtitle="1 pendiente · 1 en proceso"
                    ></Card>
                </section>
            </main>
            <footer></footer>
        </>
    );
};

export default AdminDashboard;
