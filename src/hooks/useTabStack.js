import { useState, useCallback } from "react";

/**
 * useTabStack — manages independent navigation stacks for each dashboard tab.
 * Each tab maintains its own history, scroll position, and can be reset independently.
 * 
 * Stack structure: ["/dashboard/pay"] or ["/dashboard/pay", "/dashboard/recipients"]
 * Root pages: /dashboard, /dashboard/insights, /dashboard/pay, /dashboard/cards, /dashboard/profile
 */

const ROOT_TABS = [
  "/dashboard",
  "/dashboard/insights",
  "/dashboard/pay",
  "/dashboard/cards",
  "/dashboard/profile",
];

const SCROLL_REGISTRY = {};

export function useTabStack() {
  // Map of tab root → navigation stack
  const [stacks, setStacks] = useState({
    "/dashboard": ["/dashboard"],
    "/dashboard/insights": ["/dashboard/insights"],
    "/dashboard/pay": ["/dashboard/pay"],
    "/dashboard/cards": ["/dashboard/cards"],
    "/dashboard/profile": ["/dashboard/profile"],
  });

  const [activeTab, setActiveTab] = useState("/dashboard");

  // Determine which tab a pathname belongs to
  const getTabForPath = useCallback((pathname) => {
    for (const root of ROOT_TABS) {
      if (pathname === root || pathname.startsWith(root + "/")) {
        return root;
      }
    }
    return "/dashboard";
  }, []);

  // Get current stack for active tab
  const currentStack = stacks[activeTab] || [activeTab];
  const currentPath = currentStack[currentStack.length - 1];

  // Push a new page onto the active tab's stack
  const push = useCallback((path) => {
    const tab = getTabForPath(path);
    setActiveTab(tab);
    setStacks(prev => {
      const stack = prev[tab] || [tab];
      if (stack[stack.length - 1] !== path) {
        return { ...prev, [tab]: [...stack, path] };
      }
      return prev;
    });
  }, [getTabForPath]);

  // Pop from active tab's stack (go back)
  const pop = useCallback(() => {
    setStacks(prev => {
      const stack = prev[activeTab] || [activeTab];
      if (stack.length > 1) {
        return { ...prev, [activeTab]: stack.slice(0, -1) };
      }
      return prev;
    });
  }, [activeTab]);

  // Switch to a tab (either to its root or resume where left off)
  const switchTab = useCallback((tab) => {
    // Save scroll position of current tab
    const currentScroll = SCROLL_REGISTRY[currentPath] || 0;
    SCROLL_REGISTRY[currentPath] = currentScroll;

    setActiveTab(tab);
  }, [currentPath]);

  // Reset a specific tab to its root
  const resetTab = useCallback((tab) => {
    setStacks(prev => ({
      ...prev,
      [tab]: [tab],
    }));
  }, []);

  // Get stack depth (0 = root, 1+ = child screens)
  const stackDepth = currentStack.length - 1;
  const isRoot = stackDepth === 0;

  // Save/load scroll position
  const saveScroll = useCallback((pos) => {
    SCROLL_REGISTRY[currentPath] = pos;
  }, [currentPath]);

  const loadScroll = useCallback(() => {
    return SCROLL_REGISTRY[currentPath] || 0;
  }, [currentPath]);

  return {
    activeTab,
    currentPath,
    currentStack,
    stackDepth,
    isRoot,
    push,
    pop,
    switchTab,
    resetTab,
    saveScroll,
    loadScroll,
    getTabForPath,
  };
}