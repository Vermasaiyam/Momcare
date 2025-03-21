import { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    const { token, backendUrl, userData } = useContext(AppContext);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const user_id = userData._id; // Replace with actual user ID
        const userMessage = { role: "user", content: input };

        setMessages((prev) => [...prev, userMessage]);

        try {
            // Send user query to Flask backend
            const flaskRes = await axios.post("http://127.0.0.1:10000/chat", {
                question: input,
            });

            const aiResponse = flaskRes.data.response;
            const aiMessage = { role: "assistant", content: aiResponse };

            setMessages((prev) => [...prev, aiMessage]);

            // Send chat history to Node.js API for saving
            await axios.post("http://localhost:4000/api/user/save-chat", {
                user_id,
                userQuestion: input,
                aiResponse,
            });

        } catch (error) {
            console.error("Error fetching AI response:", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Error: Unable to fetch response." },
            ]);
        }

        setInput("");
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-green-600 text-white text-lg font-semibold p-4">
                AI Chatbot
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                            }`}
                    >
                        <div
                            className={`p-3 rounded-lg shadow-md max-w-xs ${msg.role === "user"
                                    ? "bg-blue-500 text-white self-end"
                                    : "bg-gray-300 text-black self-start"
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <div className="flex p-4 bg-white border-t">
                <input
                    type="text"
                    className="flex-1 p-2 border rounded-lg focus:outline-none"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button
                    onClick={handleSend}
                    className="ml-2 bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chatbot;