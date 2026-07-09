"use client";
import { useState, useEffect, Dispatch, SetStateAction } from "react";

// Define the type for the hook's return value
type UsePersistedStateResult<T> = [T, Dispatch<SetStateAction<T>>];

// Define the custom hook
function usePersistedState<T>(
  key: string,
  initialValue: T
): UsePersistedStateResult<T> {
  // Check if the key already exists in localStorage
  let storedValue: any;
  if (typeof window !== "undefined") {
    storedValue = localStorage.getItem(key);
  }

  // Initialize the state with the stored value or the initial value if not found
  const [state, setState] = useState<T>(() => {
    if (storedValue) {
      try {
        return JSON.parse(storedValue);
      } catch (error) {
        console.error(`Error parsing stored value for key "${key}":`, error);
      }
    }
    return initialValue;
  });

  // Use useEffect to update localStorage whenever the state changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error storing value for key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}

export default usePersistedState;
