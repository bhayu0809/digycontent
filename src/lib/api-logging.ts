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
  address?: string | number | boolean;
  port?: string | number | boolean;
  cause?: SerializedError | string;
  errors?: SerializedError[];
};

export function logApiError(error: unknown, context: ApiErrorContext) {
  console.error("[api-error]", buildApiErrorLog(error, context));
}

export function serializeLogError(error: unknown): SerializedError {
  return serializeError(error);
}

function buildApiErrorLog(error: unknown, context: ApiErrorContext) {
  return {
    ...context,
    error: serializeError(error),
  };
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
