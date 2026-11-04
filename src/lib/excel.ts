import * as XLSX from "xlsx";

export function generateTemplate(type: "tool" | "bom"): Buffer {
  const wb = XLSX.utils.book_new();

  if (type === "tool") {
    const data = [
      {
        "Item / Machine Name": "Digital Vernier Caliper 150mm",
        "Part Number / Model": "MIT-500-196-30",
        Quantity: 1,
        "Estimated Unit Price (INR) [Optional]": 1850,
        "Purpose / Experiment": "Sensor housing prototype dimensional inspection",
        "Suggested Vendor / URL": "Mitutoyo India / https://mouser.com",
      },
      {
        "Item / Machine Name": "Soldering Fume Extractor",
        "Part Number / Model": "HAKKO-FA400",
        Quantity: 2,
        "Estimated Unit Price (INR) [Optional]": "",
        "Purpose / Experiment": "Bench fume extraction for soldering rework",
        "Suggested Vendor / URL": "Hakko Distributor",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [
      { wch: 30 },
      { wch: 22 },
      { wch: 10 },
      { wch: 35 },
      { wch: 45 },
      { wch: 35 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Tool_Equipment_Template");
  } else {
    const data = [
      {
        "Part Number (Mandatory)": "STM32F401RET6",
        "Part Name (Mandatory)": "ARM Cortex-M4 MCU 512KB Flash 84MHz LQFP-64",
        Quantity: 25,
        "Datasheet File Name (Mandatory)": "stm32f401_datasheet.pdf",
        "Source URL / Vendor (Optional)": "https://www.digikey.in/en/products/detail/stmicroelectronics/STM32F401RET6/4546538",
        "Estimated Unit Price (INR) [Optional]": 320,
      },
      {
        "Part Number (Mandatory)": "MAX30102EFD+T",
        "Part Name (Mandatory)": "High-Sensitivity Pulse Oximeter Sensor OESIP-14",
        Quantity: 25,
        "Datasheet File Name (Mandatory)": "max30102.pdf",
        "Source URL / Vendor (Optional)": "Mouser Electronics",
        "Estimated Unit Price (INR) [Optional]": 160,
      },
      {
        "Part Number (Mandatory)": "TPS62740DSSR",
        "Part Name (Mandatory)": "Ultra-Low Power Step Down Converter 360nA Iq",
        Quantity: 50,
        "Datasheet File Name (Mandatory)": "tps62740.pdf",
        "Source URL / Vendor (Optional)": "element14",
        "Estimated Unit Price (INR) [Optional]": 85,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [
      { wch: 25 },
      { wch: 45 },
      { wch: 10 },
      { wch: 32 },
      { wch: 45 },
      { wch: 35 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "BOM_Parts_Template");
  }

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return buf;
}

export interface ParsedItem {
  partNumber: string;
  partName: string;
  quantity: number;
  datasheetFileName?: string;
  optionalSource?: string;
  estimatedUnitPrice?: number;
  purpose?: string;
}

export function parseExcelBuffer(buffer: Buffer): ParsedItem[] {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rawData: Record<string, any>[] = XLSX.utils.sheet_to_json(ws);

  return rawData.map((row) => {
    const partNumber =
      row["Part Number (Mandatory)"] ||
      row["Part Number / Model"] ||
      row["Part Number"] ||
      row["Part No"] ||
      "";

    const partName =
      row["Part Name (Mandatory)"] ||
      row["Item / Machine Name"] ||
      row["Part Name"] ||
      row["Item Name"] ||
      "";

    const qty = parseInt(row["Quantity"] || row["Qty"] || "1", 10) || 1;

    const priceRaw =
      row["Estimated Unit Price (INR) [Optional]"] ||
      row["Estimated Unit Price"] ||
      row["Unit Price"] ||
      row["Price"] ||
      "";

    const price = priceRaw !== "" && !isNaN(Number(priceRaw)) ? Number(priceRaw) : undefined;

    const datasheetFileName =
      row["Datasheet File Name (Mandatory)"] ||
      row["Datasheet"] ||
      row["Datasheet File"] ||
      undefined;

    const optionalSource =
      row["Source URL / Vendor (Optional)"] ||
      row["Suggested Vendor / URL"] ||
      row["Source URL"] ||
      row["Vendor"] ||
      undefined;

    const purpose =
      row["Purpose / Experiment"] ||
      row["Purpose"] ||
      row["Justification"] ||
      undefined;

    return {
      partNumber: String(partNumber).trim(),
      partName: String(partName).trim(),
      quantity: qty,
      estimatedUnitPrice: price,
      datasheetFileName: datasheetFileName ? String(datasheetFileName).trim() : undefined,
      optionalSource: optionalSource ? String(optionalSource).trim() : undefined,
      purpose: purpose ? String(purpose).trim() : undefined,
    };
  });
}

