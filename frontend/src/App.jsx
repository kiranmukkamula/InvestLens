import React, { useState } from 'react';
import axios from 'axios';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Award, 
  Activity, 
  Globe, 
  Clock, 
  HelpCircle, 
  FileText, 
  ShieldAlert, 
  CheckCircle,
  Briefcase,
  DollarSign,
  Newspaper,
  BookOpen
} from 'lucide-react';

export default function App() {
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState([]);
  const [fromCache, setFromCache] = useState(false);

  // Helper formatting functions
  const formatCurrency = (val) => {
    if (val === null || val === undefined || isNaN(val)) return 'N/A';
    const num = Number(val);
    const abs = Math.abs(num);
    if (abs >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (abs >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (abs >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercent = (val) => {
    if (val === null || val === undefined || isNaN(val)) return 'N/A';
    return `${(Number(val) * 100).toFixed(2)}%`;
  };

  const formatRatio = (val) => {
    if (val === null || val === undefined || isNaN(val)) return 'N/A';
    return Number(val).toFixed(2);
  };

  // Triggers backend analysis request
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    setLoading(true);
    setError(null);
    setErrorDetails([]);
    setReport(null);

    try {
      const targetSymbol = symbol.toUpperCase().trim();
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await axios.get(`${apiBaseUrl}/api/analyze/${targetSymbol}`);
      
      if (response.data && response.data.success) {
        setReport(response.data.data);
        setFromCache(response.data.fromCache);
      } else {
        setError('Analysis failed.');
      }
    } catch (err) {
      console.error(err);
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const errMsg = err.response?.data?.error || `Failed to connect to the backend server at ${apiBaseUrl}. Please verify the server is online.`;
      const errDetails = err.response?.data?.details || [];
      setError(errMsg);
      setErrorDetails(errDetails);
    } finally {
      setLoading(false);
    }
  };

  // Color mappings for scores and recommendations
  const getRecBadgeColor = (rec) => {
    if (rec === 'INVEST') return 'bg-brand-green/20 text-brand-green border-brand-green/40 shadow-glow';
    if (rec === 'WATCH') return 'bg-brand-amber/20 text-brand-amber border-brand-amber/40 shadow-glow-amber';
    return 'bg-brand-red/20 text-brand-red border-brand-red/40 shadow-glow-red';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-brand-green border-brand-green/30';
    if (score >= 60) return 'text-brand-amber border-brand-amber/30';
    return 'text-brand-red border-brand-red/30';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      
      {/* Header Branding */}
      <header className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-brand-border pb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-brand-text via-[#e2e8f0] to-brand-muted bg-clip-text text-transparent font-sans">
            InvestLens
          </h1>
          <p className="text-brand-muted mt-2 text-sm md:text-base">
            Institutional-Grade Multi-Agent AI Investment Decision System
          </p>
        </div>
        
        {/* Search Bar Input */}
        <form onSubmit={handleSearch} className="w-full md:w-96">
          <div className="relative flex rounded-lg shadow-sm">
            <input
              type="text"
              placeholder="Enter ticker (e.g. AAPL, TSLA)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              disabled={loading}
              className="w-full pl-4 pr-12 py-3 bg-brand-card rounded-l-lg border border-brand-border text-brand-text placeholder-brand-muted focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green transition-all"
            />
            <button
              type="submit"
              disabled={loading || !symbol.trim()}
              className="absolute right-0 top-0 bottom-0 px-4 bg-brand-green/10 text-brand-green border border-l-0 border-brand-border rounded-r-lg hover:bg-brand-green/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <Clock className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </header>

      {/* Loading State Animation */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 glass-panel rounded-xl shadow-xl space-y-4">
          <Clock className="w-12 h-12 text-brand-green animate-spin" />
          <h3 className="text-xl font-semibold">Orchestrating AI Investment Agents...</h3>
          <p className="text-brand-muted text-sm text-center max-w-md px-4">
            Calling Finnhub, Yahoo Finance, and News API tools. Transforming data schema, running calculations, analyzing SWOT, and generating ratings via Groq Llama 3.3 70B.
          </p>
        </div>
      )}

      {/* Error Alert Box */}
      {error && (
        <div className="p-6 bg-brand-red/10 border border-brand-red/30 rounded-xl mb-8 space-y-3 shadow-glow-red">
          <div className="flex items-center space-x-3 text-brand-red">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <h3 className="font-bold text-lg">Error Executing Analysis</h3>
          </div>
          <p className="text-brand-text/90">{error}</p>
          {errorDetails.length > 0 && (
            <ul className="list-disc pl-5 text-sm text-brand-muted space-y-1">
              {errorDetails.map((det, index) => (
                <li key={index}>{det}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Initial Landing Screen */}
      {!loading && !report && !error && (
        <div className="text-center py-20 bg-brand-card/30 border border-brand-border rounded-2xl flex flex-col items-center max-w-3xl mx-auto px-6">
          <Award className="w-16 h-16 text-brand-green mb-4 opacity-75" />
          <h2 className="text-2xl font-bold font-sans">Corporate Investment Analyzer</h2>
          <p className="text-brand-muted mt-3 max-w-lg">
            Enter a publicly listed company stock ticker (e.g. <b>AAPL</b>, <b>TSLA</b>) to initiate a full fundamental analysis report using LangGraph and Groq Llama 3.3 70B.
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            <div className="p-4 rounded-xl border border-brand-border bg-brand-card/45">
              <span className="text-brand-green font-bold block mb-1">ReAct Tools</span>
              <span className="text-xs text-brand-muted">Finnhub profile & Yahoo Finance data retrieval</span>
            </div>
            <div className="p-4 rounded-xl border border-brand-border bg-brand-card/45">
              <span className="text-brand-green font-bold block mb-1">Deduplicated News</span>
              <span className="text-xs text-brand-muted">Unified sentiment analysis from Tavily & NewsAPI</span>
            </div>
            <div className="p-4 rounded-xl border border-brand-border bg-brand-card/45">
              <span className="text-brand-green font-bold block mb-1">Calculations</span>
              <span className="text-xs text-brand-muted">Precise ratios using safe floating math</span>
            </div>
          </div>
        </div>
      )}

      {/* Report Dashboard Screen */}
      {!loading && report && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Section 1: Ratings & Scores Overview */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* Overall Score Ring Gauge */}
            <div className="glass-panel p-6 md:p-8 rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 rounded-full blur-2xl pointer-events-none"></div>
              <h3 className="text-lg font-bold text-brand-muted mb-4 uppercase tracking-wider">Overall Stance Score</h3>
              
              <div className="relative flex items-center justify-center mb-4">
                <div className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center ${getScoreColor(report.decision.overallInvestmentScore)}`}>
                  <span className="text-4xl font-extrabold font-sans">{report.decision.overallInvestmentScore}</span>
                  <span className="text-xs text-brand-muted uppercase font-semibold">/ 100</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center space-x-1.5 text-sm">
                  <span className="text-brand-muted">Confidence Level:</span>
                  <span className="font-bold text-brand-text">{formatPercent(report.decision.confidenceLevel)}</span>
                </div>
                <div className="text-xs text-brand-muted italic mt-1 flex items-center justify-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Served from {fromCache ? 'Redis Cache' : 'Live Graph Run'}</span>
                </div>
              </div>
            </div>

            {/* Category Rating breakdown */}
            <div className="lg:col-span-2 glass-panel p-6 md:p-8 rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold font-sans text-brand-text mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-brand-green" />
                  Category Rating breakdown
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { title: 'Business Moat', value: report.decision.businessScore, label: 'Moat & Market Power' },
                    { title: 'Financials Health', value: report.decision.financialScore, label: 'Liquidity & Assets' },
                    { title: 'Sentiment', value: report.decision.newsScore, label: 'News & Events' },
                    { title: 'Safety Level', value: report.decision.riskScore, label: 'Mitigated Risks' },
                    { title: 'Growth Vectors', value: report.decision.growthScore, label: 'Expansion Runways' }
                  ].map((cat, index) => (
                    <div key={index} className="p-4 rounded-xl border border-brand-border/40 bg-brand-card/45 flex flex-col items-center text-center">
                      <span className="text-xs text-brand-muted font-semibold uppercase tracking-wider block mb-2">{cat.title}</span>
                      <div className={`text-2xl font-bold font-sans border-b border-brand-border pb-1 mb-2 w-16 ${getScoreColor(cat.value)}`}>
                        {cat.value}
                      </div>
                      <span className="text-[10px] text-brand-muted leading-tight">{cat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </section>

          {/* Section 2: Company Summary & Core Value Proposition */}
          <section className="glass-panel p-6 md:p-8 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-3xl font-extrabold font-sans text-brand-text">{report.company.name}</h2>
                <span className="text-sm text-brand-muted uppercase font-semibold tracking-wider">
                  {report.company.ticker} · {report.company.industry}
                </span>
              </div>
              
              <div className={`px-6 py-2.5 rounded-full border text-xl font-extrabold tracking-widest ${getRecBadgeColor(report.decision.recommendation)}`}>
                {report.decision.recommendation}
              </div>
            </div>

            {/* Core Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-brand-border/40">
              
              {/* Column 1: Typical Introductory Summary Line */}
              <div className="md:col-span-3 p-5 rounded-xl border border-brand-border/40 bg-brand-green/5 space-y-2">
                <span className="text-xs uppercase tracking-wider text-brand-green font-bold block">Value Proposition & Focus</span>
                <p className="text-base text-brand-text font-semibold italic leading-relaxed">
                  "{report.analysis?.companySummary?.typicalDescriptionLines || 
                    `As a leading hybrid ${report.company.industry} company, ${report.company.name} is dedicated to building state-of-the-art products and services.`}"
                </p>
              </div>

              {/* Column 2: What it Does */}
              <div className="p-4 rounded-xl border border-brand-border/40 bg-brand-card/25 space-y-2">
                <span className="text-xs uppercase tracking-wider text-brand-muted font-bold block">What It Does</span>
                <p className="text-sm text-brand-text/90 leading-relaxed">
                  {report.analysis?.companySummary?.whatItDoes || 
                    `${report.company.name} operates core business units inside the ${report.company.industry} sector, serving clients and consumers globally.`}
                </p>
              </div>

              {/* Column 3: What it Solves */}
              <div className="p-4 rounded-xl border border-brand-border/40 bg-brand-card/25 space-y-2">
                <span className="text-xs uppercase tracking-wider text-brand-muted font-bold block">What It Solves</span>
                <p className="text-sm text-brand-text/90 leading-relaxed">
                  {report.analysis?.companySummary?.whatItSolves || 
                    `It addresses critical market requirements and resolves operational complexities for users within the ${report.company.industry} market.`}
                </p>
              </div>

              {/* Column 4: Business Model Classification */}
              <div className="p-4 rounded-xl border border-brand-border/40 bg-brand-card/25 flex flex-col justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-brand-muted font-bold block mb-2">Business Model</span>
                  <span className="text-sm text-brand-text/90">Classification:</span>
                  <span className="text-lg font-extrabold capitalize text-brand-green tracking-wider block mt-1">
                    {report.analysis?.companySummary?.businessType || 'Hybrid Model'}
                  </span>
                </div>
                <span className="text-[10px] text-brand-muted block mt-2">Classified by cognitive agent</span>
              </div>

            </div>
          </section>

          {/* Section 3: Other Corporate Profile Additionals */}
          <section className="glass-panel p-6 md:p-8 rounded-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-brand-muted uppercase tracking-wider mb-3">About the Corporation</h3>
              <p className="text-brand-text/95 leading-relaxed text-sm md:text-base">
                {report.company.description}
              </p>
            </div>

            {/* Profile Details List */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-brand-border/40 text-sm">
              <div>
                <span className="text-brand-muted block mb-0.5">CEO</span>
                <span className="font-semibold text-brand-text">{report.company.ceo}</span>
              </div>
              <div>
                <span className="text-brand-muted block mb-0.5">Headquarters</span>
                <span className="font-semibold text-brand-text truncate block" title={report.company.headquarters}>
                  {report.company.headquarters}
                </span>
              </div>
              <div>
                <span className="text-brand-muted block mb-0.5">Employees</span>
                <span className="font-semibold text-brand-text">
                  {report.company.employees ? report.company.employees.toLocaleString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-brand-muted block mb-0.5">IPO Date</span>
                <span className="font-semibold text-brand-text">{report.company.ipoDate}</span>
              </div>
            </div>
          </section>

          {/* Section 4: Financial metrics Grid & Statements */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* Financial Metrics Indicators Table */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold font-sans text-brand-text mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-brand-green" />
                  Key Financial Metrics
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border text-brand-muted text-xs uppercase">
                        <th className="py-2.5">Indicator</th>
                        <th className="py-2.5 text-right">Current Value</th>
                        <th className="py-2.5 text-right">Prior Year</th>
                        <th className="py-2.5 text-right">Trend / Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/30 text-brand-text/90">
                      <tr>
                        <td className="py-3 font-semibold">Total Revenue</td>
                        <td className="py-3 text-right">{formatCurrency(report.metrics.revenue)}</td>
                        <td className="py-3 text-right">{formatCurrency(report.metrics.priorRevenue)}</td>
                        <td className={`py-3 text-right font-bold ${report.metrics.revenueGrowth >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                          {formatPercent(report.metrics.revenueGrowth)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 font-semibold">Net Income</td>
                        <td className="py-3 text-right">{formatCurrency(report.metrics.netIncome)}</td>
                        <td className="py-3 text-right">{formatCurrency(report.metrics.priorNetIncome)}</td>
                        <td className={`py-3 text-right font-bold ${report.metrics.profitGrowth >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                          {formatPercent(report.metrics.profitGrowth)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 font-semibold">Operating Margin</td>
                        <td className="py-3 text-right" colSpan="2">{formatPercent(report.metrics.operatingMargin)}</td>
                        <td className="py-3 text-right text-brand-muted">Sales Efficiency</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-semibold">Liquidity (Current / Quick)</td>
                        <td className="py-3 text-right">{formatRatio(report.metrics.currentRatio)}</td>
                        <td className="py-3 text-right">{formatRatio(report.metrics.quickRatio)}</td>
                        <td className="py-3 text-right text-brand-muted">Solvency</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-semibold">Leverage (Debt Ratio)</td>
                        <td className="py-3 text-right" colSpan="2">{formatPercent(report.metrics.debtRatio)}</td>
                        <td className="py-3 text-right text-brand-muted">Capital Strain</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-semibold">Return Ratios (ROE / ROA)</td>
                        <td className="py-3 text-right">{formatPercent(report.metrics.roe)}</td>
                        <td className="py-3 text-right">{formatPercent(report.metrics.roa)}</td>
                        <td className="py-3 text-right text-brand-muted">Efficiency</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-semibold">Valuation (P/E / PEG)</td>
                        <td className="py-3 text-right">{report.metrics.pe ? formatRatio(report.metrics.pe) : 'N/A'}</td>
                        <td className="py-3 text-right">{report.metrics.peg ? formatRatio(report.metrics.peg) : 'N/A'}</td>
                        <td className="py-3 text-right text-brand-muted">Pricing Multiples</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Profile Statistics Card */}
            <div className="glass-panel p-6 rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold font-sans text-brand-text mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-brand-green" />
                  Corporate Capitalization
                </h3>
                
                <div className="space-y-4 text-sm mt-4">
                  <div className="p-3.5 rounded-lg border border-brand-border bg-brand-card/25 flex items-center justify-between">
                    <span className="text-brand-muted">Market Capitalization</span>
                    <span className="font-bold text-brand-text">{formatCurrency(report.company.marketCapitalization)}</span>
                  </div>
                  
                  <div className="p-3.5 rounded-lg border border-brand-border bg-brand-card/25">
                    <span className="text-brand-muted block mb-2">Competitors</span>
                    {report.company.competitors.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {report.company.competitors.map((comp, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-brand-card border border-brand-border/60 text-xs rounded text-brand-text">
                            {comp}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-brand-muted text-xs italic">No competitor details available.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </section>

          {/* Section 4: SWOT Analysis Matrix */}
          <section className="glass-panel p-6 md:p-8 rounded-xl">
            <h3 className="text-xl font-bold font-sans text-brand-text mb-6 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-brand-green" />
              Agent Qualitative SWOT Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Strengths */}
              <div className="p-5 rounded-xl border border-brand-green/20 bg-brand-green/5">
                <h4 className="text-brand-green font-bold flex items-center gap-2 text-base mb-3 font-sans uppercase">
                  <CheckCircle className="w-4 h-4" />
                  Core Strengths
                </h4>
                <ul className="space-y-2 text-sm text-brand-text/90 list-disc pl-4">
                  {report.analysis.businessAnalysis.strengths.slice(0, 3).map((st, i) => (
                    <li key={i}>{st}</li>
                  ))}
                  {report.analysis.financialAnalysis.strengths.slice(0, 2).map((st, i) => (
                    <li key={i}>{st}</li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="p-5 rounded-xl border border-brand-amber/20 bg-brand-amber/5">
                <h4 className="text-brand-amber font-bold flex items-center gap-2 text-base mb-3 font-sans uppercase">
                  <AlertTriangle className="w-4 h-4" />
                  Weaknesses & Vulnerabilities
                </h4>
                <ul className="space-y-2 text-sm text-brand-text/90 list-disc pl-4">
                  {report.analysis.businessAnalysis.weaknesses.slice(0, 3).map((wk, i) => (
                    <li key={i}>{wk}</li>
                  ))}
                  {report.analysis.financialAnalysis.weaknesses.slice(0, 2).map((wk, i) => (
                    <li key={i}>{wk}</li>
                  ))}
                </ul>
              </div>

              {/* Opportunities */}
              <div className="p-5 rounded-xl border-brand-green/20 bg-brand-green/5">
                <h4 className="text-brand-green font-bold flex items-center gap-2 text-base mb-3 font-sans uppercase">
                  <TrendingUp className="w-4 h-4" />
                  Growth Opportunities
                </h4>
                <ul className="space-y-2 text-sm text-brand-text/90 list-disc pl-4">
                  {report.analysis.businessAnalysis.opportunities.slice(0, 3).map((op, i) => (
                    <li key={i}>{op}</li>
                  ))}
                  {report.analysis.financialAnalysis.opportunities.slice(0, 2).map((op, i) => (
                    <li key={i}>{op}</li>
                  ))}
                </ul>
              </div>

              {/* Risks */}
              <div className="p-5 rounded-xl border border-brand-red/20 bg-brand-red/5">
                <h4 className="text-brand-red font-bold flex items-center gap-2 text-base mb-3 font-sans uppercase">
                  <ShieldAlert className="w-4 h-4" />
                  Structural & Capital Risks
                </h4>
                <ul className="space-y-2 text-sm text-brand-text/90 list-disc pl-4">
                  {report.analysis.businessAnalysis.risks.slice(0, 3).map((ri, i) => (
                    <li key={i}>{ri}</li>
                  ))}
                  {report.analysis.financialAnalysis.risks.slice(0, 2).map((ri, i) => (
                    <li key={i}>{ri}</li>
                  ))}
                </ul>
              </div>

            </div>
          </section>

          {/* Section 5: CIO Detailed Thesis Explanation */}
          <section className="glass-panel p-6 md:p-8 rounded-xl space-y-6">
            <h3 className="text-xl font-bold font-sans text-brand-text flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-green" />
              Investment Committee Thesis
            </h3>
            
            <div className="p-5 rounded-lg border border-brand-border bg-brand-card/25">
              <h4 className="text-sm text-brand-muted uppercase font-bold tracking-wider mb-2">Rationale Summary</h4>
              <p className="text-sm md:text-base leading-relaxed text-brand-text/90 whitespace-pre-line">
                {report.decision.detailedExplanation}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              
              {/* Short Term Outlook */}
              <div className="p-4 rounded-lg border border-brand-border bg-brand-card/35">
                <span className="text-xs text-brand-muted font-bold block uppercase tracking-wider mb-1">Short-term Outlook (12 Months)</span>
                <p className="text-sm text-brand-text/90 leading-relaxed">
                  {report.decision.shortTermOutlook}
                </p>
              </div>

              {/* Long Term Outlook */}
              <div className="p-4 rounded-lg border border-brand-border bg-brand-card/35">
                <span className="text-xs text-brand-muted font-bold block uppercase tracking-wider mb-1">Long-term Outlook (3-5 Years)</span>
                <p className="text-sm text-brand-text/90 leading-relaxed">
                  {report.decision.longTermOutlook}
                </p>
              </div>

            </div>

            {/* Cited Evidence */}
            <div className="pt-4 border-t border-brand-border/40 mt-6">
              <h4 className="text-xs text-brand-muted uppercase font-bold tracking-wider mb-2.5">Specific Evidence Cited By Agents</h4>
              <div className="flex flex-wrap gap-2">
                {report.decision.evidenceUsed.map((ev, i) => (
                  <span key={i} className="px-2 py-1 bg-brand-card border border-brand-border/60 text-xs rounded text-brand-muted">
                    {ev}
                  </span>
                ))}
              </div>
            </div>

          </section>

          {/* Section 6: Corporate News & Sentiment */}
          <section className="glass-panel p-6 md:p-8 rounded-xl space-y-6">
            <h3 className="text-xl font-bold font-sans text-brand-text flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-brand-green" />
              Corporate News Sentiment
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Positive News */}
              <div className="p-4 rounded-xl border border-brand-green/20 bg-brand-green/5 space-y-2">
                <h4 className="text-brand-green text-sm font-bold uppercase tracking-wider">Positive Sentiment</h4>
                <ul className="text-xs text-brand-text/80 space-y-2 list-disc pl-4">
                  {report.analysis.newsAnalysis.positiveEvents.map((ev, i) => (
                    <li key={i}>{ev}</li>
                  ))}
                </ul>
              </div>

              {/* Negative News */}
              <div className="p-4 rounded-xl border border-brand-red/20 bg-brand-red/5 space-y-2">
                <h4 className="text-brand-red text-sm font-bold uppercase tracking-wider">Negative/Risk Sentiment</h4>
                <ul className="text-xs text-brand-text/80 space-y-2 list-disc pl-4">
                  {report.analysis.newsAnalysis.negativeEvents.map((ev, i) => (
                    <li key={i}>{ev}</li>
                  ))}
                </ul>
              </div>

              {/* Neutral News */}
              <div className="p-4 rounded-xl border border-brand-border/60 bg-brand-card/35 space-y-2">
                <h4 className="text-brand-muted text-sm font-bold uppercase tracking-wider">Neutral Events</h4>
                <ul className="text-xs text-brand-text/80 space-y-2 list-disc pl-4">
                  {report.analysis.newsAnalysis.neutralEvents.map((ev, i) => (
                    <li key={i}>{ev}</li>
                  ))}
                </ul>
              </div>

            </div>

            {/* News Articles Reference List */}
            <div className="pt-6 border-t border-brand-border/40 mt-6">
              <h4 className="text-sm font-bold text-brand-text mb-4">Referenced Article Headers</h4>
              <div className="space-y-3.5">
                {report.news.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-brand-border bg-brand-card/15 hover:border-brand-border/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm">
                    <div className="space-y-1">
                      <h5 className="font-bold text-brand-text">{item.title}</h5>
                      <p className="text-xs text-brand-muted leading-relaxed max-w-4xl">{item.summary}</p>
                    </div>
                    <div className="text-right flex-shrink-0 flex md:flex-col items-start md:items-end justify-between md:justify-center text-xs text-brand-muted">
                      <span className="font-semibold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded border border-brand-green/20 mb-1">
                        {item.source}
                      </span>
                      <span>{item.publishedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Warnings Footer Alert */}
          {report.warnings && report.warnings.length > 0 && (
            <section className="p-4 bg-brand-amber/10 border border-brand-amber/30 rounded-xl flex items-start space-x-3 text-xs text-brand-amber">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block uppercase tracking-wider mb-1">Data Collection Warnings:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  {report.warnings.map((warn, i) => (
                    <li key={i}>{warn}</li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Footer Metadata */}
          <footer className="text-center py-8 text-xs text-brand-muted border-t border-brand-border/40 flex items-center justify-between gap-4 flex-wrap">
            <span>Enterprise Investment Advisor System · Verified by InvestLens</span>
            <span>Generated: {new Date(report.generatedAt).toLocaleString()}</span>
          </footer>

        </div>
      )}

    </div>
  );
}
