# Serves site/ at http://localhost:8080 using only what ships with Windows.
#   powershell -ExecutionPolicy Bypass -File tools\preview.ps1
param([int]$Port = 8080)

$root = (Resolve-Path (Join-Path $PSScriptRoot '..\site')).Path
$types = @{
  '.html' = 'text/html; charset=utf-8'; '.css' = 'text/css'; '.js' = 'text/javascript'
  '.jpg' = 'image/jpeg'; '.png' = 'image/png'; '.webp' = 'image/webp'; '.avif' = 'image/avif'
  '.woff2' = 'font/woff2'; '.ico' = 'image/x-icon'; '.txt' = 'text/plain'; '.xml' = 'application/xml'
}

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$Port (Ctrl+C to stop)"

while ($listener.IsListening) {
  $context = $listener.GetContext()
  $response = $context.Response
  try {
    $relative = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath).TrimStart('/')
    if ($relative -eq '') { $relative = 'index.html' }
    $file = [System.IO.Path]::GetFullPath((Join-Path $root $relative))
    if ($file.StartsWith($root) -and [System.IO.File]::Exists($file)) {
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $type = $types[[System.IO.Path]::GetExtension($file).ToLower()]
      $response.ContentType = if ($type) { $type } else { 'application/octet-stream' }
      $response.ContentLength64 = $bytes.Length
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $response.StatusCode = 404
    }
  } catch {
    $response.StatusCode = 500
  } finally {
    $response.Close()
  }
}
