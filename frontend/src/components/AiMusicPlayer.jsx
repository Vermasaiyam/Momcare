import { useState } from "react";
import axios from "axios";

const AIBasedMusicPlayer = () => {
    const [mood, setMood] = useState("");
    const [songType, setSongType] = useState("");
    const [language, setLanguage] = useState("");
    const [musicUrl, setMusicUrl] = useState("");

    const handleGenerateMusic = async () => {
        if (!mood || !songType || !language) {
            alert("Please select all fields before generating music.");
            return;
        }

        try {
            const response = await axios.post("http://127.0.0.1:10000/generate-music", {
                mood,
                songType,
                language
            }, { responseType: "blob" });  // Expecting an MP3 file

            const url = URL.createObjectURL(new Blob([response.data], { type: "audio/mp3" }));
            setMusicUrl(url);
        } catch (error) {
            console.error("Error fetching AI music:", error);
            alert("Failed to generate music. Try again.");
        }
    };

    return (
        <div className="flex flex-col items-center p-6 bg-gray-100">
            <h2 className="text-xl font-semibold mb-4">AI-Based Music for Mothers</h2>

            <select onChange={e => setMood(e.target.value)} value={mood} className="border rounded px-2 py-2 mb-2">
                <option value="">Select Mood</option>
                <option value="Relaxing">Relaxing</option>
                <option value="Happy">Happy</option>
                <option value="Energetic">Energetic</option>
                <option value="Calm">Calm</option>
            </select>

            <select onChange={e => setSongType(e.target.value)} value={songType} className="border rounded px-2 py-2 mb-2">
                <option value="">Select Song Type</option>
                <option value="Lullaby">Lullaby</option>
                <option value="Soft Melody">Soft Melody</option>
                <option value="Instrumental">Instrumental</option>
                <option value="Nature Sounds">Nature Sounds</option>
            </select>

            <select onChange={e => setLanguage(e.target.value)} value={language} className="border rounded px-2 py-2 mb-4">
                <option value="">Select Language</option>
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
            </select>

            <button onClick={handleGenerateMusic} className="bg-green-600 text-white px-4 py-2 rounded">
                Generate Music
            </button>

            {musicUrl && (
                <div className="mt-4">
                    <audio controls src={musicUrl} />
                </div>
            )}
        </div>
    );
};

export default AIBasedMusicPlayer;