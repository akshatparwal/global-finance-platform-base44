import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header />
      <main style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}