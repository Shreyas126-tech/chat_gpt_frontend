import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [message, setMessage] = useState("");
    const [chatLog, setChatLog] = useState([]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            navigate("/");
            return;
        }
        fetchHistory();
    }, [navigate]);

    useEffect(() => {
        scrollToBottom();
    }, [chatLog]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch("http://localhost:8000/history", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };

    const formatResponse = (text) => {
        if (!text) return "";
        // Remove markdown bold symbols ** and other common ones if present
        return text.replace(/\*\*/g, "").replace(/###/g, "").replace(/##/g, "").trim();
    };

    const handleAsk = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userMsg = { role: "user", content: message };
        setChatLog(prev => [...prev, userMsg]);
        const currentMessage = message;
        setMessage("");
        setLoading(true);

        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch("http://localhost:8000/ask", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ message: currentMessage }),
            });

            if (res.ok) {
                const data = await res.json();
                const aiMsg = { role: "ai", content: formatResponse(data.response) };
                setChatLog(prev => [...prev, aiMsg]);
                fetchHistory(); // Refresh history sidebar
            } else {
                alert("Failed to get response from AI");
            }
        } catch (error) {
            console.error("Error asking AI:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
                <h2 style={styles.sidebarTitle}>History</h2>
                <div style={styles.historyList}>
                    {history.length === 0 ? (
                        <p style={styles.noHistory}>No history yet</p>
                    ) : (
                        history.map((item) => (
                            <div key={item.id} style={styles.historyItem}>
                                <p style={styles.historyPrompt}>{item.prompt}</p>
                                <p style={styles.historyTime}>
                                    {new Date(item.timestamp).toLocaleString()}
                                </p>
                            </div>
                        ))
                    )}
                </div>
                <button
                    onClick={() => { localStorage.removeItem("access_token"); navigate("/"); }}
                    style={styles.logoutBtn}
                >
                    Logout
                </button>
            </div>

            {/* Main Content */}
            <div style={styles.mainContent}>
                <header style={styles.header}>
                    <h1 style={styles.title}>AI Assistant Dashboard 🎉</h1>
                </header>

                <div style={styles.chatArea}>
                    {chatLog.length === 0 && history.length > 0 && (
                        <div style={styles.welcomeInfo}>Select "Send" to start a new chat or view history on the left.</div>
                    )}
                    {chatLog.map((chat, index) => (
                        <div
                            key={index}
                            style={{
                                ...styles.messageWrapper,
                                justifyContent: chat.role === "user" ? "flex-end" : "flex-start"
                            }}
                        >
                            <div style={{
                                ...styles.bubble,
                                backgroundColor: chat.role === "user" ? "#3b82f6" : "rgba(255, 255, 255, 0.1)",
                                alignSelf: chat.role === "user" ? "flex-end" : "flex-start",
                                borderRadius: chat.role === "user" ? "18px 18px 2px 18px" : "18px 18px 18px 2px",
                            }}>
                                <strong style={styles.roleLabel}>{chat.role === "user" ? "You" : "AI"}:</strong>
                                <p style={styles.messageText}>{chat.content}</p>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div style={{ ...styles.messageWrapper, justifyContent: "flex-start" }}>
                            <div style={{ ...styles.bubble, backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                                <p style={styles.loadingText}>AI is thinking...</p>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleAsk} style={styles.inputContainer}>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your prompt here..."
                        style={styles.input}
                        disabled={loading}
                    />
                    <button type="submit" style={styles.sendBtn} disabled={loading}>
                        {loading ? "..." : "Send"}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        height: "100vh",
        width: "100vw",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        backgroundColor: "#020617",
        color: "#f8fafc",
        overflow: "hidden",
    },
    sidebar: {
        width: "300px",
        backgroundColor: "#0f172a",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #1e293b",
    },
    sidebarTitle: {
        fontSize: "1.25rem",
        fontWeight: "700",
        marginBottom: "24px",
        color: "#38bdf8",
        letterSpacing: "-0.025em",
    },
    historyList: {
        flex: 1,
        overflowY: "auto",
        marginBottom: "20px",
        paddingRight: "4px",
    },
    historyItem: {
        padding: "12px",
        borderRadius: "12px",
        backgroundColor: "#1e293b",
        marginBottom: "12px",
        cursor: "default",
        transition: "all 0.2s ease",
        border: "1px solid transparent",
    },
    historyPrompt: {
        margin: 0,
        fontSize: "0.875rem",
        fontWeight: "500",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        color: "#e2e8f0",
    },
    historyTime: {
        margin: "4px 0 0 0",
        fontSize: "0.75rem",
        color: "#64748b",
    },
    noHistory: {
        textAlign: "center",
        color: "#64748b",
        fontSize: "0.875rem",
        marginTop: "20px",
    },
    logoutBtn: {
        padding: "12px",
        backgroundColor: "#ef4444",
        color: "white",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "600",
        transition: "opacity 0.2s",
        fontSize: "0.875rem",
    },
    mainContent: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "32px",
        position: "relative",
    },
    header: {
        marginBottom: "32px",
    },
    title: {
        fontSize: "1.875rem",
        fontWeight: "800",
        textAlign: "center",
        background: "linear-gradient(to right, #38bdf8, #818cf8)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
    },
    chatArea: {
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "16px",
        marginBottom: "24px",
        backgroundColor: "rgba(30, 41, 59, 0.4)",
        borderRadius: "24px",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(12px)",
    },
    messageWrapper: {
        display: "flex",
        width: "100%",
    },
    bubble: {
        padding: "12px 20px",
        maxWidth: "75%",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        lineHeight: "1.5",
    },
    roleLabel: {
        display: "block",
        fontSize: "0.75rem",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        marginBottom: "4px",
        opacity: 0.8,
    },
    messageText: {
        margin: 0,
        fontSize: "0.9375rem",
        whiteSpace: "pre-wrap",
    },
    loadingText: {
        margin: 0,
        fontSize: "0.875rem",
        color: "#94a3b8",
        fontStyle: "italic",
    },
    welcomeInfo: {
        textAlign: "center",
        color: "#64748b",
        fontSize: "0.875rem",
        marginTop: "auto",
        marginBottom: "auto",
    },
    inputContainer: {
        display: "flex",
        gap: "12px",
        backgroundColor: "#1e293b",
        padding: "8px",
        borderRadius: "16px",
        border: "1px solid #334155",
    },
    input: {
        flex: 1,
        padding: "12px 16px",
        borderRadius: "12px",
        border: "none",
        backgroundColor: "transparent",
        color: "white",
        fontSize: "1rem",
        outline: "none",
    },
    sendBtn: {
        padding: "0 24px",
        backgroundColor: "#0ea5e9",
        color: "white",
        border: "none",
        borderRadius: "12px",
        cursor: "pointer",
        fontWeight: "700",
        transition: "all 0.2s ease",
    },
};

export default Dashboard;
