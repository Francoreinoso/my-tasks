# ============================================================
#   my-tasks - launcher PowerShell para Windows
#   Versión más prolija que el .bat: detecta si los servers
#   ya están corriendo y solo abre el navegador en ese caso.
# ============================================================

$ErrorActionPreference = 'Stop'

# Ruta del proyecto DENTRO de WSL. Editala si moviste el repo.
$ProjectPath = '/home/freinoso/projects/my-tasks'

function Test-Port {
  param([int]$Port)
  try {
    $client = New-Object System.Net.Sockets.TcpClient
    $client.Connect('127.0.0.1', $Port)
    $client.Close()
    return $true
  } catch {
    return $false
  }
}

# Si ya hay un backend corriendo, solo abrimos el browser
if (Test-Port -Port 5173) {
  Start-Process 'http://localhost:5173'
  exit 0
}

# Arrancamos los servers en una ventana de WSL minimizada
$wslArgs = @(
  '--',
  'zsh', '-ic',
  "$ProjectPath/scripts/start-app.sh"
)
Start-Process -FilePath 'wsl.exe' -ArgumentList $wslArgs -WindowStyle Minimized

# Esperamos hasta que el frontend responda (máx 30s)
$deadline = (Get-Date).AddSeconds(30)
while ((Get-Date) -lt $deadline) {
  if (Test-Port -Port 5173) { break }
  Start-Sleep -Milliseconds 300
}

if (-not (Test-Port -Port 5173)) {
  Write-Host 'No se pudo iniciar my-tasks. Revisá la ventana de WSL.'
  exit 1
}

Start-Process 'http://localhost:5173'
