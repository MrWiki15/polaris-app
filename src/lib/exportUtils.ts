import jsPDF from "jspdf";
import { formatCurrency } from "./storage";

// Tipos para datos de exportación
export interface ExportData {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  summary?: { label: string; value: string | number }[];
}

/**
 * Exporta datos a PDF
 */
export const exportToPDF = (
  data: ExportData,
  filename: string = "reporte"
): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const startY = 30;
  let currentY = startY;

  // Header con título
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(data.title, margin, 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generado: ${new Date().toLocaleDateString("es-ES")}`,
    pageWidth - margin,
    25,
    { align: "right" }
  );

  currentY = 50;

  // Tabla de datos
  if (data.headers.length > 0 && data.rows.length > 0) {
    const colWidths = data.headers.map(
      () => (pageWidth - 2 * margin) / data.headers.length
    );

    // Encabezados
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, currentY - 8, pageWidth - 2 * margin, 10, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    data.headers.forEach((header, idx) => {
      doc.text(header, margin + idx * colWidths[idx] + 5, currentY);
    });

    currentY += 8;

    // Filas de datos
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    data.rows.forEach((row) => {
      // Verificar si necesitamos una nueva página
      if (currentY > pageHeight - 30) {
        doc.addPage();
        currentY = startY;

        // Redibujar encabezados en nueva página
        doc.setFillColor(243, 244, 246);
        doc.rect(margin, currentY - 8, pageWidth - 2 * margin, 10, "F");
        doc.setFont("helvetica", "bold");
        data.headers.forEach((header, idx) => {
          doc.text(header, margin + idx * colWidths[idx] + 5, currentY);
        });
        currentY += 8;
        doc.setFont("helvetica", "normal");
      }

      row.forEach((cell, idx) => {
        const cellText =
          typeof cell === "number"
            ? cell.toLocaleString("es-ES", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : String(cell);
        doc.text(
          cellText.substring(0, 20),
          margin + idx * colWidths[idx] + 5,
          currentY
        );
      });

      currentY += 7;
    });
  }

  // Resumen si existe
  if (data.summary && data.summary.length > 0) {
    currentY += 10;

    // Verificar si necesitamos una nueva página para el resumen
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = startY;
    }

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Resumen", margin, currentY);
    currentY += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    data.summary.forEach((item) => {
      doc.text(`${item.label}:`, margin, currentY);
      const valueText =
        typeof item.value === "number"
          ? item.value.toLocaleString("es-ES", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : String(item.value);
      doc.text(valueText, pageWidth - margin - 50, currentY, {
        align: "right",
      });
      currentY += 7;
    });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, {
      align: "center",
    });
  }

  doc.save(`${filename}_${new Date().toISOString().split("T")[0]}.pdf`);
};

/**
 * Exporta datos a Excel (CSV como alternativa simple)
 */
export const exportToExcel = (
  data: ExportData,
  filename: string = "reporte"
): void => {
  // Crear contenido CSV
  const csvRows: string[] = [];

  // Título
  csvRows.push(data.title);
  csvRows.push(`Generado: ${new Date().toLocaleDateString("es-ES")}`);
  csvRows.push(""); // Línea vacía

  // Encabezados
  csvRows.push(data.headers.map((h) => `"${h}"`).join(","));

  // Filas de datos
  data.rows.forEach((row) => {
    csvRows.push(
      row
        .map((cell) => {
          if (typeof cell === "number") {
            return cell.toString().replace(".", ",");
          }
          return `"${String(cell).replace(/"/g, '""')}"`;
        })
        .join(",")
    );
  });

  // Resumen si existe
  if (data.summary && data.summary.length > 0) {
    csvRows.push(""); // Línea vacía
    csvRows.push("Resumen");
    data.summary.forEach((item) => {
      const value =
        typeof item.value === "number"
          ? item.value.toString().replace(".", ",")
          : String(item.value);
      csvRows.push(`"${item.label}","${value}"`);
    });
  }

  // Crear blob y descargar
  const csvContent = csvRows.join("\n");
  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename}_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * Exporta datos a Excel usando xlsx (requiere biblioteca xlsx)
 * Si xlsx no está disponible, usa CSV como fallback
 * Para usar Excel real, instalar: npm install xlsx
 */
export const exportToExcelXLSX = async (
  data: ExportData,
  filename: string = "reporte"
): Promise<void> => {
  // Por ahora, usar CSV como formato compatible con Excel
  // CSV puede abrirse directamente en Excel y es más universal
  exportToExcel(data, filename);

  // Nota: Para usar formato .xlsx nativo, instalar la biblioteca xlsx:
  // npm install xlsx
  // Luego descomentar el código siguiente:
  /*
  try {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    const wsData: (string | number)[][] = [];
    
    wsData.push([data.title]);
    wsData.push([`Generado: ${new Date().toLocaleDateString("es-ES")}`]);
    wsData.push([]);
    wsData.push(data.headers);
    
    data.rows.forEach((row) => {
      wsData.push(row);
    });
    
    if (data.summary && data.summary.length > 0) {
      wsData.push([]);
      wsData.push(["Resumen"]);
      data.summary.forEach((item) => {
        wsData.push([item.label, item.value]);
      });
    }
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Datos");
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`);
  } catch (error) {
    console.warn("xlsx no disponible, usando CSV como alternativa");
    exportToExcel(data, filename);
  }
  */
};
