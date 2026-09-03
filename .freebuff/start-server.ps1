$env:PATH = "C:\Program Files\nodejs;C:\Users\aryan\AppData\Roaming\npm;" + $env:PATH
$proj = "C:\Users\aryan\OneDrive\Desktop\EVERHERE\Website (freebuff)"
$log = "C:\Users\aryan\OneDrive\Desktop\EVERHERE\Website (freebuff)\.freebuff\preview-733f92d2-1823-42c6-a511-a9d46963c075.log"
$logErr = "$log.err"
$webDir = Join-Path $proj "apps\web"
Set-Location $webDir
$nextBin = Join-Path $webDir "node_modules\.bin\next.cmd"
$proc = Start-Process -FilePath $nextBin -ArgumentList 'dev','-p','3000' -WorkingDirectory $webDir -RedirectStandardOutput $log -RedirectStandardError $logErr -WindowStyle Hidden -PassThru
Write-Host "Started dev server with PID: $($proc.Id)"
