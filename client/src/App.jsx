import TopsisForm from "./components/TopsisForm";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <div className="main-content">
        <div className="container mt-5">
          <h2 className="text-center mb-4">TOPSIS Web Service</h2>
          <TopsisForm />
        </div>
      </div>

      <Footer />
    </>
  );
}
