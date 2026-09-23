<?php
require __DIR__ . '/_host.php';
header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: public, max-age=3600');
$origin = origin_actual();
?>
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /mis-reservas
Disallow: /reservas-recurrentes
Disallow: /admin/
Disallow: /superadmin/
Disallow: /superadmin-panel-leo/
Disallow: /vencido

Sitemap: <?= $origin ?>/sitemap.xml
