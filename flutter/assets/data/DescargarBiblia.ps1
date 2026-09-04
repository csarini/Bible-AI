# Configuración de seguridad para compatibilidad con TLS 1.2 (necesario en versiones antiguas de PS)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Configuración
$baseUrl = "https://api.getbible.net/v2/valera/{0}.json"
$outputDir = ".\valera_json"
$totalLibros = 66

# Crear el directorio de salida si no existe
if (-not (Test-Path -Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
    Write-Host "Directorio '$outputDir' creado." -ForegroundColor Green
}

Write-Host "Iniciando descarga de $totalLibros archivos en: $(Resolve-Path $outputDir)" -ForegroundColor Cyan
Write-Host ("-" * 60)

# Bucle del 1 al 66
for ($i = 1; $i -le $totalLibros; $i++) {
    $url = $baseUrl -f $i
    $fileName = "valera_$i.json"
    $filePath = Join-Path -Path $outputDir -ChildPath $fileName
    
    Write-Host "Descargando libro $i/$totalLibros... " -NoNewline
    
    try {
        # Descarga el archivo directamente
        Invoke-WebRequest -Uri $url -OutFile $filePath -UseBasicParsing -ErrorAction Stop
        
        # Opcional: Validar que sea JSON válido (descomenta las siguientes 3 líneas si quieres validación estricta)
        # $jsonContent = Get-Content -Path $filePath -Raw
        # $null = $jsonContent | ConvertFrom-Json -ErrorAction Stop
        
        Write-Host "✓ OK" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Error" -ForegroundColor Red
        Write-Host "  Detalle: $($_.Exception.Message)" -ForegroundColor DarkGray
    }
    
    # Pequeña pausa de 200ms para no saturar la API
    Start-Sleep -Milliseconds 200
}

Write-Host ("-" * 60)
Write-Host "¡Descarga completada exitosamente!" -ForegroundColor Green
Write-Host "Archivos guardados en: $(Resolve-Path $outputDir)" -ForegroundColor Cyan