import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";

// Throttle simples em memória para o webhook público (60 req/min por IP).
// Trocar por Redis quando houver múltiplas réplicas.
const hits = new Map<string, number[]>();

@Injectable()
export class WebhookThrottleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const key = String(req.ip ?? "unknown");
    const now = Date.now();
    const window = hits.get(key)?.filter((t) => now - t < 60_000) ?? [];
    if (window.length >= 60) {
      throw new HttpException("Muitas requisições.", HttpStatus.TOO_MANY_REQUESTS);
    }
    window.push(now);
    hits.set(key, window);
    return true;
  }
}
