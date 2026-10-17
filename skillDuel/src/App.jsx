import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import useCall from "./hooks/useCall";

import Hero from "./components/Hero/Hero";
import SignIn from "./components/SignIn/SignIn";
import SignUp from "./components/SignUp/SignUp";
import SignOut from "./components/SignOut/SignOut";
import Sidebar from "./components/Sidebar/Sidebar";
import Navbar from "./components/Navbar/Navbar";
import SearchBar from "./components/SearchBar/SearchBar";
import VideoSpace from "./components/VideoSpace/VideoSpace";
import ConnectButton from "./components/ConnectButton/ConnectButton";
import SessionPreview from "./components/SessionPreview/SessionPreview";
import Chats from "./components/Chats/Chats";
import CodingSpace from "./components/CodingSpace/CodingSpace";
import Badges from "./components/Badges/Badges";
import Profile from "./components/Profile/Profile";

/**
 * The main workspace ("/app"). All call logic (matching, WebRTC, errors,
 * cancel, ending) lives in the useCall hook — this component just wires it
 * to the UI.
 */
function Workspace() {
  const call = useCall();
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />
      <main className="min-h-screen px-5 py-6 md:ml-[240px] md:px-8 lg:px-10">
        <Navbar />
        <SearchBar query={query} setQuery={setQuery} />

        <div className="mt-8 flex flex-col gap-6 lg:flex-row">
          <div className="flex-1">
            {/* VideoSpace calls setMicOn(fn) / setCameraOn(fn); our toggles ignore the argument. */}
            <VideoSpace
              status={call.status}
              partner={call.partner}
              localStream={call.localStream}
              remoteStream={call.remoteStream}
              onEndCall={call.endCall}
              micOn={call.micOn}
              setMicOn={() => call.toggleMic()}
              cameraOn={call.cameraOn}
              setCameraOn={() => call.toggleCamera()}
            />
            <div className="mt-6">
              <ConnectButton
                status={call.status}
                onConnect={call.connect}
                onCancel={call.cancelMatching}
                error={call.error}
                notice={call.notice}
                onDismiss={call.dismiss}
              />
            </div>
          </div>
          <SessionPreview />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Hero />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signout" element={<SignOut />} />

          {/* Dashboard — protected */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Workspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/chats"
            element={
              <ProtectedRoute>
                <Chats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/coding-space"
            element={
              <ProtectedRoute>
                <CodingSpace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/badges"
            element={
              <ProtectedRoute>
                <Badges />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
