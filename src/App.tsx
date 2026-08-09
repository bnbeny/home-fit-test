import { useState } from "react";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { QuestionnaireForm } from "./components/form/QuestionnaireForm";
import { ResultsDashboard } from "./components/results/ResultsDashboard";
import { DEFAULT_ANSWERS } from "./lib/defaults";
import { LanguageProvider } from "./i18n/LanguageContext";
import type { QuestionnaireAnswers } from "./types/finance";

type Stage = "form" | "results";

function AppContent() {
  const [stage, setStage] = useState<Stage>("form");
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(DEFAULT_ANSWERS);

  const handleUpdate = (patch: Partial<QuestionnaireAnswers>) => {
    setAnswers((prev) => ({ ...prev, ...patch }));
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className={`mx-auto px-4 py-8 sm:py-10 ${stage === "form" ? "max-w-3xl" : "max-w-4xl"}`}>
        {stage === "form" ? (
          <QuestionnaireForm
            answers={answers}
            onUpdate={handleUpdate}
            onSubmit={() => setStage("results")}
          />
        ) : (
          <ResultsDashboard answers={answers} onEditAnswers={() => setStage("form")} />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
