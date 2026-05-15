const DEFAULT_ALLOWED_ORIGINS = [
  "https://link-us-virid.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const BLOCKED_USER_AGENT_PATTERNS = [
  /jmeter/i,
  /postman/i,
  /insomnia/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /axios/i,
  /httpclient/i,
  /java/i,
  /okhttp/i,
  /apachebench/i,
];

const PUBLIC_PATHS = new Set(["/", "/health"]);

const RATE_LIMIT_CONFIG = [
  {
    pattern: /^\/usuario\/logarUsuario$/,
    method: "POST",
    windowMs: 60_000,
    maxRequests: 5,
  },

  {
    pattern: /^\/usuario\/criarUsuario$/,
    method: "POST",
    windowMs: 60_000,
    maxRequests: 3,
  },

  {
    pattern: /^\/postagem\/criarPostagem$/,
    method: "POST",
    windowMs: 60_000,
    maxRequests: 3,
  },

  {
    pattern: /^\/comentario\/criarComentarioPostagem$/,
    method: "POST",
    windowMs: 60_000,
    maxRequests: 10,
  },

  {
    pattern: /^\/mensagem\/mandarMensagem$/,
    method: "POST",
    windowMs: 60_000,
    maxRequests: 120,
  },

  {
    pattern: /^\/mensagem\/mandarMensagemGrupo$/,
    method: "POST",
    windowMs: 60_000,
    maxRequests: 120,
  },

  {
    pattern: /^\/interacao\/criarInteracao$/,
    method: "POST",
    windowMs: 60_000,
    maxRequests: 80,
  },

  {
    pattern: /^\/grupo\/criarGrupo$/,
    method: "POST",
    windowMs: 60_000,
    maxRequests: 5,
  },

  {
    pattern: /^\/conexao\/enviarSolicitacao$/,
    method: "POST",
    windowMs: 60_000,
    maxRequests: 15,
  },

  {
    pattern: /^\/postagem\/acharPostagens$/,
    method: "GET",
    windowMs: 60_000,
    maxRequests: 200,
  },

  {
    pattern: /^\/usuario\/acharUsuarios$/,
    method: "GET",
    windowMs: 60_000,
    maxRequests: 100,
  },
];

const DEFAULT_RATE_LIMIT = {
  windowMs: 60_000,
  maxRequests: 20,
};

function normalizarOrigem(origin) {
  return origin?.trim().replace(/\/$/, "");
}

function lerOrigensPermitidas() {
  const configuredOrigins = process.env.ALLOWED_ORIGINS
    ?.split(",")
    .map((origin) => normalizarOrigem(origin))
    .filter(Boolean);

  return configuredOrigins?.length
    ? configuredOrigins
    : DEFAULT_ALLOWED_ORIGINS;
}

function extrairIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }

  return (
    req.ip ||
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    "ip-desconhecido"
  );
}

function origemPermitida(req, allowedOrigins) {
  const origin = normalizarOrigem(req.headers.origin);
  const referer = req.headers.referer;

  if (origin && allowedOrigins.includes(origin)) {
    return true;
  }

  if (referer) {
    try {
      const refererOrigin = normalizarOrigem(new URL(referer).origin);
      return allowedOrigins.includes(refererOrigin);
    } catch {
      return false;
    }
  }

  return false;
}

function obterConfiguracaoRateLimit(path, method) {
  return (
    RATE_LIMIT_CONFIG.find(
      (config) =>
        config.pattern.test(path) &&
        config.method === method
    ) || DEFAULT_RATE_LIMIT
  );
}

export function createCorsOptions() {
  const allowedOrigins = lerOrigensPermitidas();

  return {
    origin(origin, callback) {
      if (!origin) {
        return callback(null, false);
      }

      const normalizedOrigin = normalizarOrigem(origin);

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin nao permitida pelo CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  };
}

export function bloquearClientesExternos(req, res, next) {
  if (req.method === "OPTIONS") {
    return next();
  }

  if (PUBLIC_PATHS.has(req.path)) {
    return next();
  }

  const userAgent = req.headers["user-agent"] || "";
  const allowedOrigins = lerOrigensPermitidas();

  if (BLOCKED_USER_AGENT_PATTERNS.some((pattern) => pattern.test(userAgent))) {
    return res.status(403).send("Cliente nao autorizado");
  }

  if (!origemPermitida(req, allowedOrigins)) {
    return res.status(403).send("Origem da requisicao nao permitida");
  }

  return next();
}

export function criarLimitadorDeRequisicoes() {
  const requestsByIp = new Map();

  return function limitadorDeRequisicoes(req, res, next) {
    if (req.method === "OPTIONS") {
      return next();
    }

    if (PUBLIC_PATHS.has(req.path)) {
      return next();
    }

    const fullPath = req.originalUrl.split("?")[0];
    console.log(`Requisicao: ${req.method} ${fullPath} - IP: ${extrairIp(req)}`);

    const { windowMs, maxRequests } =
      obterConfiguracaoRateLimit(fullPath, req.method);

    const now = Date.now();
    const ip = extrairIp(req);

    const uniqueKey = `${ip}:${req.method}:${fullPath}`;

    const requestTimestamps = requestsByIp.get(uniqueKey) || [];

    const validTimestamps = requestTimestamps.filter(
      (timestamp) => now - timestamp < windowMs
    );

    if (validTimestamps.length >= maxRequests) {
      res.setHeader("Retry-After", String(Math.ceil(windowMs / 1000)));

      return res.status(429).send({
        erro: "Muitas requisicoes em pouco tempo",
        limite: maxRequests,
        janelaMs: windowMs,
      });
    }

    validTimestamps.push(now);

    requestsByIp.set(uniqueKey, validTimestamps);

    return next();
  };
}