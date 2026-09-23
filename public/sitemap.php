<?php
require __DIR__ . '/_host.php';
header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=3600');
$origin = origin_actual();
$hoy = date('Y-m-d');
$rutas = ['/reservas' => '1.0', '/login' => '0.5', '/register' => '0.5'];
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<?php foreach ($rutas as $ruta => $prioridad): ?>
  <url>
    <loc><?= htmlspecialchars($origin . $ruta, ENT_XML1) ?></loc>
    <lastmod><?= $hoy ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority><?= $prioridad ?></priority>
  </url>
<?php endforeach; ?>
</urlset>
