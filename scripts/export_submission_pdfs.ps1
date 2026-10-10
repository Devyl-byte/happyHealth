param(
    [string]$SubmissionDirectory = "submission/TEAM_NAME_COLLEGE_NAME"
)

$ErrorActionPreference = "Stop"
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$submissionPath = (Resolve-Path (Join-Path $repositoryRoot $SubmissionDirectory)).Path
$pairs = @(
    @{
        Source = "happyhealth_virtual_patient_presentation_v7.pptx"
        Target = "happyhealth_virtual_patient_presentation_v7.pdf"
    },
    @{
        Source = "happyhealth_architecture_diagram_v7.pptx"
        Target = "happyhealth_architecture_diagram_v7.pdf"
    }
)

$powerPoint = $null
try {
    $powerPoint = New-Object -ComObject PowerPoint.Application
    foreach ($pair in $pairs) {
        $source = Join-Path $submissionPath $pair.Source
        $target = Join-Path $submissionPath $pair.Target
        if (-not (Test-Path -LiteralPath $source -PathType Leaf)) {
            throw "Presentation does not exist: $source"
        }
        $presentation = $powerPoint.Presentations.Open($source, $true, $false, $false)
        try {
            # 32 is PowerPoint's ppSaveAsPDF format.
            $presentation.SaveAs($target, 32)
        }
        finally {
            $presentation.Close()
            [void][Runtime.InteropServices.Marshal]::ReleaseComObject($presentation)
        }
        if (-not (Test-Path -LiteralPath $target -PathType Leaf)) {
            throw "PowerPoint did not create: $target"
        }
    }
}
finally {
    if ($powerPoint) {
        $powerPoint.Quit()
        [void][Runtime.InteropServices.Marshal]::ReleaseComObject($powerPoint)
    }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
