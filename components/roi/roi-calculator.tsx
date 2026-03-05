'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Clock, DollarSign, Percent, ArrowRight, Building2, Users, CreditCard, Timer, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const ROICharts = dynamic(() => import('./roi-charts'), { ssr: false, loading: () => <div className="h-80 flex items-center justify-center text-gray-500">Loading charts...</div> });

const AVERAGE_HOURLY_RATE = 75; // Average ops/admin hourly rate
const EFFICIENCY_MULTIPLIER = 0.65; // Syndicate saves ~65% of manual ops time
const MONTHLY_SYNDICATE_COST_PER_EMPLOYEE = 15; // Estimated cost per employee

// ERP cost estimates based on industry data
const ERP_IMPLEMENTATION_BASE = 150000; // Base implementation cost
const ERP_IMPLEMENTATION_PER_EMPLOYEE = 1500; // Per employee implementation
const ERP_ANNUAL_LICENSE_PER_EMPLOYEE = 200; // Per employee per year
const ERP_ANNUAL_MAINTENANCE_PERCENT = 0.20; // 20% of implementation for maintenance
const ERP_CONSULTANT_MONTHLY = 15000; // Ongoing consultant fees
const ERP_IMPLEMENTATION_MONTHS = 14; // Average implementation time

export default function ROICalculator() {
  const searchParams = useSearchParams();
  const [compareMode, setCompareMode] = useState(false);
  
  useEffect(() => {
    if (searchParams.get('compare') === 'erp') {
      setCompareMode(true);
    }
  }, [searchParams]);

  const [inputs, setInputs] = useState({
    employees: 50,
    departments: 4,
    monthlySpend: 25000,
    weeklyHours: 40,
  });

  const results = useMemo(() => {
    const monthlySavingsHours = inputs.weeklyHours * EFFICIENCY_MULTIPLIER * 4.33;
    const monthlyCostSavings = monthlySavingsHours * AVERAGE_HOURLY_RATE;
    const annualCostSavings = monthlyCostSavings * 12;
    const syndicateCost = inputs.employees * MONTHLY_SYNDICATE_COST_PER_EMPLOYEE;
    const netMonthlySavings = monthlyCostSavings - syndicateCost;
    const roi = syndicateCost > 0 ? ((netMonthlySavings / syndicateCost) * 100) : 0;
    const paybackMonths = netMonthlySavings > 0 ? Math.ceil(syndicateCost / netMonthlySavings) : 12;
    const efficiencyGain = EFFICIENCY_MULTIPLIER * 100;

    // ERP costs calculation
    const erpImplementation = ERP_IMPLEMENTATION_BASE + (inputs.employees * ERP_IMPLEMENTATION_PER_EMPLOYEE);
    const erpAnnualLicenses = inputs.employees * ERP_ANNUAL_LICENSE_PER_EMPLOYEE;
    const erpAnnualMaintenance = erpImplementation * ERP_ANNUAL_MAINTENANCE_PERCENT;
    const erpAnnualConsultant = ERP_CONSULTANT_MONTHLY * 12;
    const erpYear1Total = erpImplementation + erpAnnualLicenses + erpAnnualMaintenance;
    const erpOngoingAnnual = erpAnnualLicenses + erpAnnualMaintenance + erpAnnualConsultant;
    const erp3YearTCO = erpYear1Total + (erpOngoingAnnual * 2);

    // Syndicate 3-year TCO
    const syndicateAnnualCost = syndicateCost * 12;
    const syndicate3YearTCO = syndicateAnnualCost * 3;
    const syndicate3YearSavings = annualCostSavings * 3;
    const syndicate3YearNet = syndicate3YearSavings - syndicate3YearTCO;

    // Comparison
    const savings3YearVsErp = erp3YearTCO - syndicate3YearTCO + syndicate3YearSavings;

    return {
      monthlySavingsHours: Math.round(monthlySavingsHours),
      monthlyCostSavings: Math.round(monthlyCostSavings),
      annualCostSavings: Math.round(annualCostSavings),
      netMonthlySavings: Math.round(netMonthlySavings),
      roi: Math.round(roi),
      paybackMonths: Math.min(paybackMonths, 12),
      efficiencyGain: Math.round(efficiencyGain),
      syndicateCost: Math.round(syndicateCost),
      // ERP comparison data
      erpImplementation: Math.round(erpImplementation),
      erpYear1Total: Math.round(erpYear1Total),
      erpOngoingAnnual: Math.round(erpOngoingAnnual),
      erp3YearTCO: Math.round(erp3YearTCO),
      syndicate3YearTCO: Math.round(syndicate3YearTCO),
      savings3YearVsErp: Math.round(savings3YearVsErp),
      erpImplementationMonths: ERP_IMPLEMENTATION_MONTHS,
    };
  }, [inputs]);

  const handleChange = (field: keyof typeof inputs, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <section className="py-16">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <Calculator className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-300">Interactive ROI Calculator</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Calculate Your <span className="gradient-text">Automation Savings</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto mb-6">
            See how much time and money GhostFoundry-Syndicate can save your organization with AI-powered operations automation.
          </p>
          
          {/* Compare Mode Toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-lg glass-card">
            <button
              onClick={() => setCompareMode(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                !compareMode 
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Standard ROI
            </button>
            <button
              onClick={() => setCompareMode(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                compareMode 
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              vs ERP Comparison
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-8"
          >
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              Your Organization
            </h2>

            <div className="space-y-8">
              {/* Employees */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 text-gray-300">
                    <Users className="w-4 h-4 text-cyan-400" />
                    Company Size
                  </label>
                  <span className="text-cyan-400 font-semibold">{inputs.employees} employees</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={inputs.employees}
                  onChange={(e) => handleChange('employees', parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10</span>
                  <span>500</span>
                </div>
              </div>

              {/* Departments */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 text-gray-300">
                    <Building2 className="w-4 h-4 text-purple-400" />
                    Departments/Functions
                  </label>
                  <span className="text-purple-400 font-semibold">{inputs.departments} departments</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="15"
                  step="1"
                  value={inputs.departments}
                  onChange={(e) => handleChange('departments', parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>2</span>
                  <span>15</span>
                </div>
              </div>

              {/* Monthly SaaS Spend */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 text-gray-300">
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                    Monthly SaaS Spend
                  </label>
                  <span className="text-cyan-400 font-semibold">{formatCurrency(inputs.monthlySpend)}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="200000"
                  step="5000"
                  value={inputs.monthlySpend}
                  onChange={(e) => handleChange('monthlySpend', parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$5K</span>
                  <span>$200K</span>
                </div>
              </div>

              {/* Weekly Manual Hours */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 text-gray-300">
                    <Timer className="w-4 h-4 text-purple-400" />
                    Weekly Manual Ops Hours
                  </label>
                  <span className="text-purple-400 font-semibold">{inputs.weeklyHours} hours</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={inputs.weeklyHours}
                  onChange={(e) => handleChange('weeklyHours', parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10 hrs</span>
                  <span>200 hrs</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card rounded-xl p-6 text-center">
                <Clock className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <p className="text-3xl font-bold text-white">{results.monthlySavingsHours}</p>
                <p className="text-sm text-gray-400">Hours Saved/Month</p>
              </div>
              <div className="glass-card rounded-xl p-6 text-center">
                <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <p className="text-3xl font-bold text-white">{formatCurrency(results.monthlyCostSavings)}</p>
                <p className="text-sm text-gray-400">Monthly Savings</p>
              </div>
              <div className="glass-card rounded-xl p-6 text-center">
                <Percent className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <p className="text-3xl font-bold text-white">{results.efficiencyGain}%</p>
                <p className="text-sm text-gray-400">Efficiency Gain</p>
              </div>
              <div className="glass-card rounded-xl p-6 text-center">
                <TrendingUp className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <p className="text-3xl font-bold text-white">{results.roi}%</p>
                <p className="text-sm text-gray-400">First-Year ROI</p>
              </div>
            </div>

            {/* Annual summary */}
            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10">
              <h3 className="text-lg font-semibold text-white mb-4">Annual Impact</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Annual Cost Savings</span>
                  <span className="text-green-400 font-semibold">{formatCurrency(results.annualCostSavings)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Est. Syndicate Cost</span>
                  <span className="text-gray-300">{formatCurrency(results.syndicateCost * 12)}/year</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between">
                  <span className="text-white font-medium">Net Annual Benefit</span>
                  <span className="text-cyan-400 font-bold">{formatCurrency(results.netMonthlySavings * 12)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payback Period</span>
                  <span className="text-purple-400 font-semibold">{results.paybackMonths} month{results.paybackMonths !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <ROICharts results={results} inputs={inputs} />
        </motion.div>

        {/* ERP Comparison Section */}
        {compareMode && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-12"
          >
            <div className="glass-card rounded-2xl p-8 border-red-500/30">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">The True Cost of Traditional ERP</h3>
                  <p className="text-gray-400">Based on industry averages for companies your size</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* ERP Costs */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    Traditional ERP
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-red-500/10">
                      <span className="text-gray-300">Implementation Cost</span>
                      <span className="text-red-400 font-semibold">{formatCurrency(results.erpImplementation)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-red-500/10">
                      <span className="text-gray-300">Implementation Time</span>
                      <span className="text-red-400 font-semibold">{results.erpImplementationMonths} months</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-red-500/10">
                      <span className="text-gray-300">Year 1 Total</span>
                      <span className="text-red-400 font-semibold">{formatCurrency(results.erpYear1Total)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-red-500/10">
                      <span className="text-gray-300">Ongoing Annual</span>
                      <span className="text-red-400 font-semibold">{formatCurrency(results.erpOngoingAnnual)}/yr</span>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-lg bg-red-500/20 border border-red-500/30">
                      <span className="text-white font-medium">3-Year TCO</span>
                      <span className="text-red-400 font-bold text-xl">{formatCurrency(results.erp3YearTCO)}</span>
                    </div>
                  </div>
                </div>

                {/* Syndicate Costs */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    GhostFoundry-Syndicate
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-cyan-500/10">
                      <span className="text-gray-300">Implementation Cost</span>
                      <span className="text-cyan-400 font-semibold">$0</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-cyan-500/10">
                      <span className="text-gray-300">Time to Value</span>
                      <span className="text-cyan-400 font-semibold">3 weeks</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-cyan-500/10">
                      <span className="text-gray-300">Annual Cost</span>
                      <span className="text-cyan-400 font-semibold">{formatCurrency(results.syndicateCost * 12)}/yr</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/10">
                      <span className="text-gray-300">Annual Savings Generated</span>
                      <span className="text-green-400 font-semibold">+{formatCurrency(results.annualCostSavings)}/yr</span>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                      <span className="text-white font-medium">3-Year Net Cost</span>
                      <span className="text-cyan-400 font-bold text-xl">{formatCurrency(results.syndicate3YearTCO)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Savings Summary */}
              <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
                <div className="text-center">
                  <p className="text-gray-300 mb-2">Your 3-Year Total Benefit vs ERP</p>
                  <p className="text-4xl md:text-5xl font-bold gradient-text mb-4">
                    {formatCurrency(results.savings3YearVsErp)}
                  </p>
                  <div className="flex flex-wrap justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">No upfront costs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Live in 3 weeks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">No consultants needed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="glass-card rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to realize these savings?
            </h3>
            <p className="text-gray-400 mb-6">
              Join our Design Partner Program and start automating your operations with AI-powered agents.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/#design-partner"
                className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-purple-500 transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 flex items-center gap-2"
              >
                Apply for Design Partner
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
