# 🎨 EditApp - Manga Translation Editor

> **Professional manga and image translation tool with AI-powered text detection and real-time editing capabilities.**

[![License: Commercial](https://img.shields.io/badge/License-Commercial-red.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-green.svg)](https://python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-teal.svg)](https://fastapi.tiangolo.com/)

## 🌟 Features

### 🤖 AI-Powered Processing
- **Smart Text Detection**: Advanced OCR with automatic text region identification
- **Multi-language Support**: Detect and translate text in 50+ languages
- **Real-time Translation**: Instant translation with context awareness
- **Batch Processing**: Handle multiple images simultaneously

### 🎨 Professional Editing Tools
- **Visual Text Editor**: Intuitive drag-and-drop text box editing
- **Typography Controls**: Font selection, sizing, and styling options
- **Layout Preservation**: Maintain original image composition
- **Preview Mode**: Real-time preview of translation overlays

### 💼 Production Ready
- **High-Quality Output**: Export in multiple formats (PNG, JPG, PDF)
- **Undo/Redo System**: Complete editing history management
- **Zoom & Navigation**: Precise editing with zoom controls
- **Responsive UI**: Modern, minimalist interface design

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16.x or higher
- **Python** 3.8 or higher
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/EditApp.git
   cd EditApp
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Security Server (Optional)**
   ```bash
   cd SecurityServer-Universal
   npm install
   node simple-server.js
   ```

### 🌐 Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📖 Usage Guide

### Basic Workflow
1. **Load Image**: Click "Cargar" to upload your manga/image
2. **Auto-Detect**: Use the magic wand to automatically detect text regions
3. **Translate**: Click the translation button to process all detected text
4. **Edit**: Fine-tune translations and positioning as needed
5. **Export**: Save your translated image in your preferred format

### Advanced Features
- **Manual Text Boxes**: Draw custom text regions for precise control
- **Translation Preview**: Toggle between original and translated versions
- **Toolbar Management**: Hide/show tools to maximize workspace
- **Zoom Controls**: Navigate large images with precision

## 🏗️ Architecture

### Frontend (React + Electron)
```
src/
├── components/          # Reusable UI components
│   ├── Header.js       # Navigation and main controls
│   ├── Toolbar.js      # Floating editing tools
│   ├── ImageCanvas.js  # Main editing canvas
│   └── Sidebar.js      # Settings and options
├── hooks/              # Custom React hooks
├── services/           # API communication
└── App.js             # Main application component
```

### Backend (Python + FastAPI)
```
backend/
├── main.py            # FastAPI application entry point
├── requirements.txt   # Python dependencies
└── [API modules]      # OCR, translation, and image processing
```

### Security Layer
```
SecurityServer-Universal/
├── simple-server.js   # Security proxy server
├── editapp-config.json # Application configuration
└── README.md          # Security documentation
```

## 🛠️ Development

### Tech Stack
- **Frontend**: React 18, Electron, Tailwind CSS, Lucide Icons
- **Backend**: Python, FastAPI, OpenCV, Pillow, OCR libraries
- **Security**: Node.js proxy server with configurable policies
- **Build Tools**: Webpack, PostCSS, npm scripts

### Development Commands
```bash
# Frontend development
npm run dev          # Start development server
npm run build        # Build for production
npm run electron     # Run Electron app

# Backend development
python main.py       # Start FastAPI server
pip install -r requirements.txt  # Install dependencies

# Security server
node simple-server.js  # Start security proxy
```

### Code Style
- **ESLint** for JavaScript linting
- **Prettier** for code formatting
- **Tailwind CSS** for consistent styling
- **Component-based** architecture

## 📦 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Package Electron app
npm run electron-pack

# Deploy backend
cd ../backend
pip install -r requirements.txt
python main.py --production
```

### Docker Support (Coming Soon)
```bash
docker-compose up --build
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

**Commercial License** - This software is proprietary and requires a valid license for commercial use.

For licensing inquiries, please contact: [your-email@domain.com]

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/maxiusofmaximus/EditApp/wiki)
- **Issues**: [GitHub Issues](https://github.com/maxiusofmaximus/EditApp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/maxiusofmaximus/EditApp/discussions)
- **Email**: appcontrol2025@hotmail.com

## 🎯 Roadmap

- [ ] **v2.0**: Advanced AI translation models
- [ ] **v2.1**: Batch processing improvements
- [ ] **v2.2**: Cloud storage integration
- [ ] **v3.0**: Mobile app support
- [ ] **v3.1**: Collaborative editing features

## 🏆 Acknowledgments

- **OpenCV** community for image processing capabilities
- **React** team for the amazing frontend framework
- **FastAPI** for the high-performance backend framework
- **Tailwind CSS** for the utility-first CSS framework

---

<div align="center">
  <strong>Built with ❤️ for the manga translation community</strong>
</div>