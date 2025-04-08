import React, { useState, useRef } from 'react';
import { 
  Loader2, 
  RefreshCw, 
  Upload, 
  ImagePlus, 
  AlertCircle,
  LineChart,
  BarChart2
} from 'lucide-react';
import { analyzeMultipleTimeframes, MultiTimeframeAnalysis } from '../services/gemini';
import { useAnalysisCooldown } from '../hooks/useAnalysisCooldown';
import { AnalysisResults } from './AnalysisResults';
import { PremiumPopup } from './PremiumPopup';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import { Greeting } from './Greeting';
import { PaymentStatusMonitor } from './PaymentStatusMonitor';

type TimeframeOption = '5M' | '15M' | '1H' | '4H';

interface TimeframeData {
  screenshot: string | null;
}

export const MainAppContent: React.FC = () => {
  const [analysisType, setAnalysisType] = useState<'good' | 'best'>('good');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timeframes, setTimeframes] = useState<Record<TimeframeOption, TimeframeData>>({
    '5M': { screenshot: null },
    '15M': { screenshot: null },
    '1H': { screenshot: null },
    '4H': { screenshot: null }
  });
  const { isInCooldown, remainingTime, startCooldown } = useAnalysisCooldown();
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<MultiTimeframeAnalysis | null>(null);
  const { showPopup, incrementAnalysisCount, handlePayment, closePopup } = usePremiumStatus();

  const fileInputRefs = {
    '5M': useRef<HTMLInputElement>(null),
    '15M': useRef<HTMLInputElement>(null),
    '1H': useRef<HTMLInputElement>(null),
    '4H': useRef<HTMLInputElement>(null)
  };

  // Handler functions
  const handleFileChange = (timeframe: TimeframeOption) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload only image files');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTimeframes(prev => ({
          ...prev,
          [timeframe]: { screenshot: reader.result as string }
        }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Failed to read image file');
    }
  };

  const handleDrop = (timeframe: TimeframeOption) => (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTimeframes(prev => ({
          ...prev,
          [timeframe]: { screenshot: reader.result as string }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getRequiredTimeframes = () => {
    return analysisType === 'good' ? ['15M', '1H'] : ['5M', '15M', '1H', '4H'];
  };

  const canAnalyze = () => {
    const required = getRequiredTimeframes();
    return required.every(tf => timeframes[tf as TimeframeOption].screenshot !== null);
  };

  const analyzeScreenshots = async () => {
    if (!canAnalyze() || isInCooldown) return;

    // Check premium status before starting analysis
    if (!await incrementAnalysisCount()) {
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      const requiredTimeframes = {
        '15M': timeframes['15M'].screenshot!,
        '1H': timeframes['1H'].screenshot!
      };
      
      const analysis = await analyzeMultipleTimeframes(requiredTimeframes);
      setAnalysisResult(analysis);
      startCooldown();

    } catch (error) {
      console.error('Analysis failed:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'Failed to analyze screenshots. Please try again later.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getChartsForAnalysis = () => {
    return {
      '5M': timeframes['5M'].screenshot || undefined,
      '15M': timeframes['15M'].screenshot!,
      '1H': timeframes['1H'].screenshot!,
      '4H': timeframes['4H'].screenshot || undefined,
    };
  };

  return (
    <div className="content-layer relative z-10">
      <div className="pt-24 px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Greeting />
          <PaymentStatusMonitor />
          
          {showPopup && (
            <PremiumPopup 
              onUpgrade={handlePayment}
              onCancel={closePopup}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr,450px] gap-8">
            <div className="space-y-8">
              {error && (
                <div className="mb-6 p-4 glass-panel bg-red-500/10 border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Analysis Type Selection */}
              <section className="section-container animate-float">
                <h2 className="section-title">
                  <LineChart className="icon w-6 h-6" />
                  Analysis Type
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAnalysisType('good')}
                    className={`neon-button hover-float px-8 py-3.5 rounded-lg text-lg font-medium ${
                      analysisType === 'good' && 'active'
                    }`}
                  >
                    Good Results (15M, 1H)
                  </button>
                  <button
                    onClick={() => setAnalysisType('best')}
                    className={`neon-button hover-float px-8 py-3.5 rounded-lg text-lg font-medium ${
                      analysisType === 'best' && 'active'
                    }`}
                  >
                    Best Results (5M, 15M, 1H, 4H)
                  </button>
                </div>
              </section>

              {/* Charts Upload */}
              <section className="section-container animate-float animation-delay-200">
                <h2 className="section-title">
                  <Upload className="icon w-6 h-6" />
                  Chart Upload
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  {getRequiredTimeframes().map((timeframe) => (
                    <div key={timeframe} className="glass-panel p-6 hover-scale">
                      <h3 className="text-lg font-semibold mb-4">{timeframe} Chart</h3>
                      <input
                        type="file"
                        ref={fileInputRefs[timeframe as TimeframeOption]}
                        onChange={handleFileChange(timeframe as TimeframeOption)}
                        accept="image/*"
                        className="hidden"
                      />
                      
                      {timeframes[timeframe as TimeframeOption].screenshot ? (
                        <div className="relative group transition-transform duration-300 hover:scale-[1.02]">
                          <img
                            src={timeframes[timeframe as TimeframeOption].screenshot!}
                            alt={`${timeframe} Chart`}
                            className="w-full rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                            flex items-center justify-center transition-all duration-300 cursor-pointer"
                          >
                            <ImagePlus className="w-8 h-8" />
                          </div>
                        </div>
                      ) : (
                        <div
                          onDragOver={handleDragOver}
                          onDrop={handleDrop(timeframe as TimeframeOption)}
                          onClick={() => fileInputRefs[timeframe as TimeframeOption].current?.click()}
                          className="hover-float h-64 border-2 border-dashed border-gray-600 rounded-lg 
                            flex flex-col items-center justify-center cursor-pointer"
                        >
                          <Upload className="w-12 h-12 mb-4 neon-icon" />
                          <p className="text-gray-400">Upload {timeframe} Chart</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Analysis Controls */}
              <section className="section-container animate-float animation-delay-400">
                <div className="flex flex-col items-center gap-4">
                  <button
                    onClick={analyzeScreenshots}
                    disabled={!canAnalyze() || isAnalyzing || isInCooldown}
                    className="neon-button flex items-center gap-2 px-8 py-4 rounded-lg
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : isInCooldown ? (
                      <>
                        <RefreshCw className="w-5 h-5" />
                        Wait {remainingTime}s
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-5 h-5" />
                        Analyze Charts
                      </>
                    )}
                  </button>
                  {/* Add helper text */}
                  <p className="text-sm text-gray-400">
                    {!canAnalyze() 
                      ? `Please upload the required ${analysisType === 'good' ? '15M and 1H' : 'all'} timeframe charts`
                      : isInCooldown 
                      ? 'Take a Deep Breath for 1 Min to Refresh Your Mind'
                      : 'Ready to analyze'}
                  </p>
                </div>
              </section>
            </div>

            {/* Results Panel */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="section-container animate-float animation-delay-600">
                <h2 className="section-title">
                  <BarChart2 className="icon w-6 h-6" />
                  Analysis Results
                </h2>
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-400">Analyzing charts...</p>
                  </div>
                ) : analysisResult ? (
                  <div className="space-y-6 content-transition">
                    <AnalysisResults 
                      analysis={analysisResult} 
                      charts={getChartsForAnalysis()} 
                      tradeType={analysisType === 'good' ? 'GOOD_RESULTS' : 'BEST_RESULTS'}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <LineChart className="w-12 h-12 text-gray-600 mb-4" />
                    <p className="text-gray-400">Upload charts and click analyze<br />to see results here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
