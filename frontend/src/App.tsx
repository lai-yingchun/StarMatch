// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import RecommendPage from "./pages/RecommendPage";
import ResultsPage from "./pages/ResultsPage";
import CandidateDetailPage from "./pages/CandidateDetailPage";
import AnalysisPage from "./pages/AnalysisPage";
import CelebrityFeaturePage from "./pages/CelebrityFeaturePage";
import BrandFeaturePage from "./pages/BrandFeaturePage";
import NewsPage from "./pages/NewsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recommend" element={<RecommendPage />} />
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