# Bloom: The Next Chapter

## 1. Introduction

This document outlines the next phase of development for Bloom, our AI-powered farming assistant. The original `documentation.md` provided a solid architectural foundation, but as the project has evolved, so has our understanding of what we need to build.

This is a living document. It is meant to be a flexible guide, not a rigid set of rules. Our goal is to build a powerful and intuitive tool for farmers, and we will adapt our plan as we learn more about what they need.

## 2. The Widget System

The most significant evolution in our thinking is the central role of the **widget system**. Instead of just providing text-based answers, Bloom will generate rich, interactive widgets that provide a much more intuitive and useful experience for farmers.

### 2.1. Purpose

The purpose of the widget system is to:

*   **Visualize data:** Present complex data, such as satellite imagery and weather forecasts, in an easy-to-understand format.
*   **Provide actionable insights:** Help farmers make better decisions by providing them with clear, data-driven recommendations.
*   **Create a more engaging experience:** Make Bloom more than just a chatbot. We want to create a tool that farmers will enjoy using.

### 2.2. Architecture

The widget system will have the following end-to-end data flow:

1.  **User Query:** The user sends a query to the backend.
2.  **Agent Delegation:** The `main_agent` delegates the query to the appropriate specialist agent (e.g., the `farm_agent`).
3.  **Tool Execution:** The specialist agent calls the appropriate tool (e.g., `weather_tool.py`).
4.  **Structured Data Return:** The tool returns structured JSON data to the agent.
5.  **Widget Generation:** The agent processes the data and formats it into a specific widget JSON object (e.g., a `weather-today` widget).
6.  **Streaming to Frontend:** The FastAPI backend streams the widget object to the frontend using Server-Sent Events (SSE).
7.  **Widget Rendering:** The Next.js frontend identifies the widget type and renders the corresponding React component.

### 2.3. Widget Catalog

Here is a complete list of all the widgets we plan to build for each agent:

**Planner Agent:**

*   `planting-calendar`
*   `crop-recommendation`
*   `budget-calculator`
*   `resource-planner`
*   `rotation-plan`
*   `profitability-forecast`

**Farm Agent:**

*   `farm-map`
*   `ndvi-chart`
*   `soil-moisture-map`
*   `task-list`
*   `growth-tracker`
*   `alert-dashboard`
*   `weather-today`
*   `irrigation-schedule`

**Market Agent:**

*   `price-chart`
*   `sell-timing-recommendation`
*   `supplier-comparison`
*   `profit-calculator`
*   `expense-tracker`
*   `inventory-status`
*   `market-forecast`

### 2.4. Starting Point

We will start by building out the `farm_agent` and its widgets. The first widget we will build is the `weather-today` widget, as it is relatively simple and its corresponding tool, `weather_tool.py`, is already well-defined.

## 3. Revised Agent Responsibilities

Given the central role of the widget system, we need to rethink the responsibilities of each agent.

### 3.1. `main_agent`

The `main_agent` will continue to act as a router, delegating queries to the appropriate specialist agent. It will also be responsible for:

*   Handling basic conversation and greetings.
*   Providing general information about Bloom and its capabilities.
*   Falling back to a generic `search_web` tool if no specialist agent can handle a query.

### 3.2. `farm_agent`

The `farm_agent` will be responsible for real-time farm monitoring. It will use the `earth_engine_tool.py` and `weather_tool.py` to generate the following widgets:

*   `farm-map`
*   `ndvi-chart`
*   `soil-moisture-map`
*   `task-list`
*   `growth-tracker`
*   `alert-dashboard`
*   `weather-today`
*   `irrigation-schedule`

### 3.3. `planner_agent`

The `planner_agent` will be responsible for crop planning and season preparation. It will use the `earth_engine_tool.py`, `weather_tool.py`, and `vector_search_tool.py` to generate the following widgets:

*   `planting-calendar`
*   `crop-recommendation`
*   `budget-calculator`
*   `resource-planner`
*   `rotation-plan`
*   `profitability-forecast`

### 3.4. `market_agent`

The `market_agent` will be responsible for market intelligence and supply chain optimization. It will use the `search_tool.py`, `vector_search_tool.py`, and `weather_tool.py` to generate the following widgets:

*   `price-chart`
*   `sell-timing-recommendation`
*   `supplier-comparison`
*   `profit-calculator`
*   `expense-tracker`
*   `inventory-status`
*   `market-forecast`

## 4. The Development Plan

We will build out the system one agent at a time, starting with the `farm_agent`.

### Phase 1: The `farm_agent`

**Step 1.1: Frontend - `weather-today` widget**

*   Create a new React component for the `weather-today` widget.
*   Modify the `ChatSection.tsx` component to be able to render the new widget.

**Step 1.2: Backend - `weather_tool.py` integration**

*   Integrate the `weather_tool.py` with the `farm_agent`.
*   Generate the `weather-today` widget data in the format specified in the documentation.

**Step 1.3: End-to-end testing**

*   Test the `weather-today` widget to ensure that it is rendered correctly and that it displays the correct data.

**Step 1.4: Frontend - `ndvi-chart` widget**

*   Create a new React component for the `ndvi-chart` widget.
*   Modify the `ChatSection.tsx` component to be able to render the new widget.

**Step 1.5: Backend - `earth_engine_tool.py` integration**

*   Integrate the `earth_engine_tool.py` with the `farm_agent`.
*   Generate the `ndvi-chart` widget data.

**Step 1.6: End-to-end testing**

*   Test the `ndvi-chart` widget.

We will continue this process for all the `farm_agent` widgets.

### Phase 2: The `planner_agent`

Once the `farm_agent` is complete, we will move on to the `planner_agent`. We will follow a similar step-by-step process to build out its widgets.

### Phase 3: The `market_agent`

Finally, we will build out the `market_agent` and its widgets.

