import { Layout } from "antd";
import "./App.css";
import FlowDiagram from "./components/FlowDiagram";

function App() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <FlowDiagram />
    </Layout>
  );
}

export default App;
