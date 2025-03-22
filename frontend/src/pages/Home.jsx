import React, { useState } from "react";
import { FaRobot } from "react-icons/fa"; // Import chatbot icon
import Header from "../components/Header";
import SpecialityMenu from "../components/SpecialityMenu";
import TopDoctors from "../components/TopDoctors";
import Banner from "../components/Banner";
import UploadMedicalReport from "../components/MedicalReport";
import NamePredictor from "../components/NamePredictor";
import TraitPredictor from "../components/TraitPredictor";
import Chatbot from "./Chatbot";
import AIBasedMusicPlayer from "../components/AiMusicPlayer";

const Home = () => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div>
      <Header />
      <UploadMedicalReport />
      <NamePredictor />
      <TraitPredictor />
      <AIBasedMusicPlayer />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />

      {/* Chatbot Button */}
      <button
        className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition duration-300"
        onClick={() => setChatOpen(!chatOpen)}
      >
        <FaRobot size={24} />
      </button>

      {/* Chatbot Window */}
      {chatOpen && <Chatbot onClose={() => setChatOpen(false)} />}
    </div>
  );
};

export default Home;