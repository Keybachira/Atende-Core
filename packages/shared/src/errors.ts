export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
  }
}

export const Errors = {
  forbidden: (msg = "Sem permissão.") => new AppError("FORBIDDEN", msg, 403),
  unauthorized: (msg = "Não autenticado.") => new AppError("UNAUTHORIZED", msg, 401),
  notFound: (resource = "Recurso") => new AppError("NOT_FOUND", `${resource} não encontrado.`, 404),
  conflict: (msg: string) => new AppError("CONFLICT", msg, 409),
} as const;
