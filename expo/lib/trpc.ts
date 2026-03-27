import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpBatchLink, httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import { NativeModules, Platform } from "react-native";
import Constants from "expo-constants";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const stripTrailingSlash = (rawUrl: string) => rawUrl.replace(/\/$/, "");

const sanitizeHost = (rawHost: string) => {
  const withoutProtocol = rawHost.replace(/^(https?:\/\/|exp:\/\/|ws:\/\/|wss:\/\/)/i, "");
  const withoutQuery = withoutProtocol.split(/[?#]/)[0] ?? "";
  const withoutPath = withoutQuery.split("/")[0] ?? "";
  return withoutPath.replace(/\/$/, "");
};

type HostResolution = {
  host: string;
  port?: string;
};

const parseHostCandidate = (candidate?: string | null): HostResolution | null => {
  if (!candidate) {
    return null;
  }

  const sanitized = sanitizeHost(candidate.trim());

  if (!sanitized) {
    return null;
  }

  const isIpv6 = sanitized.startsWith("[") && sanitized.includes("]");
  const hostPortSeparatorIndex = isIpv6
    ? sanitized.lastIndexOf(":")
    : sanitized.indexOf(":");

  if (hostPortSeparatorIndex === -1) {
    return { host: sanitized };
  }

  const host = sanitized.slice(0, hostPortSeparatorIndex);
  const port = sanitized.slice(hostPortSeparatorIndex + 1);

  if (!host) {
    return null;
  }

  return {
    host: host.replace(/^\[(.*)\]$/, "$1"),
    port: port.length > 0 ? port : undefined,
  };
};

const getScriptUrlHost = () => {
  const scriptURL = (NativeModules.SourceCode as { scriptURL?: string } | undefined)?.scriptURL;
  if (!scriptURL) {
    return null;
  }

  return parseHostCandidate(scriptURL);
};

const resolveHostFromExpo = (): HostResolution | null => {
  const candidates: Array<string | null | undefined> = [
    Constants.expoGoConfig?.debuggerHost,
    // Expo classic manifest values
    (Constants as unknown as { manifest2?: { extra?: { expoGo?: { debuggerHost?: string; hostUri?: string } } } })?.manifest2?.extra?.expoGo?.debuggerHost,
    (Constants as unknown as { manifest2?: { extra?: { expoGo?: { hostUri?: string } } } })?.manifest2?.extra?.expoGo?.hostUri,
    Constants.expoGoConfig?.hostUri,
    Constants.expoConfig?.hostUri,
  ];

  for (const candidate of candidates) {
    const parsed = parseHostCandidate(candidate);
    if (parsed?.host) {
      return parsed;
    }
  }

  return getScriptUrlHost();
};

const resolveBackendPort = () => {
  const envPort = process.env.EXPO_PUBLIC_RORK_API_PORT;

  if (envPort && envPort.length > 0) {
    return envPort;
  }

  return "3000";
};

const replaceLocalhostWithExpoHost = (rawUrl: string) => {
  if (!/localhost|127\.0\.0\.1/.test(rawUrl)) {
    return stripTrailingSlash(rawUrl);
  }

  const resolved = resolveHostFromExpo();

  if (!resolved) {
    return stripTrailingSlash(rawUrl);
  }

  const protocol = rawUrl.startsWith("https") ? "https" : "http";
  const port = resolveBackendPort();
  const url = `${protocol}://${resolved.host}${port ? `:${port}` : ""}`;
  return stripTrailingSlash(url);
};

const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;

  if (envUrl && envUrl.length > 0) {
    return replaceLocalhostWithExpoHost(envUrl);
  }

  if (Platform.OS === "web" && typeof window !== "undefined") {
    return stripTrailingSlash(window.location.origin);
  }

  const resolved = resolveHostFromExpo();

  if (resolved) {
    const protocol = "http";
    const port = resolveBackendPort();
    return `${protocol}://${resolved.host}${port ? `:${port}` : ""}`;
  }

  throw new Error(
    "Failed to determine API base URL. Set EXPO_PUBLIC_RORK_API_BASE_URL or run in Expo Go with a debugger host."
  );
};

const createBatchLink = () =>
  httpBatchLink({
    url: `${getBaseUrl()}/api/trpc`,
  });

export const trpcClient = trpc.createClient({
  transformer: superjson,
  links: [createBatchLink()],
});

export const trpcVanillaClient = createTRPCClient<AppRouter>({
  transformer: superjson,
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
});
