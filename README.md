# Chat Analyzer

A modern, privacy-focused web application that analyzes WhatsApp chat exports to provide insights into conversation patterns, engagement levels, and relationship dynamics.

## 🚀 Features

### Core Analysis Capabilities
- **Message Pattern Analysis**: Analyzes conversation frequency and activity levels
- **Response Time Calculation**: Calculates average reply times with intelligent day boundaries (6 AM - 6 AM)
- **Emoji Usage Analysis**: Tracks emotional expression through emoji patterns
- **Smart Scoring Algorithm**: Provides percentage-based interest and engagement scores

### Advanced Features
- **Per-Day Reply Time Averaging**: More accurate analysis by grouping messages by natural conversation days
- **Realistic Gap Filtering**: Filters out unrealistic response times (>12 hours) for better accuracy
- **Top Emoji Insights**: Identifies most frequently used emojis in conversations
- **Comprehensive Summary**: Generates detailed insights about conversation dynamics

### Privacy & Security
- **Local Processing**: All analysis happens in your browser - no data is sent to servers
- **No Data Storage**: Chat files are processed temporarily and never stored
- **File-Based Analysis**: Works with standard WhatsApp export TXT files

## 🛠️ Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS with custom gradients and animations
- **Icons**: Lucide React icons
- **Build Tool**: Vite for fast development and optimized production builds
- **Deployment**: Static hosting ready (Vercel, Netlify, etc.)

## 📋 Prerequisites

- Node.js 16+ and npm
- Modern web browser with JavaScript enabled

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chat-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## 📱 Usage

### How to Export WhatsApp Chat

1. Open the chat you want to analyze in WhatsApp
2. Tap the contact/group name at the top
3. Scroll down and tap "Export Chat"
4. Choose "Without Media" and save as TXT file
5. Upload the TXT file to the Chat Analyzer

### Analysis Process

1. **Upload**: Drag and drop or select your WhatsApp export TXT file
2. **Analyze**: Click "Analyze Chat Interest" to process the conversation
3. **Results**: View detailed insights including:
   - Overall interest score (0-100%)
   - Average reply time
   - Total messages and emojis
   - Top emoji usage
   - Conversation summary

## 🎯 Scoring Algorithm

The interest score is calculated using a weighted algorithm:

- **Message Frequency** (40%): Based on total messages per 100 messages
- **Response Time** (30%): Faster replies = higher score (optimal: <5 minutes)
- **Emoji Usage** (30%): More emojis = higher emotional engagement

### Score Interpretation
- **70-100%**: 🔥 High Interest Detected!
- **40-69%**: ⭐ Moderate Interest Found
- **0-39%**: 💭 Casual Interest Detected

## 🔧 Development

### Project Structure
```
src/
├── pages/
│   ├── landing.jsx          # Main upload and analysis page
│   └── calucatelove.jsx     # Results display page
├── components/              # Reusable components
├── utils/                   # Helper functions
└── assets/                  # Static assets
```

### Key Components

- **ChatAnalyzer**: Main component handling file upload and analysis
- **CalculateLove**: Results display component with detailed insights
- **WhatsApp Parser**: Advanced regex-based message parsing
- **Scoring Engine**: Multi-factor interest calculation algorithm

### Customization

The application can be easily customized by modifying:
- Scoring weights in the analysis function
- UI colors and themes in Tailwind classes
- Analysis parameters (time thresholds, emoji limits)
- Summary text generation logic

## 📊 Technical Details

### Reply Time Calculation
- Groups messages by days starting at 6:00 AM
- Only calculates reply times when sender changes
- Filters out gaps >12 hours as non-conversational
- Computes per-day averages for accuracy

### Message Parsing
- Supports multiple WhatsApp export formats
- Handles 12-hour and 24-hour time formats
- Robust emoji detection with Unicode support
- Error handling for malformed messages

## 🌟 Features in Detail

### Smart Day Boundaries
Unlike simple midnight-to-midnight grouping, this analyzer uses 6 AM boundaries to better reflect natural conversation patterns and sleep cycles.

### Realistic Analysis
Filters out unrealistic response times (over 12 hours) to provide more meaningful insights about actual conversation engagement.

### Privacy First
- No server-side processing
- No data collection or storage
- All analysis happens client-side
- Files are processed in memory only

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with React and Vite for modern web development
- Styled with Tailwind CSS for beautiful, responsive design
- Icons provided by Lucide React
- Inspired by the need for better conversation insights

---

**Made with ❤️ for understanding conversations better**

*Your privacy is protected - chats are analyzed locally and never stored.*
