import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import RecommendPage from "./pages/RecommendPage";
import ResultsPage from "./pages/ResultsPage";
import CandidateDetailPage from "./pages/CandidateDetailPage";
import AnalysisPage from "./pages/AnalysisPage";
import CelebrityFeaturePage from "./pages/CelebrityFeaturePage";
import BrandFeaturePage from "./pages/BrandFeaturePage";
import NewsPage from "./pages/NewsPage";
import RecommendModePage from "./pages/RecommendModePage";
import RecommendDescriptionPage from "./pages/RecommendDescriptionPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recommend-mode" element={<RecommendModePage />} />
        <Route path="/recommend" element={<RecommendPage />} />
        <Route
          path="/recommend-description"
          element={<RecommendDescriptionPage />}
        />
        <Route path="/results/:brand" element={<ResultsPage />} />
        <Route path="/candidate/:id" element={<CandidateDetailPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/celebrity-feature" element={<CelebrityFeaturePage />} />
        <Route path="/brand-feature" element={<BrandFeaturePage />} />
        <Route path="/news" element={<NewsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
