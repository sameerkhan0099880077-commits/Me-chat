import React, { useState, useEffect } from "react";
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  FlatList, SafeAreaView, StatusBar 
} from "react-native";
import io from "socket.io-client";

// Socket connection
const socket = io("https://your-socket-server.com");

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [room, setRoom] = useState(null);
  const [status, setStatus] = useState("Connecting...");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (isLoggedIn) {
      socket.on("waiting", (msg) => setStatus(msg));
      socket.on("matched", (data) => {
        setRoom(data.room);
        setStatus("Connected with a Stranger!");
        setMessages([]);
      });
      socket.on("receive_message", (msg) => {
        setMessages((prev) => [...prev, { text: msg, sender: "stranger" }]);
      });
    }
  }, [isLoggedIn]);

  const handleLogin = () => {
    if (email.trim() && password.trim()) {
      setIsLoggedIn(true);
    }
  };

  const sendMessage = () => {
    if (text.trim() && room) {
      socket.emit("send_message", { room, message: text });
      setMessages((prev) => [...prev, { text, sender: "me" }]);
      setText("");
    }
  };

  // 1. WorldTalk Sign In Screen
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.card}>
          <Text style={styles.logoText}>🌐 WorldTalk</Text>
          
          <View style={styles.tabContainer}>
            <TouchableOpacity style={[styles.tab, styles.activeTab]}>
              <Text style={styles.tabText}>Sign in</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab}>
              <Text style={styles.tabTextInactive}>Create account</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Email</Text>
          <TextInput 
            style={styles.input} 
            value={email} 
            onChangeText={setEmail}
            placeholderTextColor="#666" 
          />

          <Text style={styles.label}>Password</Text>
          <TextInput 
            style={styles.input} 
            secureTextEntry 
            value={password} 
            onChangeText={setPassword}
            placeholderTextColor="#666" 
          />

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 2. Random Chat Screen
  return (
    <SafeAreaView style={styles.chatContainer}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.status}>{status}</Text>
        <TouchableOpacity style={styles.skipBtn}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Next / Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.sender === "me" ? styles.myMsg : styles.strangerMsg]}>
            <Text style={{ color: item.sender === "me" ? "#fff" : "#000" }}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.inputArea}>
        <TextInput 
          style={styles.chatInput} 
          value={text} 
          onChangeText={setText} 
          placeholder="Type a message..." 
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Sign In Styles
  loginContainer: { flex: 1, backgroundColor: "#0b131e", justifyContent: "center", alignItems: "center" },
  card: { width: "85%", backgroundColor: "#111c2a", padding: 25, borderRadius: 16, borderBottomWidth: 2, borderBottomColor: "#00d2c4" },
  logoText: { color: "#fff", fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  tabContainer: { flexDirection: "row", backgroundColor: "#0b131e", borderRadius: 8, padding: 3, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 6 },
  activeTab: { backgroundColor: "#1a2736" },
  tabText: { color: "#fff", fontSize: 12 },
  tabTextInactive: { color: "#666", fontSize: 12 },
  label: { color: "#8b9bb0", fontSize: 12, marginBottom: 5 },
  input: { backgroundColor: "#0b131e", color: "#fff", borderRadius: 8, padding: 10, marginBottom: 15, borderWidth: 1, borderColor: "#1a2736" },
  loginBtn: { backgroundColor: "#00d2c4", paddingVertical: 12, borderRadius: 8, alignItems: "center", marginTop: 10 },
  loginBtnText: { color: "#000", fontWeight: "bold", fontSize: 14 },

  // Chat Styles
  chatContainer: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15, backgroundColor: "#fff", elevation: 2 },
  status: { fontWeight: "bold", fontSize: 14, color: "#333" },
  skipBtn: { backgroundColor: "#ff4757", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6 },
  bubble: { padding: 12, marginVertical: 4, marginHorizontal: 12, borderRadius: 12, maxWidth: "75%" },
  myMsg: { alignSelf: "flex-end", backgroundColor: "#007AFF" },
  strangerMsg: { alignSelf: "flex-start", backgroundColor: "#e5e5ea" },
  inputArea: { flexDirection: "row", padding: 10, backgroundColor: "#fff" },
  chatInput: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 25, paddingHorizontal: 15, height: 45 },
  sendBtn: { backgroundColor: "#007AFF", marginLeft: 10, paddingHorizontal: 20, justifyContent: "center", borderRadius: 25 }
});
