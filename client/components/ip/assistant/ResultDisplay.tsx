import React, { useState } from "react";
import { type ClassificationResult } from "@shared/image-analysis";
import { ChevronDown } from "lucide-react";

interface ResultDisplayProps {
  result: ClassificationResult | null;
  isLoading: boolean;
  error: string | null;
  imageUrl?: string;
  onReset?: () => void;
}

const AnalysisSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gradient-to-r from-transparent via-gray-700/30 to-transparent last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gradient-to-r hover:from-transparent hover:via-gray-700/10 hover:to-transparent focus:outline-none transition-all duration-200 group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <span className="group-hover:scale-110 transition-transform duration-200">
            {icon}
          </span>
          <span className="font-semibold text-gray-200 text-sm group-hover:text-white transition-colors duration-200">
            {title}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-300 group-hover:text-gray-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 bg-gradient-to-b from-gray-900/50 to-gray-900/20 animate-in fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

const AIGenerationAnalysis: React.FC<{
  analysis: ClassificationResult["flags"]["ai_generation_analysis"];
}> = ({ analysis }) => {
  const likelihoodColors: Record<string, string> = {
    High: "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30",
    Medium:
      "bg-gradient-to-r from-yellow-600 to-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/20",
    Low: "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30",
    Unlikely:
      "bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/30",
  };

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-gray-300">AI Probability</span>
        <span
          className={`px-4 py-1.5 text-xs font-bold rounded-full ${
            likelihoodColors[analysis.likelihood] || "bg-gray-600"
          } transition-all duration-200 hover:scale-105`}
        >
          {analysis.likelihood}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-xs">Confidence Level</span>
          <span className="font-mono text-cyan-300 font-semibold">
            {(analysis.confidence_score * 100).toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gradient-to-r from-gray-700 to-gray-600 rounded-full h-2.5 overflow-hidden shadow-inner">
          <div
            className="h-2.5 rounded-full transition-all duration-500 bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-200 shadow-lg shadow-cyan-400/50"
            style={{ width: `${analysis.confidence_score * 100}%` }}
          />
        </div>
      </div>
      {analysis.evidence.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <h6 className="text-xs font-bold text-gray-300 mb-3 uppercase tracking-wide">
            🔍 Visual Evidence
          </h6>
          <ul className="space-y-2">
            {analysis.evidence.slice(0, 4).map((item, index) => (
              <li
                key={index}
                className="text-xs text-gray-300 flex items-start gap-2.5 hover:text-cyan-300 transition-colors duration-200 p-2 rounded hover:bg-gray-800/30"
              >
                <span className="text-yellow-400 mt-0.5 text-sm flex-shrink-0">
                  ✨
                </span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const DetailItem: React.FC<{
  label: string;
  value: string | boolean | string[];
}> = ({ label, value }) => {
  let displayValue: React.ReactNode;

  if (typeof value === "boolean") {
    displayValue = (
      <span
        className={`font-semibold text-xs px-2 py-1 rounded-md transition-all duration-200 ${
          value
            ? "text-green-300 bg-green-500/10 border border-green-500/30"
            : "text-red-300 bg-red-500/10 border border-red-500/30"
        }`}
      >
        {value ? "✓ Yes" : "✗ No"}
      </span>
    );
  } else if (Array.isArray(value)) {
    displayValue = (
      <div className="flex flex-wrap gap-1.5">
        {value.slice(0, 5).map((item, index) => (
          <span
            key={index}
            className="px-2.5 py-1 text-xs bg-gradient-to-r from-gray-700 to-gray-600 rounded-full border border-gray-600/50 hover:border-cyan-400/50 hover:shadow-md hover:shadow-cyan-400/20 transition-all duration-200"
          >
            {item}
          </span>
        ))}
      </div>
    );
  } else {
    displayValue = (
      <span className="text-gray-300 text-xs font-medium text-right">
        {value}
      </span>
    );
  }

  return (
    <div className="flex items-start justify-between py-2.5 px-2 rounded hover:bg-gray-800/20 transition-colors duration-200">
      <span className="text-gray-400 text-xs font-medium">{label}</span>
      <div className="text-right max-w-[55%]">{displayValue}</div>
    </div>
  );
};

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  isLoading,
  error,
  imageUrl,
  onReset,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-8 border border-cyan-400/20 backdrop-blur-sm">
        <div className="inline-flex items-center justify-center w-12 h-12 mb-4">
          <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="font-semibold text-gray-200 text-sm">
          🔬 Performing Deep Analysis...
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Classifying content, style, and IP risks
        </p>
      </div>
    );
  }

  if (error && !result) {
    return null;
  }

  if (!result) {
    return null;
  }

  const { flags, classification, license } = result;

  const statusIcons: Record<string, React.ReactNode> = {
    CAN_REGISTER: (
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500/30 to-green-600/20 border-2 border-green-400 flex items-center justify-center text-green-400 text-lg font-bold shadow-lg shadow-green-500/20">
        ✓
      </div>
    ),
    CANNOT_REGISTER: (
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500/30 to-red-600/20 border-2 border-red-400 flex items-center justify-center text-red-400 text-lg font-bold shadow-lg shadow-red-500/20">
        ✕
      </div>
    ),
    REQUIRES_REVIEW: (
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-500/30 to-yellow-600/20 border-2 border-yellow-400 flex items-center justify-center text-yellow-400 text-lg font-bold shadow-lg shadow-yellow-500/20">
        !
      </div>
    ),
  };

  const buttonClasses: Record<string, string> = {
    green:
      "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 disabled:opacity-50 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-200 hover:scale-105 active:scale-95",
    red: "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:opacity-50 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-200 hover:scale-105 active:scale-95",
    yellow:
      "bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 disabled:opacity-50 shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 text-gray-900 transition-all duration-200 hover:scale-105 active:scale-95",
  };

  const licenseBgClasses: Record<string, string> = {
    green:
      "bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-700/50 shadow-lg shadow-green-500/10",
    red: "bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-700/50 shadow-lg shadow-red-500/10",
    yellow:
      "bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border border-yellow-700/50 shadow-lg shadow-yellow-500/10",
  };

  const licenseTitleClasses: Record<string, string> = {
    green: "text-green-300",
    red: "text-red-300",
    yellow: "text-yellow-300",
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl border border-gray-700/50 overflow-hidden w-full backdrop-blur-sm shadow-2xl shadow-gray-900/50">
      <div className="flex flex-col lg:flex-row gap-4 p-5">
        {/* Left side: Image */}
        {imageUrl && (
          <div className="lg:w-1/3 flex-shrink-0">
            <div className="bg-gradient-to-br from-gray-900/60 to-black/40 rounded-lg p-3 h-full flex flex-col border border-gray-700/30 shadow-inner">
              <h4 className="text-xs font-bold text-gray-300 mb-2 uppercase tracking-wide">
                📸 Uploaded Image
              </h4>
              <img
                src={imageUrl}
                alt="Uploaded"
                className="w-full h-auto rounded-md object-cover max-h-64 border border-gray-700/50 shadow-lg shadow-gray-900/50"
              />
            </div>
          </div>
        )}

        {/* Right side: Analysis Results */}
        <div
          className={`flex-1 flex flex-col ${imageUrl ? "lg:w-2/3" : "w-full"}`}
        >
          <div className="mb-4">
            <h3 className="text-sm font-bold mb-1 bg-gradient-to-r from-gray-200 to-gray-100 bg-clip-text text-transparent">
              ✨ Analysis Result
            </h3>
            <p className="text-gray-400 text-xs">
              Group{" "}
              <span className="font-bold text-cyan-400">
                {classification.group}
              </span>{" "}
              • <span className="text-cyan-300/80">{classification.type}</span>
            </p>
          </div>

          <div
            className={`p-4 rounded-lg mb-4 border text-sm backdrop-blur-sm ${licenseBgClasses[license.color]}`}
          >
            <div className="flex items-start gap-3 mb-2">
              {statusIcons[license.status]}
              <h4
                className={`text-sm font-bold ${licenseTitleClasses[license.color]}`}
              >
                {license.title}
              </h4>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed ml-10">
              {license.description}
            </p>
          </div>

          <div className="rounded-lg border border-gray-700/40 bg-gray-800/40 overflow-hidden text-xs max-h-72 overflow-y-auto backdrop-blur-sm shadow-inner">
            <AnalysisSection
              title="AI Generation Analysis"
              icon={<span className="text-2xl">🤖</span>}
              defaultOpen={true}
            >
              <AIGenerationAnalysis analysis={flags.ai_generation_analysis} />
            </AnalysisSection>

            <AnalysisSection
              title="Content & Safety Analysis"
              icon={<span className="text-2xl">🛡️</span>}
            >
              <DetailItem
                label="Explicit Content"
                value={flags.content_analysis.contains_explicit_content}
              />
              <DetailItem
                label="Violence"
                value={flags.content_analysis.contains_violence}
              />
              <DetailItem
                label="Sensitive Subject"
                value={flags.content_analysis.contains_sensitive_subject}
              />
              {flags.content_analysis.description && (
                <DetailItem
                  label="Notes"
                  value={flags.content_analysis.description}
                />
              )}
            </AnalysisSection>

            <AnalysisSection
              title="Composition & Style"
              icon={<span className="text-2xl">🎨</span>}
            >
              <DetailItem
                label="Artistic Style"
                value={flags.composition_analysis.style}
              />
              <DetailItem
                label="Perspective"
                value={flags.composition_analysis.perspective}
              />
              <DetailItem
                label="Dominant Colors"
                value={flags.composition_analysis.dominant_colors.map((c) =>
                  c.toUpperCase(),
                )}
              />
            </AnalysisSection>

            <AnalysisSection
              title="Object & Text Detection"
              icon={<span className="text-2xl">📋</span>}
            >
              <DetailItem
                label="Main Objects"
                value={
                  flags.object_detection.main_objects.join(", ") ||
                  "None detected"
                }
              />
              <DetailItem
                label="Detected Text"
                value={flags.text_detection.detected_text || "None"}
              />
            </AnalysisSection>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-white text-xs transition-all duration-200 ${
                buttonClasses[license.color] || "bg-gray-600"
              }`}
              disabled={license.status === "CANNOT_REGISTER"}
            >
              {license.buttonText}
            </button>
            <button
              onClick={onReset}
              className="px-5 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white text-xs transition-all duration-200 shadow-lg shadow-gray-600/20 hover:scale-105 active:scale-95 border border-gray-600/50"
            >
              Analyze Another
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
