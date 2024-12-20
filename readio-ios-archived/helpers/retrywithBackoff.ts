// utils/retryWithBackoff.ts

export async function retryWithBackoff(
    fn: () => Promise<any>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<any> {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await fn();
      } catch (error) {
        attempt++;
        if (attempt === retries) throw error;
        await new Promise(res => setTimeout(res, delay * attempt));
      }
    }
  }
  