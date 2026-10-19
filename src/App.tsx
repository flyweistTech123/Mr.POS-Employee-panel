import { BrowserRouter } from "react-router-dom";
import "./App.css";
import { IndexRoutes } from "./router/IndexRoutes";
import { DndProvider } from 'react-dnd-multi-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MouseTransition, TouchTransition } from 'react-dnd-multi-backend';
import { WalkthroughController } from "./components/WalkthroughController";
import { useWalkthroughStore } from "@/store/walkthroughStore";
// import { HTML5toTouch } from 'react-dnd-multi-backend';
// import MultiBackend from 'react-dnd-multi-backend';
import { Toaster } from 'react-hot-toast';
const HTML5toTouchWithAutoScroll = {
  backends: [
    {
      id: 'html5',
      backend: HTML5Backend,
      transition: MouseTransition,
    },
    {
      id: 'touch',
      backend: TouchBackend,
      options: { enableMouseEvents: true, enableAutoScroll: true },
      preview: true,
      transition: TouchTransition,
    },
  ],
};

function App() {
  const trainingInstanceId = useWalkthroughStore((s) => s.trainingInstanceId);
  return (
    <BrowserRouter>
     <Toaster position="top-right" reverseOrder={false} />
      <DndProvider options={HTML5toTouchWithAutoScroll}>
        <WalkthroughController key={trainingInstanceId} />
      <IndexRoutes />
      </DndProvider>
    </BrowserRouter>
  );
}

export default App;
