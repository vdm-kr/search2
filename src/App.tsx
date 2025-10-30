import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SelectionProvider } from './context/SelectionContext';
import { Step1SelectCommodity } from './components/steps/Step1SelectCommodity';
import { Step2SelectDataTypes } from './components/steps/Step2SelectDataTypes';
import { Step3SelectDataTypes } from './components/steps/Step3SelectDataTypes';
import { Step4SelectWidgets } from './components/steps/Step4SelectWidgets';
import { WidgetsPage } from './components/pages/WidgetsPage';

function App() {
  return (
    <SelectionProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-900 p-4">
          <Routes>
            <Route path="/" element={<Navigate to="/step1" replace />} />
            <Route path="/step1" element={<Step1SelectCommodity />} />
            <Route path="/step2" element={<Step2SelectDataTypes />} />
            <Route path="/step3" element={<Step3SelectDataTypes />} />
            <Route path="/step4" element={<Step4SelectWidgets />} />
            <Route path="/widgets" element={<WidgetsPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </SelectionProvider>
  );
}

export default App;

