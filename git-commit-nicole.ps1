$currentBranch = git rev-parse --abbrev-ref HEAD

if ($currentBranch -ne "Nicole") {
    Write-Host "ERROR: Estás en la rama '$currentBranch', no en 'Nicole'." -ForegroundColor Red
    Write-Host "Cambiate a 'Nicole' con: git checkout Nicole" -ForegroundColor Yellow
    exit 1
}

git add .

Write-Host "`n=== Archivos a commitear ===" -ForegroundColor Cyan
git status --short
Write-Host "============================`n" -ForegroundColor Cyan

$confirm = Read-Host "¿Quieres proceder con el commit? (S/N)"
if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "Commit cancelado." -ForegroundColor Yellow
    exit 0
}

$message = Read-Host "Escribe el mensaje del commit"
if ([string]::IsNullOrWhiteSpace($message)) {
    Write-Host "ERROR: El mensaje no puede estar vacío." -ForegroundColor Red
    exit 1
}

git commit -m "[Nicole] $message"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nCommit creado exitosamente." -ForegroundColor Green
} else {
    Write-Host "`nError al crear el commit." -ForegroundColor Red
}
