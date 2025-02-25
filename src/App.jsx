import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Draggable from "react-draggable";
import supabase from "./supabase";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [userData, setUserData] = useState();

  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleDrag = (e, data) => {
    setPosition({
      x: data.x,
      y: data.y,
    });
  };

  useEffect(() => {
    getUserData();
  }, []);

  async function getUserData() {
    const { data } = await supabase.from("user").select("*");
    console.log(data);
    setUserData(data);
  }
  console.log(userData);
  // Initialize socket connection
  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server");
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Handle incoming messages
  useEffect(() => {
    if (!socket) return;

    socket.on("message", (data) => {
      console.log(data);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: data, fromUser: false },
      ]);
    });

    return () => {
      socket.off("message");
    };
  }, [socket]);

  // Handle sending a message
  const sendMessage = () => {
    if (message.trim() && socket) {
      // Emit the message to the server
      socket.emit("sendMessage", message);

      // Add message to local state
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: message, fromUser: true },
      ]);
      setMessage("");
    }
  };

  // Handle toggling the chat window visibility
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50">
        {/* Button to open/close chat */}
        <button
          className="bg-green-500 text-white py-2 px-4 rounded-full shadow-lg focus:outline-none hover:bg-green-600"
          onClick={toggleChat}
        >
          {isChatOpen ? "Close Chat" : "Chat with us"}
        </button>

        {/* Chat window */}
        {isChatOpen && (
          <div className="bg-white border border-gray-300 rounded-lg shadow-lg w-80 h-96 flex flex-col absolute bottom-16 right-0">
            <div className="bg-green-500 text-white p-3 rounded-t-lg">
              <h3 className="font-semibold text-center">Live Chat</h3>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3">
              {/* Messages */}
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg max-w-xs ${
                    msg.fromUser
                      ? "bg-green-100 self-end"
                      : "bg-gray-100 self-start"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Input and send button */}
            <div className="p-3 border-t border-gray-200 flex items-center space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={sendMessage}
                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 focus:outline-none"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="h-screen">
        <h2>React Draggable with Bounds Example</h2>
        <Draggable
          bounds="parent"
          onDrag={handleDrag}
          axis="both"
          position={position}
        >
          <div
            style={{
              width: "200px",
              height: "200px",
              backgroundColor: "lightblue",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              fontSize: "20px",
            }}
          >
            Drag Me!
          </div>
        </Draggable>
      </div>
    </>
  );
};

export default App;
