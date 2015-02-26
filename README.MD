# Install guide

Manually add the following xml to the .phone.jsproj:

Add the SDK near the rest of the references, it is possible to do this automatically with cordova but I want this only for the phone project.
Also, because I want it to build as easy as possible the winmd files or on svn xD

  <ItemGroup>
    <SDKReference Include="Microsoft.VCLibs, Version=12.0" />
  </ItemGroup>
  <ItemGroup>
    <SDKReference Include="SQLite.WP81, Version=3.8.8.1" />
  </ItemGroup>
  <Choose>
    <When Condition="$(Platform) == 'x86'">
      <ItemGroup>
        <Reference Include="SQLitePluginNative">
          <HintPath>..\..\plugins\com.thinkwisesoftware.websql\dist\x86\SQLitePluginNative.winmd</HintPath>
          <IsWinMDFile>true</IsWinMDFile>
        </Reference>
      </ItemGroup>
    </When>
    <When Condition="$(Platform) == 'ARM'">
      <ItemGroup>
        <Reference Include="SQLitePluginNative">
          <HintPath>..\..\plugins\com.thinkwisesoftware.websql\dist\ARM\SQLitePluginNative.winmd</HintPath>
          <IsWinMDFile>true</IsWinMDFile>
        </Reference>
      </ItemGroup>
    </When>
  </Choose>

After that, add this to the jsproj:

  <PropertyGroup>
    <SDKReferenceDirectoryRoot>$(SolutionDir)..\..\plugins\com.thinkwisesoftware.websql\src\windows\SDK\;$(SDKReferenceDirectoryRoot);</SDKReferenceDirectoryRoot>
  </PropertyGroup>

It is important to do this right below the (last) import statement 
  <Import Project="$(MSBuildExtensionsPath)\Microsoft\WindowsXaml\v$(VisualStudioVersion)\Microsoft.Windows.UI.Xaml.CSharp.targets" />


# Build

Note: the extra dashes are important because of a bug in cordova

cordova build windows --archs="x86 arm" -- --phone 
cordova build windows -- --win
