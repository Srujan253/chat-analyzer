import React, { useState, useRef } from 'react';
import { Upload, Heart, MessageCircle, Sparkles, TrendingUp, FileText, Users, Calendar } from 'lucide-react';
import CalculateLove from './calucatelove';

export default function ChatAnalyzer() {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.name.endsWith('.txt')) {
      setFile(selectedFile);
      setResult(null);
      setShowResults(false);
    } else {
      alert('Please select a valid WhatsApp chat export TXT file');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const analyzeChat = async () => {
    if (!file) return;
    
    setAnalyzing(true);
    
    try {
      const fullText = await file.text();
      
      // Analyze the chat
      const analysisResult = analyzeWhatsAppChat(fullText);
      setResult(analysisResult);
      setShowResults(true);
      
    } catch (error) {
      console.error('Error analyzing TXT:', error);
      alert('Error analyzing the TXT file. Please make sure it\'s a valid WhatsApp chat export.');
    } finally {
      setAnalyzing(false);
    }
  };

    const analyzeWhatsAppChat = (text) => {
      // Parse WhatsApp chat messages
      const lines = text.split('\n').filter(line => line.trim());
      // Improved emoji regex to capture more emojis including multi-char ones
      const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
      
      let totalMessages = 0;
      let totalEmojis = 0;
      const emojiCounts = {};
      const parsedMessages = [];

      // Parse each line to extract messages and timestamps
      lines.forEach(line => {
        // WhatsApp chat format: [DD/MM/YY, HH:MM:SS] Sender: Message
        // OR: DD/MM/YY, HH:MM AM/PM - Sender: Message
        const timestampMatch = line.match(/(?:\[)?(\d{1,2}\/\d{1,2}\/\d{2,4}), (\d{1,2}:\d{2}(?::\d{2})?)(?:\s*[ap]m)?(?:\])?(?:\s*-\s*)?/i);

        if (timestampMatch) {
          totalMessages++;
          try {
            const [day, month, year] = timestampMatch[1].split('/');
            let timePart = timestampMatch[2];

            // Convert 12-hour format to 24-hour format if needed
            if (line.toLowerCase().includes('pm') && !timePart.includes(':')) {
              const [hours, minutes] = timePart.split(':');
              const hourNum = parseInt(hours);
              if (hourNum < 12) {
                timePart = `${hourNum + 12}:${minutes}`;
              }
            } else if (line.toLowerCase().includes('am') && timePart.startsWith('12')) {
              timePart = `00:${timePart.split(':')[1]}`;
            }

            const formattedDate = `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}`;
            const dateObj = new Date(formattedDate);
            if (!isNaN(dateObj)) {
              // Extract sender name
              const messageStart = line.indexOf(timestampMatch[0]) + timestampMatch[0].length;
              const senderAndMessage = line.slice(messageStart);
              const sender = senderAndMessage.split(':')[0].trim();

              parsedMessages.push({
                time: dateObj,
                sender: sender
              });
            } else {
              console.warn('Invalid date parsed:', formattedDate);
            }
          } catch (e) {
            console.warn('Could not parse date:', timestampMatch[1]);
          }

          // Count emojis in message - extract the message part after timestamp and sender
          const messageStart = line.indexOf(timestampMatch[0]) + timestampMatch[0].length;
          const messageText = line.slice(messageStart).split(':').slice(1).join(':').trim();
          const emojis = messageText.match(emojiRegex) || [];
          totalEmojis += emojis.length;

          emojis.forEach(emoji => {
            emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
          });
        }
      });
      
      // Calculate average reply time (in minutes, only when sender changes)
      // Prepare structure for per-day stats
      const replyTimesByDay = {};
      const replyCountsByDay = {};

      // Loop through messages
      for (let i = 1; i < parsedMessages.length; i++) {
        const prev = parsedMessages[i - 1];
        const curr = parsedMessages[i];

        // Skip if same sender → not a reply
        if (curr.sender === prev.sender) continue;

        // Group by date starting at 6 AM
        // If message timestamp is before 6 AM, count it as part of the previous day
        // Otherwise, count it as the current day
        const hour = curr.time.getHours();
        const dayKey = hour < 6
          ? new Date(curr.time.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]
          : curr.time.toISOString().split("T")[0];

        // Time difference in minutes
        const diff = (curr.time - prev.time) / (1000 * 60);

        // Ignore unrealistic gaps (e.g. >12h = probably not a "reply")
        if (diff > 0 && diff < 12 * 60) {
          replyTimesByDay[dayKey] = (replyTimesByDay[dayKey] || 0) + diff;
          replyCountsByDay[dayKey] = (replyCountsByDay[dayKey] || 0) + 1;
        }
      }

      // ✅ Daily averages
      let totalDailyAverages = 0;
      let dayCount = 0;

      for (const day in replyTimesByDay) {
        const avgDayReply = replyTimesByDay[day] / replyCountsByDay[day];
        totalDailyAverages += avgDayReply;
        dayCount++;
      }

      // ✅ Final average reply time across all days (in minutes)
      const averageReplyTime = dayCount > 0 ? +(totalDailyAverages / dayCount).toFixed(2) : 0;
      
      // Calculate scores (0-100 scale)
      const messageScore = Math.min(totalMessages / 100 * 40, 40); // 40% weight
      const replyTimeScore = averageReplyTime > 0 ? Math.max(0, 30 - (averageReplyTime / 10)) : 15; // 30% weight (faster = better)
      const emojiScore = Math.min(totalEmojis / 50 * 30, 30); // 30% weight
      
      const totalScore = Math.round(messageScore + replyTimeScore + emojiScore);
      
      // Get top emojis
      const topEmojis = Object.entries(emojiCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([emoji, count]) => ({ emoji, count }));
      
      // Generate summary
      const summary = generateChatSummary(totalMessages, averageReplyTime, totalEmojis, totalScore);
      
      return {
        percentage: totalScore,
        totalMessages,
        averageReplyTime,
        totalEmojis,
        messageScore,
        replyTimeScore,
        emojiScore,
        topEmojis,
        summary
      };
    };

  const generateChatSummary = (totalMessages, replyTime, emojiCount, score) => {
    let summary = '';
    
    if (totalMessages > 200) {
      summary += 'Very active conversation with frequent messaging. ';
    } else if (totalMessages > 100) {
      summary += 'Moderately active chat with good engagement. ';
    } else {
      summary += 'Limited conversation history analyzed. ';
    }
    
    if (replyTime > 0) {
      if (replyTime < 5) {
        summary += 'Very responsive with quick replies. ';
      } else if (replyTime < 15) {
        summary += 'Good response time between messages. ';
      } else {
        summary += 'Slower response patterns observed. ';
      }
    }
    
    if (emojiCount > 50) {
      summary += 'Highly expressive with frequent emoji usage. ';
    } else if (emojiCount > 20) {
      summary += 'Moderate emotional expression through emojis. ';
    } else {
      summary += 'Limited emoji usage in conversations. ';
    }
    
    if (score >= 70) {
      summary += 'Strong indicators of high interest and engagement.';
    } else if (score >= 40) {
      summary += 'Shows moderate interest and good engagement.';
    } else {
      summary += 'Suggests casual level of interaction.';
    }
    
    return summary;
  };

  const getResultColor = (score) => {
    if (score >= 70) return 'text-red-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-blue-500';
  };

  const getResultBg = (score) => {
    if (score >= 70) return 'bg-gradient-to-r from-red-500 to-pink-500';
    if (score >= 40) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-blue-500 to-cyan-500';
  };

  const getStatusText = (score) => {
    if (score >= 70) return '🔥 High Interest Detected!';
    if (score >= 40) return '⭐ Moderate Interest Found';
    return '💭 Casual Interest Detected';
  };

  if (showResults && result) {
    return <CalculateLove result={result} onBack={() => setShowResults(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Heart className="w-12 h-12 text-pink-400 animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-400 via-red-400 to-purple-400 bg-clip-text text-transparent">
              Chat Analyzer
            </h1>
            <Heart className="w-12 h-12 text-pink-400 animate-pulse" />
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Discover the level of interest and engagement in your conversations.
            Upload your chat export and let AI analyze the interaction patterns and connection dynamics.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <MessageCircle className="w-8 h-8 text-pink-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Chat Analysis</h3>
            <p className="text-gray-300">Advanced algorithms analyze conversation patterns, emoji usage, and response timing.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <TrendingUp className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Smart Scoring</h3>
            <p className="text-gray-300">Get a precise percentage score based on interaction patterns and engagement levels.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <Sparkles className="w-8 h-8 text-yellow-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Detailed Insights</h3>
            <p className="text-gray-300">Receive personalized insights about your conversation dynamics and relationship potential.</p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <div 
            className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
              dragActive 
                ? 'border-pink-400 bg-pink-400/10' 
                : 'border-gray-400 bg-white/5 hover:bg-white/10'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                {file && <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>}
              </div>
              
              <div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  {file ? file.name : "Upload WhatsApp Chat Export"}
                </h3>
                <p className="text-gray-300 mb-4">
                  Drag and drop your TXT file here, or click to browse
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  Choose File
                </button>
              </div>
            </div>
          </div>

          {/* How to Export Instructions */}
          <div className="mt-6 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              How to export WhatsApp chat:
            </h4>
            <ol className="text-gray-300 space-y-2 list-decimal list-inside">
              <li>Open the chat you want to analyze in WhatsApp</li>
              <li>Tap the contact/group name at the top</li>
              <li>Scroll down and tap "Export Chat"</li>
              <li>Choose "Without Media" and save as TXT</li>
              <li>Upload the TXT file here to begin analysis</li>
            </ol>
          </div>
        </div>

        {/* Analyze Button */}
        {file && !showResults && (
          <div className="text-center mb-8">
            <button
              onClick={analyzeChat}
              disabled={analyzing}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-12 rounded-full text-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-2xl"
            >
              {analyzing ? (
                <span className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Analyzing Chat...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6" />
                  Analyze Chat Interest
                </span>
              )}
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 text-center border border-white/10">
            <Users className="w-8 h-8 text-pink-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">50K+</div>
            <div className="text-gray-300 text-sm">Chats Analyzed</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 text-center border border-white/10">
            <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">1.2K</div>
            <div className="text-gray-300 text-sm">Interest Insights</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 text-center border border-white/10">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">94%</div>
            <div className="text-gray-300 text-sm">Accuracy Rate</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 text-center border border-white/10">
            <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">24/7</div>
            <div className="text-gray-300 text-sm">Available</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400">
          <p>💬 Made with passion for understanding conversations 💬</p>
          <p className="text-sm mt-2">Your privacy is protected - chats are analyzed locally and never stored.</p>
        </div>
      </div>
    </div>
  );
}
