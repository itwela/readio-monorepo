/**
 * Ensures reliable state updates in React/React Native by handling both data and visual state changes.
 * Visual updates are executed multiple times to ensure reliable layout rendering.
 * 
 * @param setter - The state setter function from useState
 * @param value - The new value to set
 * @param type - Specifies the type of state update ('affectsSomethingVisual' | 'backendData')
 * @returns Promise that resolves when state update is complete
 * 
 * @example
 * // For visual updates:
 * await setStateAsync(setIsVisible, true, 'affectsSomethingVisual');
 * 
 * // For data updates:
 * await setStateAsync(setUserData, userData, 'backendData');
 * 
 * // If TypeScript shows undefined error, cast setter as Function:
 * await setStateAsync(setIsLoading as Function, true, 'backendData');
 */
export const setStateAsync = (setter: Function, value: any, type: 'affectsSomethingVisual' | 'backendData' = 'backendData') => {
    return new Promise(resolve => {
      if (type === 'affectsSomethingVisual') {
        // Run three times for layout updates
        setter(value);
        setter(value);
        setter(value);
      } else {
        // Run once for data updates
        setter(value);
      }
      resolve(true);
    });
};