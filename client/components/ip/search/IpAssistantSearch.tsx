import { motion } from "framer-motion";
import { useState } from "react";
import { SearchResultsGrid } from "./SearchResultsGrid";
import {
  useDomainFetch,
  useRemixTypes,
  useAllowsDerivatives,
  useUniqueOwners,
  truncateAddressDisplay,
} from "./hooks";
import type { SearchResult } from "./types";

interface IpAssistantSearchProps {
  searchResults: SearchResult[];
  onClose: () => void;
  onAssetClick: (asset: SearchResult) => void;
  onRemix?: (asset: SearchResult) => void;
  onOwnerClick?: (ownerAddress: string, ownerDomain?: string | null) => void;
  onBackClick?: () => void;
  query?: string;
  displayingOwnerAssets?: boolean;
  ownerDisplay?: string | null;
  isLoadingOwnerAssets?: boolean;
}

export const IpAssistantSearch = ({
  searchResults,
  onClose,
  onAssetClick,
  onOwnerClick,
  onBackClick,
  query = "",
  displayingOwnerAssets = false,
  ownerDisplay = null,
  isLoadingOwnerAssets = false,
}: IpAssistantSearchProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Custom hooks
  const uniqueOwners = useUniqueOwners(searchResults);
  const ownerDomains = useDomainFetch(uniqueOwners);
  const getRemixTypes = useRemixTypes();
  const allowsDerivatives = useAllowsDerivatives();

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      />

      <motion.div
        className="relative z-10 w-full max-w-6xl max-h-[90vh] rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-slate-800/50 shadow-2xl overflow-hidden flex flex-col"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-start justify-between gap-4 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/30 px-6 py-4 sm:px-8">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {displayingOwnerAssets && (
              <motion.button
                type="button"
                onClick={onBackClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4DA6]/30 mt-1"
                aria-label="Back to search results"
                title="Back to search results"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </motion.button>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#FF4DA6] mb-1">
                {displayingOwnerAssets
                  ? "Assets by Owner"
                  : "IP Assets Search Results"}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 truncate">
                {displayingOwnerAssets
                  ? `${ownerDisplay}`
                  : query && `Results for "${query}"`}
                {searchResults.length > 0 && (
                  <span className="ml-2 text-[#FF4DA6] text-lg sm:text-xl">
                    ({searchResults.length})
                  </span>
                )}
              </h2>
            </div>
          </div>
          <motion.button
            type="button"
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 rounded-full p-2 text-slate-400 transition-colors hover:bg-[#FF4DA6]/20 hover:text-[#FF4DA6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4DA6]/30"
            aria-label="Close search results"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </motion.button>
        </div>

        {/* Results Grid */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <SearchResultsGrid
            searchResults={searchResults}
            ownerDomains={ownerDomains}
            hoveredIndex={hoveredIndex}
            setHoveredIndex={setHoveredIndex}
            getRemixTypes={getRemixTypes}
            allowsDerivatives={allowsDerivatives}
            truncateAddressDisplay={truncateAddressDisplay}
            isLoadingOwnerAssets={isLoadingOwnerAssets}
            onAssetClick={onAssetClick}
            onOwnerClick={(ownerAddress, ownerDomain) => {
              if (!displayingOwnerAssets) {
                onOwnerClick?.(ownerAddress, ownerDomain);
              }
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};
