
// this will make my code reliable. layout changes need to be run 3 times for it to reliably happen. data does not as many times but still

// need to wait for promises to resolve to get anything to be reliable tbh.

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