# Interactive Mode Function Call Tracing & Prompt Details

## How to Capture Detailed Interactive Flow

### 1. **Enable Enhanced Tracing**

```bash
export GEMINI_TRACE_FUNCTIONS=1
```

### 2. **Run Interactive Mode with Log Capture**

#### Option A: Save All Logs to File
```bash
export GEMINI_TRACE_FUNCTIONS=1
npm run start 2>&1 | tee interactive-trace.log
```

#### Option B: Save Only Function Traces 
```bash
export GEMINI_TRACE_FUNCTIONS=1
npm run start 2> >(grep -E "^\[.*\] [→←✗•🎯📤]" > function-trace.log) 1>&2
```

#### Option C: Real-time View + Save
```bash
export GEMINI_TRACE_FUNCTIONS=1
npm run start 2>&1 | tee >(grep -E "^\[.*\] [→←✗•🎯📤]" > function-trace.log)
```

### 3. **Enhanced Log Symbols**

The enhanced tracing now includes special symbols:

- `→` Function entry
- `←` Function exit  
- `•` General log messages
- `✗` Errors
- `🎯` **User prompts** (NEW)
- `📤` **API responses** (NEW)

## Example Interactive Session Trace

When you type "what is data mesh" in interactive mode, you'll now see:

```
[12:34:56.123] → main
[12:34:56.124] • Loading settings | {"workspaceRoot":"/path/to/project"}
[12:34:56.200] → createContentGenerator (oauth-personal, gemini-2.5-pro)
[12:34:58.456] ← createContentGenerator → codeAssist
[12:34:58.500] → submitQuery (object, undefined, "session123########1")
[12:34:58.501] 🎯 USER_PROMPT: "what is data mesh" (16 chars) | {"isContinuation":false,"promptId":"session123########1"}
[12:34:58.502] → processGeminiStreamEvents
[12:34:58.503] → GeminiClient.generateContent (1, {"tools":[...]}, undefined)
[12:34:58.504] → Turn.run (object, false)
[12:34:58.600] • Stream event received | {"type":"thought"}
[12:34:58.601] • Thought received | {"subject":"Understanding Data Mesh"}
[12:34:58.700] • Stream event received | {"type":"content"}
[12:34:58.701] • Content received | {"contentLength":245}
[12:34:59.800] • Stream event received | {"type":"content"}
[12:34:59.801] • Content received | {"contentLength":512}
[12:35:00.900] 📤 API_RESPONSE: "A data mesh is a decentralized architectural and organizational approach to data management..." (1847 chars) | {"bufferLength":1847}
[12:35:00.901] ← Turn.run → completed
[12:35:00.902] ← GeminiClient.generateContent → success
[12:35:00.903] ← processGeminiStreamEvents → Completed
[12:35:00.904] ← submitQuery
```

## What Gets Captured

### **User Input Details:**
- Exact prompt text (truncated if long)
- Character count
- Prompt ID for tracking
- Whether it's a continuation

### **API Interaction:**
- Authentication method
- Model being used
- Request/response timing
- Tool calls made
- Error details if any

### **Stream Processing:**
- Each event type received
- Content chunks as they arrive
- Thought processes from the model
- Tool execution requests
- Final assembled response

### **Function Flow:**
- Complete call stack with timing
- Entry/exit for all major functions
- Error propagation
- Resource cleanup

## Advanced Filtering

### **Only User Prompts & Responses:**
```bash
grep -E "🎯|📤" interactive-trace.log
```

### **Only Function Calls:**
```bash
grep -E "→|←" interactive-trace.log
```

### **Only Stream Events:**
```bash
grep -E "Stream event|Content received|Thought received" interactive-trace.log
```

### **Performance Timing:**
```bash
grep -E "→|←" interactive-trace.log | awk '{print $1, $2, $3}' | sort
```

## Understanding the Flow

1. **Startup**: App initialization and authentication
2. **User Input**: Prompt capture and processing
3. **API Call**: Request to Gemini with context
4. **Streaming**: Real-time response processing
5. **Display**: Response rendering and formatting
6. **Cleanup**: Resource management and state updates

## Troubleshooting Interactive Mode

If tracing seems incomplete:

```bash
# Ensure tracing is enabled
echo $GEMINI_TRACE_FUNCTIONS

# Run with debug info
DEBUG=1 GEMINI_TRACE_FUNCTIONS=1 npm run start

# Check for errors in the logs
grep "✗" interactive-trace.log
```

## File Locations

- **Complete logs**: `interactive-trace.log`
- **Function traces only**: `function-trace.log` 
- **Settings**: Check for tracing config in `.gemini/settings.json`