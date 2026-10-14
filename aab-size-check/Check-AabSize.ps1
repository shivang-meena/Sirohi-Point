$ErrorActionPreference = 'Stop'

$folder = $PSScriptRoot
$bundletool = Join-Path $folder 'bundletool-all.jar'
if (-not (Test-Path -LiteralPath $bundletool)) {
    $versionedJars = @(Get-ChildItem -LiteralPath $folder -Filter 'bundletool-all-*.jar' -File)
    if ($versionedJars.Count -eq 1) { $bundletool = $versionedJars[0].FullName }
}
$deviceSpec = Join-Path $folder 'device.json'
$aabFiles = @(Get-ChildItem -LiteralPath $folder -Filter '*.aab' -File)

if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
    throw 'Java nahi mila. Java install karke PowerShell dobara kholen.'
}
if (-not (Test-Path -LiteralPath $bundletool)) {
    throw 'bundletool JAR nahi mila. Is folder mein bundletool-all.jar ya bundletool-all-[version].jar rakhen.'
}
if ($aabFiles.Count -eq 0) {
    throw 'Is folder mein .aab file nahi mili. Apni AAB file yahan copy karke script dobara chalayen.'
}
foreach ($aab in $aabFiles) {
    $apks = Join-Path $folder ($aab.BaseName + '-iqoo-z5.apks')

    Write-Host "`niQOO Z5 target ke liye estimate ban raha hai: $($aab.Name)"
    & java -jar $bundletool build-apks "--bundle=$($aab.FullName)" "--output=$apks" "--device-spec=$deviceSpec" --overwrite
    if ($LASTEXITCODE -ne 0) { throw "APK set banane mein error aaya: $($aab.Name)" }

    Write-Host 'Estimated compressed download size (bytes):'
    & java -jar $bundletool get-size total "--apks=$apks" "--device-spec=$deviceSpec"
    if ($LASTEXITCODE -ne 0) { throw "Download size estimate nikalne mein error aaya: $($aab.Name)" }
}

Write-Host "`nYeh estimate arm64-v8a, Android 11 (SDK 30), English aur 440 dpi settings par aadharit hai. Aapka phone in settings se alag ho to device.json ko update karna hoga."
