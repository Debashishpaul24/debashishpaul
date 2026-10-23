param(
  [int]$Port = 8080
)

$rootDir = $PSScriptRoot
if (-not $rootDir) { $rootDir = Get-Location }

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
  $listener.Start()
  Write-Output "DineFlow Local Web Server running on $prefix"
  Write-Output "Open: ${prefix}dineflow/"
} catch {
  Write-Error "Failed to bind to $($prefix) - $_"
  exit 1
}

$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".htm"  = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".webp" = "image/webp"
  ".ico"  = "image/x-icon"
  ".wasm" = "application/wasm"
}

while ($listener.IsListening) {
  try {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $urlPath = $request.Url.LocalPath
    if ($urlPath -eq "/" -or $urlPath -eq "/dineflow" -or $urlPath -eq "/dineflow/") {
      $urlPath = "/dineflow/index.html"
    }

    $relativePath = $urlPath.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
    $localFilePath = [System.IO.Path]::Combine($rootDir, $relativePath)

    if ([System.IO.Directory]::Exists($localFilePath)) {
      $localFilePath = [System.IO.Path]::Combine($localFilePath, "index.html")
    }

    if ([System.IO.File]::Exists($localFilePath)) {
      $ext = [System.IO.Path]::GetExtension($localFilePath).ToLower()
      $contentType = $mimeTypes[$ext]
      if (-not $contentType) { $contentType = "application/octet-stream" }

      $response.ContentType = $contentType
      $response.AddHeader("Access-Control-Allow-Origin", "*")
      $response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")

      $bytes = [System.IO.File]::ReadAllBytes($localFilePath)
      $response.ContentLength64 = $bytes.Length
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
      $response.StatusCode = 200
    } else {
      $response.StatusCode = 404
      $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
      $response.OutputStream.Write($notFoundBytes, 0, $notFoundBytes.Length)
    }

    $response.OutputStream.Close()
  } catch {
    # Ignore broken connections or listener shutdowns
  }
}
