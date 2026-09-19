#define AppName "Collage Studio"
#ifndef AppVersion
  #define AppVersion "0.1.0-test"
#endif
#define AppPublisher "TexEcon"
#define AppExeName "CollageStudio.exe"

[Setup]
AppId={{B4D9C30E-CE4A-4A3B-9A8A-9D7F0E5C4E21}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
DefaultDirName={autopf}\Collage Studio
DefaultGroupName={#AppName}
OutputDir=dist
OutputBaseFilename=CollageStudioSetup
ArchitecturesInstallIn64BitMode=x64
Compression=lzma2
SolidCompression=yes
PrivilegesRequired=lowest
UninstallDisplayIcon={app}\{#AppExeName}

[Files]
Source: "dist\CollageStudio\*"; DestDir: "{app}"; Flags: recursesubdirs ignoreversion

[Icons]
Name: "{autoprograms}\{#AppName}"; Filename: "{app}\{#AppExeName}"
Name: "{autodesktop}\{#AppName}"; Filename: "{app}\{#AppExeName}"

[Run]
Filename: "{app}\{#AppExeName}"; Description: "Launch {#AppName}"; Flags: nowait postinstall skipifsilent
