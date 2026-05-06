'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Award } from 'lucide-react';
import { mlmAPI } from '../lib/api';

const TreeVisualization = ({ onRunConsolidation }: { onRunConsolidation: () => void }): JSX.Element => {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [expandedLevels, setExpandedLevels] = useState(new Set([0, 1, 2]));
  const [showRepositioningInfo, setShowRepositioningInfo] = useState(true);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    mlmAPI.getTree().then((res) => {
      setTreeData(res.tree || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const refreshTree = () => {
    setLoading(true);
    mlmAPI.getTree().then((res) => {
      setTreeData(res.tree || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const toggleLevel = (level) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(level)) {
      newExpanded.delete(level);
    } else {
      newExpanded.add(level);
    }
    setExpandedLevels(newExpanded);
  };

  const getUserTypeColor = (userType) => {
    switch(userType) {
      case 'founder': return 'bg-yellow-50 border-yellow-400 text-yellow-900';
      case 'customer': return 'bg-blue-50 border-blue-300 text-blue-900';
      case 'brand_owner': return 'bg-purple-50 border-purple-300 text-purple-900';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getUserTypeBadge = (userType) => {
    switch(userType) {
      case 'founder': return 'bg-yellow-200 text-yellow-800';
      case 'customer': return 'bg-blue-200 text-blue-800';
      case 'brand_owner': return 'bg-purple-200 text-purple-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const calculateRewardCredits = (turnover) => {
    let credits = 0;
    let remainingTurnover = turnover;
    
    if (remainingTurnover > 0) {
      const firstSlab = Math.min(remainingTurnover, 200000);
      if (firstSlab >= 200000) credits += 10;
      remainingTurnover -= firstSlab;
    }
    if (remainingTurnover > 0) {
      const secondSlab = Math.min(remainingTurnover, 500000);
      if (secondSlab >= 500000) credits += 15;
      remainingTurnover -= secondSlab;
    }
    if (remainingTurnover > 0) {
      const thirdSlab = Math.min(remainingTurnover, 1000000);
      if (thirdSlab >= 1000000) credits += 20;
      remainingTurnover -= thirdSlab;
    }
    if (remainingTurnover > 0) {
      credits += Math.floor(remainingTurnover / 2000000) * 25;
    }
    return credits;
  };

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading tree from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto pt-20">
        <div className="bg-white p-6 rounded-xl shadow-xl mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">Binary Tree Visualization</h3>
              <p className="text-sm text-gray-600">BFS Allocation: Left to Right, Top to Bottom</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={refreshTree}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition transform hover:scale-105"
              >
                🔄 Refresh
              </button>
              <button
                onClick={async () => {
                  try {
                    const result = await mlmAPI.runConsolidation() as any;
                  
                    let alertMessage = `${result.message}\n\nTotal Users: ${result.totalUsers}`;
                  
                    if (result.swapsPerformed > 0) {
                      alertMessage += `\n\n🔄 Tree Restructured: ${result.swapsPerformed} swap(s) performed.`;
                      alertMessage += `\n\n--- Swap Details ---`;
                      result.swapDetails.forEach((swap: any) => {
                        alertMessage += `\n\nChild (${swap.childId}) earned more than Parent (${swap.parentId}).`;
                        alertMessage += `\n  - ${swap.childName}: ₹${swap.childIncome.toFixed(2)}`;
                        alertMessage += `\n  - ${swap.parentName}: ₹${swap.parentIncome.toFixed(2)}`;
                      });
                    } else {
                      alertMessage += `\n\n✅ No tree restructuring was needed.`;
                    }

                    if (result.creditAllocations && result.creditAllocations.length > 0) {
                      alertMessage += `\n\n🏆 Reward Credits Allocated: ${result.creditAllocations.length} user(s) received credits.`;
                    } else {
                      alertMessage += `\n\n🏆 No reward credits were allocated in this cycle.`;
                    }
                  
                    alertMessage += `\n\n💡 Note: Brand owners earn DIRECT income only.`;
                    alert(alertMessage);
                  
                    refreshTree();
                    if (onRunConsolidation) onRunConsolidation();
                  } catch (err) {
                    alert('Failed to run consolidation: ' + (err instanceof Error ? err.message : 'Unknown error'));
                  }
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition transform hover:scale-105"
              >
                💰 Monthly Consolidation
              </button>
              <button
                onClick={() => setShowRepositioningInfo(!showRepositioningInfo)}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-medium transition transform hover:scale-105"
              >
                {showRepositioningInfo ? '🙈' : '👁️'} Repositioning Info
              </button>
            </div>
          </div>
          
          <div className="mb-6 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-50 border-2 border-yellow-400 rounded"></div>
              <span className="font-medium">Founder (Static Position)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-50 border-2 border-blue-300 rounded"></div>
              <span className="font-medium">Customer (Can be Repositioned)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-50 border-2 border-purple-300 rounded"></div>
              <span className="font-medium">Brand Owner (Static Position)</span>
            </div>
            {showRepositioningInfo && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-50 border-2 border-orange-400 rounded"></div>
                <span className="font-medium">Repositioned Node</span>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            {treeData.map((level, levelIndex) => (
              <div key={levelIndex} className="border-t pt-4">
                <button
                  onClick={() => toggleLevel(levelIndex)}
                  className="flex items-center gap-2 mb-3 text-lg font-semibold text-gray-700 hover:text-gray-900 transition"
                >
                  <span className="text-blue-600">{expandedLevels.has(levelIndex) ? '▼' : '▶'}</span>
                  <span>Level {levelIndex}</span>
                  <span className="text-sm font-normal text-gray-500">({level.length} users)</span>
                </button>
                
                {expandedLevels.has(levelIndex) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {level.map((user) => {
                      const totalTurnover = user.franchiseATurnover + user.franchiseBTurnover;
                      const potentialCredits = calculateRewardCredits(totalTurnover);
                      
                      return (
                      <div
                        key={user.id}
                        className={`border-2 rounded-xl px-4 py-4 text-sm shadow-md hover:shadow-lg transition ${
                          user.hasMovedPosition && showRepositioningInfo 
                            ? 'bg-orange-50 border-orange-400 text-orange-900' 
                            : getUserTypeColor(user.userType)
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-bold text-lg">{user.id}</div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getUserTypeBadge(user.userType)}`}>
                            {user.userType.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        
                        {user.hasMovedPosition && showRepositioningInfo && user.logicalParentId && (
                          <div className="mb-2 p-2 bg-orange-100 border border-orange-300 rounded">
                            <div className="text-xs font-semibold text-orange-800">
                              🔄 Visually Repositioned:
                            </div>
                            <div className="text-xs text-orange-700 mt-1">
                              Logical Parent: {user.logicalParentId} - {user.logicalParentName}
                            </div>
                          </div>
                        )}
                        
                        <div className="font-semibold text-base mb-1">{user.name}</div>
                        {user.brandName && (
                          <div className="text-xs italic mb-1 text-purple-700 font-medium">
                            🏢 {user.brandName}
                          </div>
                        )}
                        <div className="text-xs mb-3 text-gray-600">{user.email}</div>
                        
                        {user.directParentId && (
                          <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded">
                            <div className="text-xs font-semibold text-green-800">
                              👤 Direct Parent (Sponsor):
                            </div>
                            <div className="text-xs text-green-700 mt-1">
                              {user.directParentId} - {user.directParentName}
                            </div>
                          </div>
                        )}
                        
                        <div className="border-t pt-2 mb-2">
                          <div className="text-xs font-semibold mb-1 text-gray-700">Tree Structure:</div>
                          <div className="flex gap-2 text-xs">
                            <span className={`px-2 py-1 rounded ${user.hasLeft ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              L: {user.hasLeft ? `✓ ${user.leftChildId}` : '✗'}
                            </span>
                            <span className={`px-2 py-1 rounded ${user.hasRight ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              R: {user.hasRight ? `✓ ${user.rightChildId}` : '✗'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="border-t pt-2 mb-2">
                          <div className="text-xs font-semibold mb-1 text-gray-700">
                            Direct Referrals: {user.directReferralsCount}
                          </div>
                          {user.directReferralIds.length > 0 && (
                            <div className="text-xs text-gray-600 max-h-20 overflow-y-auto">
                              {user.directReferralIds.map((refId, idx) => (
                                <div key={idx} className="text-xs bg-blue-50 px-2 py-1 rounded mb-1">
                                  {idx + 1}. {refId}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="border-t pt-2 mb-2">
                          <div className="text-xs font-semibold mb-1 text-gray-700 flex items-center gap-1">
                            <TrendingUp size={12} /> Franchise Turnover:
                          </div>
                          <div className="flex gap-2 text-xs">
                            <span className="font-medium text-blue-700">A: ₹{user.franchiseATurnover.toFixed(2)}</span>
                            <span className="font-medium text-blue-700">B: ₹{user.franchiseBTurnover.toFixed(2)}</span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Total: ₹{totalTurnover.toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="border-t pt-2 space-y-1">
                          <div className="text-xs text-green-700 font-semibold">
                            💵 Direct Income: ₹{user.directIncome.toFixed(2)}
                          </div>
                          <div className={`text-xs font-semibold ${
                            user.userType === 'brand_owner' 
                              ? 'text-gray-400 line-through' 
                              : 'text-blue-700'
                          }`}>
                            💰 Indirect Income: ₹{user.indirectIncome.toFixed(2)}
                            {user.userType === 'brand_owner' && (
                              <span className="text-red-600 ml-1">(N/A)</span>
                            )}
                          </div>
                          <div className="text-xs font-medium text-gray-700">
                            📊 Total Sales: ₹{user.totalSales.toFixed(2)}
                          </div>
                          
                          <div className="border-t pt-2 mt-2">
                            <div className="text-xs font-semibold text-purple-700 flex items-center gap-1 mb-1">
                              <Award size={12} /> Reward Credits: {user.creditWallet}
                            </div>
                            <div className="text-xs text-purple-600 mb-1">
                              Potential from current turnover: {potentialCredits} credits
                            </div>
                            <div className="text-xs text-gray-500">
                              1 Credit = ₹100 (for product purchases)
                            </div>
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm mb-6">
          <div className="font-semibold text-blue-900 mb-2">📋 Multiple Direct Children System:</div>
          <ul className="space-y-1 text-blue-800">
            <li>✅ <strong>Direct Parent (Sponsor):</strong> The person who referred you - receives direct income from your sales</li>
            <li>✅ <strong>Tree Placement:</strong> For 3+ children, placed in sponsor's subtree using BFS for balance</li>
            <li>✅ <strong>Income Rules:</strong> Direct income goes to your sponsor, indirect income flows through tree structure</li>
            <li>⚠️ <strong>Brand Owners:</strong> Earn ONLY direct income (no indirect income)</li>
          </ul>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm mb-6">
          <div className="font-semibold text-purple-900 mb-2">🏆 Reward Credits System:</div>
          <ul className="space-y-1 text-purple-800">
            <li>✅ <strong>Turnover-Based Rewards:</strong> Credits are earned based on the total purchase value from direct and indirect children in both Franchise A and Franchise B.</li>
            <li>✅ <strong>Tiered Structure:</strong> 
              <ul className="ml-4 mt-1 list-disc list-inside">
                <li>First ₹200,000 turnover: 10 Credits</li>
                <li>Next ₹500,000 turnover: 15 Credits</li>
                <li>Next ₹1,000,000 turnover: 20 Credits</li>
                <li>Every additional ₹2,000,000: 25 Credits</li>
              </ul>
            </li>
            <li>✅ <strong>Automatic Allocation:</strong> Credits are automatically calculated and added to your Credit Wallet during the monthly consolidation.</li>
            <li>✅ <strong>Usage:</strong> Credits can be used for purchases on the ecommerce platform (1 Credit = ₹100).</li>
          </ul>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm mb-20">
          <div className="font-semibold text-orange-900 mb-2">🔄 Tree Restructuring Rules:</div>
          <ul className="space-y-1 text-orange-800">
            <li>✅ <strong>Customer Greater than Customer:</strong> If a customer earns more than their customer parent, they swap positions.</li>
            <li>✅ <strong>Static Positions:</strong> Founders and Brand Owners cannot be moved and remain in their original positions.</li>
            <li>✅ <strong>Automatic Process:</strong> Restructuring happens automatically after monthly consolidation.</li>
            <li>✅ <strong>Visual Indicators:</strong> Repositioned nodes are highlighted in orange.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TreeVisualization;