import Upload from "./components/Upload";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">
        AI Profile Generator
      </h1>

      <Upload />
    </div>
  );
}

export default App;