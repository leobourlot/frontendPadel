<?php
// Devuelve https://<slug>-turnos.bourderweb.com.ar según el host del request.
// Si el host no coincide con el patrón, usa el dominio base (evita host header injection).
function origin_actual(): string {
    $host = strtolower(explode(':', $_SERVER['HTTP_HOST'] ?? '')[0]);
    if (preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*-turnos\.bourderweb\.com\.ar$/', $host)) {
        return 'https://' . $host;
    }
    return 'https://bourderweb.com.ar';
}
