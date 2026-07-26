[CmdletBinding()]
param(
    [switch]$Local
)

$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$SqlPath = Join-Path $PSScriptRoot "product-metrics.sql"
$Wrangler = Join-Path $RepoRoot "node_modules\.bin\wrangler.cmd"
$Target = if ($Local) { "--local" } else { "--remote" }
$Sql = (Get-Content $SqlPath) -join " "

$Output = & $Wrangler d1 execute profile-palette $Target --json --command $Sql
if ($LASTEXITCODE -ne 0) {
    throw "D1 metrics query failed with exit code $LASTEXITCODE"
}

$Payload = ($Output -join [Environment]::NewLine) | ConvertFrom-Json
$Row = $Payload[0].results[0]
if (-not $Row) {
    throw "D1 metrics query returned no result"
}

function Get-Percent {
    param(
        [int]$Numerator,
        [int]$Denominator
    )

    if ($Denominator -eq 0) { return 0.0 }
    return [Math]::Round(($Numerator / $Denominator) * 100, 1)
}

$Users = [int]$Row.users
$Activated = [int]$Row.activated
$ValueCreated = [int]$Row.value_created
$JobCompleted = [int]$Row.job_completed
$ShareIntent = [int]$Row.share_intent
$Returned = [int]$Row.returned

[ordered]@{
    generated_at = (Get-Date).ToUniversalTime().ToString("o")
    service = "profile-palette"
    environment = if ($Local) { "local" } else { "production" }
    funnel = [ordered]@{
        users = $Users
        activated = $Activated
        value_created = $ValueCreated
        job_completed = $JobCompleted
        share_intent = $ShareIntent
        returned = $Returned
        users_7d = [int]$Row.users_7d
        exports_7d = [int]$Row.exports_7d
    }
    rates = [ordered]@{
        activation_percent = Get-Percent $Activated $Users
        value_creation_percent = Get-Percent $ValueCreated $Activated
        completion_percent = Get-Percent $JobCompleted $ValueCreated
        share_intent_percent = Get-Percent $ShareIntent $JobCompleted
        return_percent = Get-Percent $Returned $JobCompleted
    }
} | ConvertTo-Json -Depth 4
