import Header from "../components/header";
import Footer from "../components/footer";

import TheatreShowtimesSection from "../components/TheatreShowtimesSection.jsx";

export default function ShowtimesPage() {
  return (
    <>
      <Header />

      <TheatreShowtimesSection
        title="Movies presenting in Finnkino"
        showTheatrePicker={true}
        showDatePicker={true}
        initialCount={8}
        step={8}
        showMore={true} 
      />

      <Footer />
    </>
  );
}
