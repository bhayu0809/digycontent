import "server-only";

type ApiErrorContext = {
  route: string;
  method?: string;
  pathname?: string;
  searchParams?: Record<string, string>;
  metadata?: Record<string, string | number | boolean | null | undefined>;
};

type SerializedError = {
  name: string;
  message: string;
  stack?: string;
  code?: string | number | boolean;
  detail?: string | number | boolean;
  hint?: string | number | boolean;
  constraint?: string | number | boolean;
  table?: string | number | boolean;
  column?: string | number | boolean;
  schema?: string | number | boolean;
  routine?: string | number | boolean;
  severity?: string | number | boolean;
  address?: string | number | boolean;
  port?: string | number | boolean;
  cause?: SerializedError | string;
  errors?: SerializedError[];
};

/**
 * Postgres SQLSTATE codes we expect to hit, with a plain-language hint so the
 * Vercel log tells you what to fix without cross-referencing the spec.
 */
const PG_ERROR_CODES: Record<string, string> = {
  "23505": "unique_violation — id draft bentrok dengan baris yang sudah ada",
  "23502": "not_null_violation — ada kolom wajib yang NULL (cek field draft kosong)",
  "23514": "check_violation — nilai melanggar CHECK (format harus carousel/reels, status harus idea/draft/ready/posted)",
  "22P02": "invalid_text_representation — tipe data tidak cocok (mis. JSON/array salah format)",
  "22023": "invalid_parameter_value — parameter query tidak valid",
  "42P01": "undefined_table — tabel belum ada (ensureSchema gagal jalan)",
  "42703": "undefined_column — kolom tidak ada (skema DB beda dengan query)",
  "42501": "insufficient_privilege — user DB tidak punya izin",
  "53300": "too_many_connections — koneksi pool HABIS (umum di serverless + Supabase, perlembar pooler)",
  "53400": "configuration_limit_exceeded — batas resource DB terlampaui",
  "57014": "query_canceled — query dibatalkan (timeout statement)",
  "57P01": "admin_shutdown — koneksi diputus server (idle timeout / restart DB)",
  "57P03": "cannot_connect_now — DB sedang startup/recovery, belum terima koneksi",
  "08006": "connection_failure — koneksi ke Postgres gagal di tengah jalan",
  "08003": "connection_does_not_exist — koneksi sudah tertutup saat dipakai",
  "08001": "sqlclient_unable_to_establish_connection — tidak bisa buka koneksi",
  "3D000": "invalid_catalog_name — database di DATABASE_URL tidak ditemukan",
  "28P01": "invalid_password — autentikasi DB gagal (password salah)",
  "28000": "invalid_authorization_specification — auth DB ditolak",
};

/**
 * Node/network error codes thrown by the pg driver before SQLSTATE is available
 * (DNS, TCP, TLS failures) — these are what you see when the pooler is down or
 * DATABASE_URL is wrong.
 */
const NET_ERROR_CODES: Record<string, string> = {
  ECONNREFUSED: "koneksi ditolak — host/port DB salah atau DB mati",
  ETIMEDOUT: "timeout konek ke DB — jaringan/SSL/pooler bermasalah",
  ENOTFOUND: "host DB tidak ditemukan — DATABASE_URL kemungkinan salah",
  ECONNRESET: "koneksi DB di-reset — pooler/idle timeout memutus koneksi",
  EPIPE: "koneksi DB putus saat menulis data",
  EHOSTUNREACH: "host DB tidak terjangkau dari jaringan",
  CONNECT_TIMEOUT: "timeout saat membuka koneksi ke DB",
};

export function logApiError(error: unknown, context: ApiErrorContext) {
  emitLog({
    tag: "api-error",
    level: "error",
    timestamp: new Date().toISOString(),
    ...context,
    dbError: describeDbError(error),
    error: serializeError(error),
  });
}

export function serializeLogError(error: unknown): SerializedError {
  return serializeError(error);
}

/**
 * Returns a human hint if the error looks like a database/connection failure,
 * otherwise undefined. Surfaced as a top-level `dbError` field so it is the
 * first thing visible in the Vercel log line.
 */
export function describeDbError(error: unknown): string | undefined {
  if (!(error instanceof Error)) return undefined;

  const code = getErrorProperty(error, "code");
  if (typeof code === "string") {
    if (PG_ERROR_CODES[code]) return `[${code}] ${PG_ERROR_CODES[code]}`;
    if (NET_ERROR_CODES[code]) return `[${code}] ${NET_ERROR_CODES[code]}`;
  }

  const message = error.message.toLowerCase();
  if (message.includes("database_url")) return "DATABASE_URL belum diset / tidak valid";
  if (message.includes("timeout")) return "operasi DB timeout (kemungkinan pool/koneksi penuh)";
  if (message.includes("connection terminated")) {
    return "koneksi DB diputus tiba-tiba (pooler/idle timeout)";
  }

  return undefined;
}

/**
 * Emit one JSON line. Vercel renders each log entry whole, and JSON avoids the
 * depth-2 truncation (`[Object]`) you get from passing nested objects straight
 * to console.error.
 */
export function emitLog(payload: Record<string, unknown>) {
  try {
    console.error(JSON.stringify(payload));
  } catch {
    // Fall back to the object form if something is unexpectedly non-serializable.
    console.error("[log-serialize-failed]", payload);
  }
}

function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: getErrorProperty(error, "code"),
      detail: getErrorProperty(error, "detail"),
      hint: getErrorProperty(error, "hint"),
      constraint: getErrorProperty(error, "constraint"),
      table: getErrorProperty(error, "table"),
      column: getErrorProperty(error, "column"),
      schema: getErrorProperty(error, "schema"),
      routine: getErrorProperty(error, "routine"),
      severity: getErrorProperty(error, "severity"),
      address: getErrorProperty(error, "address"),
      port: getErrorProperty(error, "port"),
      cause: serializeCause(error.cause),
      errors: serializeAggregateErrors(error),
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
  };
}

function serializeAggregateErrors(error: Error): SerializedError[] | undefined {
  if (!(error instanceof AggregateError)) return undefined;

  return error.errors.map((innerError) => serializeError(innerError));
}

function getErrorProperty(error: Error, property: string): string | number | boolean | undefined {
  const value = (error as unknown as Record<string, unknown>)[property];

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  return undefined;
}

function serializeCause(cause: unknown) {
  if (!cause) return undefined;

  if (cause instanceof Error) {
    return {
      name: cause.name,
      message: cause.message,
      stack: cause.stack,
      code: getErrorProperty(cause, "code"),
    };
  }

  return String(cause);
}

export function getRequestLogContext(request: Request) {
  const url = new URL(request.url);

  return {
    method: request.method,
    pathname: url.pathname,
  };
}
