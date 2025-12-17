import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    
    // Tentar parsear JSON do body
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: text };
    }
    
    // Criar erro customizado com body estruturado
    const error: any = new Error(`${res.status}: ${text}`);
    error.status = res.status;
    error.body = body;
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Handle query keys with parameters
    // E.g., ["/api/rides", "shiftId"] => "/api/rides?shiftId=..."
    // E.g., ["/api/shifts", { period: "hoje" }] => "/api/shifts?period=hoje"
    let url: string;
    if (queryKey.length === 1) {
      url = queryKey[0] as string;
    } else if (queryKey.length === 2) {
      const [endpoint, param] = queryKey;
      
      // If param is an object, convert to query string
      if (typeof param === "object" && param !== null) {
        const queryParams = new URLSearchParams();
        Object.entries(param).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
        const queryString = queryParams.toString();
        url = queryString ? `${endpoint}?${queryString}` : (endpoint as string);
      }
      // Determine the query parameter name based on endpoint
      else if (endpoint === "/api/rides" || endpoint === "/api/costs") {
        url = `${endpoint}?shiftId=${param}`;
      } else {
        // Default behavior for other endpoints (path parameter)
        url = `${endpoint}/${param}`;
      }
    } else {
      url = queryKey.join("/") as string;
    }

    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 0, // Always refetch - no infinite cache
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
