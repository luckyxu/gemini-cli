# 🔍 Complete Guide: Interactive Mode Function Call Tracing

## ✅ What's Now Available

### Enhanced Function Tracer with:
- **🎯 User Prompt Logging** - Captures exactly what you type
- **📤 API Response Logging** - Shows Gemini's responses
- **⚡ Stream Event Logging** - Real-time event processing
- **🔧 Detailed Function Flow** - Complete call stack with timing
- **📊 Enhanced Data Logging** - Better argument and return value capture

## 🚀 How to Use Interactive Mode Tracing

### 1. **Basic Interactive Tracing**
```bash
export GEMINI_TRACE_FUNCTIONS=1
npm run start
```

When you type a question like "what is data mesh", you'll see real-time tracing.

### 2. **Save Traces to File**
```bash
export GEMINI_TRACE_FUNCTIONS=1
npm run start 2>&1 | tee interactive-session.log
```

### 3. **Filter Only Function Traces**
```bash
export GEMINI_TRACE_FUNCTIONS=1
npm run start 2>&1 | grep -E "^\[.*\] [→←✗•🎯📤]" | tee function-traces.log
```

## 🎯 What You'll See in Interactive Mode

### **When You Type Your Question:**
```
[13:45:12.123] → submitQuery (object, undefined, "sessionABC########1")
[13:45:12.124] 🎯 USER_PROMPT: "what is data mesh" (16 chars) | {"isContinuation":false,"promptId":"sessionABC########1"}
```

### **During API Processing:**
```
[13:45:12.125] → processGeminiStreamEvents
[13:45:12.126] → GeminiClient.generateContent (1, {...}, undefined)
[13:45:12.127] → Turn.run (object, false)
```

### **As Response Streams In:**
```
[13:45:12.500] • Stream event received | {"type":"thought"}
[13:45:12.501] • Thought received | {"subject":"Understanding Data Architecture"}
[13:45:12.600] • Stream event received | {"type":"content"}
[13:45:12.601] • Content received | {"contentLength":156}
[13:45:13.200] • Stream event received | {"type":"content"}
[13:45:13.201] • Content received | {"contentLength":312}
```

### **Final Response:**
```
[13:45:15.800] 📤 API_RESPONSE: "A data mesh is a decentralized architectural approach..." (1847 chars) | {"bufferLength":1847}
[13:45:15.801] ← processGeminiStreamEvents → Completed
[13:45:15.802] ← submitQuery
```

## 📊 Enhanced Log Symbols

| Symbol | Meaning | Example |
|--------|---------|---------|
| `→` | Function entry | `→ submitQuery` |
| `←` | Function exit | `← submitQuery` |
| `•` | Log message | `• Loading settings` |
| `✗` | Error | `✗ API call failed` |
| `🎯` | **User prompt** | `🎯 USER_PROMPT: "hello"` |
| `📤` | **API response** | `📤 API_RESPONSE: "Hello! How can I help..."` |

## 🔧 Advanced Filtering Examples

### **Show Only Your Questions and Gemini's Answers:**
```bash
grep -E "🎯|📤" interactive-session.log
```

### **Performance Analysis - Function Timing:**
```bash
grep -E "→|←" interactive-session.log | head -20
```

### **Stream Processing Details:**
```bash
grep -E "Stream event|Content received|Thought received" interactive-session.log
```

### **Error Investigation:**
```bash
grep -E "✗|ERROR" interactive-session.log
```

## 📁 Key Files Created

1. **`interactive-mode-tracing.md`** - Detailed technical guide
2. **`INTERACTIVE_TRACING_GUIDE.md`** - This user-friendly guide  
3. **`function-call-trace-data-mesh.md`** - Example from non-interactive mode
4. **`enable-tracing.md`** - Original tracing setup instructions

## 🎮 Try It Now

1. **Enable tracing:**
   ```bash
   export GEMINI_TRACE_FUNCTIONS=1
   ```

2. **Start interactive mode:**
   ```bash
   npm run start
   ```

3. **Type a question** (e.g., "explain quantum computing")

4. **Watch the real-time trace logs** showing:
   - Your exact prompt capture
   - Function call flow  
   - Stream processing events
   - API response details
   - Complete timing information

## 🏆 What This Gives You

### **For Debugging:**
- See exactly where delays occur
- Trace error propagation
- Understand the complete request/response cycle

### **For Understanding:**
- Learn how gemini-cli processes your input
- See the real-time streaming in action
- Understand the authentication and API flow

### **For Development:**
- Performance profiling
- Function call analysis
- Stream processing debugging

## 🔄 Interactive vs Non-Interactive

| Mode | Traces Available | Best For |
|------|------------------|----------|
| **Interactive** | Full UI flow, stream events, user prompts | Understanding real usage |
| **Non-Interactive** | API calls only | Automation, scripting |

The interactive mode now provides the **complete picture** of what happens when you chat with gemini-cli!