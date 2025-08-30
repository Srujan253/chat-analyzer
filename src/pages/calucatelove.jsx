import React from 'react';
import { 
  Heart, 
  MessageCircle, 
  Clock, 
  Smile, 
  TrendingUp, 
  ArrowLeft, 
  BarChart3 
} from 'lucide-react';

export default function CalculateLove({ result, onBack }) {
  if (!result) return null;

  // --- Helpers ---
  const getScoreColor = (score) => {
    if (score >= 70) return 'text-red-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-blue-500';
  };

  const getScoreBg = (score) => {
    if (score >= 70) return 'bg-gradient-to-r from-red-500 to-pink-500';
    if (score >= 40) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-blue-500 to-cyan-500';
  };

  const getStatusText = (score) => {
    if (score >= 70) return '🔥 High Interest Detected!';
    if (score >= 40) return '⭐ Moderate Interest Found';
    return '💭 Casual Interest Detected';
  };

  const formatReplyTime = (minutes) => {
    if (minutes <= 0) return 'N/A';

    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.round(minutes % 60);
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  // --- UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Heart className="w-12 h-12 text-pink-400 animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-400 via-red-400 to-purple-400 bg-clip-text text-transparent">
              Chat Analysis Results
            </h1>
            <Heart className="w-12 h-12 text-pink-400 animate-pulse" />
          </div>
        </div>

        {/* Main Result Card */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            
            {/* Score */}
            <div className="text-center mb-8">
              <div className={`text-8xl font-bold ${getScoreColor(result.percentage)} mb-2`}>
                {result.percentage}%
              </div>
              <div className="w-full h-3 bg-gray-700 rounded-full mb-4 overflow-hidden">
                <div 
                  className={`h-full ${getScoreBg(result.percentage)} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${result.percentage}%` }}
                />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">
                {getStatusText(result.percentage)}
              </h3>
              <p className="text-gray-300">
                Based on {result.totalMessages} messages analyzed
              </p>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Messages */}
              <div className="bg-white/5 rounded-2xl p-6 text-center">
                <MessageCircle className="w-8 h-8 text-pink-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white">{result.totalMessages}</div>
                <div className="text-gray-300">Total Messages</div>
                <div className="text-sm text-pink-300 mt-2">
                  {result.messageScore.toFixed(1)}/40 points
                </div>
              </div>

              {/* Reply Time */}
              <div className="bg-white/5 rounded-2xl p-6 text-center">
                <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white">
                  {formatReplyTime(result.averageReplyTime)}
                </div>
                <div className="text-gray-300">Avg Reply Time</div>
                <div className="text-sm text-yellow-300 mt-2">
                  {result.replyTimeScore.toFixed(1)}/30 points
                </div>
              </div>

              {/* Emojis */}
              <div className="bg-white/5 rounded-2xl p-6 text-center">
                <Smile className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white">{result.totalEmojis}</div>
                <div className="text-gray-300">Total Emojis</div>
                <div className="text-sm text-blue-300 mt-2">
                  {result.emojiScore.toFixed(1)}/30 points
                </div>
              </div>
            </div>

            {/* Summary */}
            {result.summary && (
              <div className="bg-white/5 rounded-2xl p-6 mb-6">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-400" />
                  Chat Summary
                </h4>
                <p className="text-gray-300 leading-relaxed">{result.summary}</p>
              </div>
            )}

            {/* Top Emojis */}
            {result.topEmojis?.length > 0 && (
              <div className="bg-white/5 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Smile className="w-5 h-5 text-blue-400" />
                  Top Emojis Used
                </h4>
                <div className="flex flex-wrap gap-3">
                  {result.topEmojis.slice(0, 10).map((emoji, index) => (
                    <div key={index} className="bg-white/10 rounded-lg p-3 text-center">
                      <span className="text-2xl">{emoji.emoji}</span>
                      <div className="text-sm text-gray-300 mt-1">{emoji.count}x</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          <button
            onClick={onBack}
            className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 mr-4"
          >
            <ArrowLeft className="w-5 h-5 inline mr-2" />
            Analyze Another Chat
          </button>
          <button
            onClick={() => window.print()}
            className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300"
          >
            <TrendingUp className="w-5 h-5 inline mr-2" />
            Save Results
          </button>
        </div>
      </div>
    </div>
  );
}
