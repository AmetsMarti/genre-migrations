import React from "react";
import { CssVarsProvider } from '@mui/joy/styles';
import Mapview from "./pages/Mapview";
import "./App.css";

function App() {
  return (
    <CssVarsProvider>
      <Mapview />
    </CssVarsProvider>
  );
}

export default App;
