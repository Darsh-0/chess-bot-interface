export const config = /*json-start*/{
  "mainAssemblyName": "chessEngine.dll",
  "resources": {
    "hash": "sha256-/PupcWZIdMc07fxeDnRkOpVoJYDwUuxQLIK/+XYnqQo=",
    "jsModuleNative": [
      {
        "name": "dotnet.native.js"
      }
    ],
    "jsModuleRuntime": [
      {
        "name": "dotnet.runtime.js"
      }
    ],
    "wasmNative": [
      {
        "name": "dotnet.native.wasm",
        "hash": "sha256-s+JUZcp8fnjD5h4GoJRSUahZUG9Np7q3Rg6AZVn6aN8="
      }
    ],
    "coreAssembly": [
      {
        "virtualPath": "chessEngine.wasm",
        "name": "chessEngine.wasm",
        "hash": "sha256-QRomBLHHpiykrUGS2QjwQipr1Cy0CfB4RpghrI3DCyA="
      },
      {
        "virtualPath": "System.Private.CoreLib.wasm",
        "name": "System.Private.CoreLib.wasm",
        "hash": "sha256-HhKOqoI6oDmQxTABgMqq0gh1HTLKj6pXsZIKpb6IkYw="
      },
      {
        "virtualPath": "System.Runtime.InteropServices.JavaScript.wasm",
        "name": "System.Runtime.InteropServices.JavaScript.wasm",
        "hash": "sha256-l55EbkI9WMhgTlEsWFrJPbDd7Dh14l2tg9/VrOluo+0="
      },
      {
        "virtualPath": "aot-instances.wasm",
        "name": "aot-instances.wasm",
        "hash": "sha256-ZKYH8qGQXmng3POhMUcorr9bMYF+uQANtiduldY9GFo="
      }
    ],
    "assembly": []
  },
  "debugLevel": 0,
  "globalizationMode": "invariant",
  "runtimeConfig": {
    "runtimeOptions": {
      "configProperties": {
        "Microsoft.Extensions.DependencyInjection.VerifyOpenGenericServiceTrimmability": true,
        "System.ComponentModel.DefaultValueAttribute.IsSupported": false,
        "System.ComponentModel.Design.IDesignerHost.IsSupported": false,
        "System.ComponentModel.TypeConverter.EnableUnsafeBinaryFormatterInDesigntimeLicenseContextSerialization": false,
        "System.ComponentModel.TypeDescriptor.IsComObjectDescriptorSupported": false,
        "System.Data.DataSet.XmlSerializationIsSupported": false,
        "System.Diagnostics.Debugger.IsSupported": false,
        "System.Diagnostics.Metrics.Meter.IsSupported": false,
        "System.Diagnostics.Tracing.EventSource.IsSupported": false,
        "System.Globalization.Invariant": true,
        "System.TimeZoneInfo.Invariant": false,
        "System.Globalization.PredefinedCulturesOnly": true,
        "System.Linq.Enumerable.IsSizeOptimized": true,
        "System.Net.Http.EnableActivityPropagation": false,
        "System.Net.Http.WasmEnableStreamingResponse": true,
        "System.Net.SocketsHttpHandler.Http3Support": false,
        "System.Reflection.Metadata.MetadataUpdater.IsSupported": false,
        "System.Resources.ResourceManager.AllowCustomResourceTypes": false,
        "System.Resources.UseSystemResourceKeys": true,
        "System.Runtime.CompilerServices.RuntimeFeature.IsDynamicCodeSupported": true,
        "System.Runtime.InteropServices.BuiltInComInterop.IsSupported": false,
        "System.Runtime.InteropServices.EnableConsumingManagedCodeFromNativeHosting": false,
        "System.Runtime.InteropServices.EnableCppCLIHostActivation": false,
        "System.Runtime.InteropServices.Marshalling.EnableGeneratedComInterfaceComImportInterop": false,
        "System.Runtime.Serialization.EnableUnsafeBinaryFormatterSerialization": false,
        "System.StartupHookProvider.IsSupported": false,
        "System.Text.Encoding.EnableUnsafeUTF7Encoding": false,
        "System.Text.Json.JsonSerializer.IsReflectionEnabledByDefault": false,
        "System.Threading.Thread.EnableAutoreleasePool": false
      }
    }
  }
}/*json-end*/;