
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import { useState } from "react";

interface DevicePreset {
  name: string;
  width: number;
  height: number;
  icon: React.ReactNode;
  description: string;
}

export const DeviceSimulator = () => {
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>({
    name: 'Desktop',
    width: 1920,
    height: 1080,
    icon: <Monitor className="w-4 h-4" />,
    description: 'Standardowy komputer stacjonarny'
  });

  const devices: DevicePreset[] = [
    {
      name: 'Desktop',
      width: 1920,
      height: 1080,
      icon: <Monitor className="w-4 h-4" />,
      description: 'Standardowy komputer stacjonarny'
    },
    {
      name: 'Laptop',
      width: 1366,
      height: 768,
      icon: <Monitor className="w-4 h-4" />,
      description: 'Laptop o średniej rozdzielczości'
    },
    {
      name: 'iPad',
      width: 768,
      height: 1024,
      icon: <Tablet className="w-4 h-4" />,
      description: 'Tablet w orientacji pionowej'
    },
    {
      name: 'iPad Landscape',
      width: 1024,
      height: 768,
      icon: <Tablet className="w-4 h-4" />,
      description: 'Tablet w orientacji poziomej'
    },
    {
      name: 'iPhone 12 Pro',
      width: 390,
      height: 844,
      icon: <Smartphone className="w-4 h-4" />,
      description: 'Smartfon o wysokiej rozdzielczości'
    },
    {
      name: 'iPhone SE',
      width: 375,
      height: 667,
      icon: <Smartphone className="w-4 h-4" />,
      description: 'Kompaktowy smartfon'
    }
  ];

  const applyDeviceStyles = (device: DevicePreset) => {
    const iframe = document.querySelector('.device-preview iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.style.width = `${device.width}px`;
      iframe.style.height = `${device.height}px`;
      iframe.style.transform = device.width > 768 ? 'scale(0.5)' : 'scale(0.8)';
      iframe.style.transformOrigin = 'top left';
    }
  };

  const handleDeviceChange = (device: DevicePreset) => {
    setSelectedDevice(device);
    applyDeviceStyles(device);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Symulator Urządzeń</h1>
        <p className="text-muted-foreground mt-2">
          Testuj responsywność aplikacji na różnych urządzeniach
        </p>
      </div>

      {/* Device Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Wybierz urządzenie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {devices.map((device) => (
              <Button
                key={device.name}
                variant={selectedDevice.name === device.name ? "default" : "outline"}
                className="flex flex-col items-center gap-2 h-auto p-4"
                onClick={() => handleDeviceChange(device)}
              >
                {device.icon}
                <span className="text-xs">{device.name}</span>
                <span className="text-xs text-muted-foreground">
                  {device.width}x{device.height}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Device Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedDevice.icon}
              <div>
                <h3 className="font-semibold">{selectedDevice.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedDevice.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-lg">{selectedDevice.width} × {selectedDevice.height}</p>
              <p className="text-sm text-muted-foreground">
                Aspect ratio: {(selectedDevice.width / selectedDevice.height).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Frame */}
      <Card className="device-preview">
        <CardHeader>
          <CardTitle>Podgląd aplikacji</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden bg-muted/20">
            <iframe
              src={window.location.origin}
              className="border-0"
              style={{
                width: `${selectedDevice.width}px`,
                height: `${selectedDevice.height}px`,
                transform: selectedDevice.width > 768 ? 'scale(0.5)' : 'scale(0.8)',
                transformOrigin: 'top left'
              }}
              title={`Preview on ${selectedDevice.name}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Testing Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Lista kontrolna testów</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="nav-test" className="rounded" />
              <label htmlFor="nav-test" className="text-sm">
                Nawigacja jest dostępna i funkcjonalna
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="text-readable" className="rounded" />
              <label htmlFor="text-readable" className="text-sm">
                Tekst jest czytelny (minimum 16px na mobile)
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="buttons-touchable" className="rounded" />
              <label htmlFor="buttons-touchable" className="text-sm">
                Przyciski mają minimum 44px wysokości (iOS guidelines)
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="layout-adapts" className="rounded" />
              <label htmlFor="layout-adapts" className="text-sm">
                Layout adaptuje się do szerokości ekranu
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="no-horizontal-scroll" className="rounded" />
              <label htmlFor="no-horizontal-scroll" className="text-sm">
                Brak przewijania poziomego
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="images-scale" className="rounded" />
              <label htmlFor="images-scale" className="text-sm">
                Obrazy skalują się poprawnie
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
