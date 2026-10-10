import "server-only";
import QRCode from "qrcode";

/** Inline SVG QR code in ink on a transparent background. */
export function qrSvg(value: string) {
  return QRCode.toString(value, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#1b1512ff", light: "#00000000" },
  });
}
