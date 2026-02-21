import React from "react";
import Routes from "./Routes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Routes />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
