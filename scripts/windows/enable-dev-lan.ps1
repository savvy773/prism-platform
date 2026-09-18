# Run from an administrator PowerShell on PRISMJUNS.
[CmdletBinding()]
param([string]$Subnet = "192.168.123.0/24", [switch]$Remove)
$ErrorActionPreference = "Stop"
$RuleName = "Prism-WSL-Development-Web"
$VmCreator = "{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}"
if ($env:COMPUTERNAME -ne "PRISMJUNS") { throw "This rule is for the PRISMJUNS development PC." }
if ($Remove) {
    Get-NetFirewallHyperVRule -Name $RuleName -ErrorAction SilentlyContinue | Remove-NetFirewallHyperVRule
    Get-NetFirewallRule -Name $RuleName -ErrorAction SilentlyContinue | Remove-NetFirewallRule
    netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=80
    netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=8080
    netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=3000
    Write-Output "Prism development firewall rules and listeners removed."
    exit
}
if (Get-NetFirewallHyperVRule -Name $RuleName -ErrorAction SilentlyContinue) {
    Set-NetFirewallHyperVRule -Name $RuleName -Action Allow -Direction Inbound -Protocol TCP -LocalPorts 80,3000,8080 -RemoteAddresses $Subnet
} else {
    New-NetFirewallHyperVRule -Name $RuleName -DisplayName "Prism WSL development web (LAN)" -Direction Inbound -VMCreatorId $VmCreator -Protocol TCP -LocalPorts 80,3000,8080 -RemoteAddresses $Subnet -Action Allow | Out-Null
}
if (Get-NetFirewallRule -Name $RuleName -ErrorAction SilentlyContinue) {
    Set-NetFirewallRule -Name $RuleName -Direction Inbound -Action Allow -Protocol TCP -LocalPort 80,3000,8080 -RemoteAddress LocalSubnet -Profile Private
} else {
    New-NetFirewallRule -Name $RuleName -DisplayName "Prism WSL development web (LAN)" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 80,3000,8080 -RemoteAddress LocalSubnet -Profile Private | Out-Null
}
Write-Output "Prism web allowed on TCP 80, 3000 and 8080 from $Subnet. Other firewall policies are unchanged."

# Windows owns the friendly ports; WSL binds only local bridge ports.
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=80 connectaddress=127.0.0.1 connectport=18080
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=8080 connectaddress=127.0.0.1 connectport=18081
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=3000 connectaddress=127.0.0.1 connectport=13000
Restart-Service iphlpsvc
