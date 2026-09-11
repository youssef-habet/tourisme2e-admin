import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateDevisPDF = (devisInfo) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(15, 118, 110); // teal-600
  doc.text("TOURISME 2E", 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Agence de Voyages et de Tourisme", 14, 26);
  doc.text("123 Avenue Mohammed V, Rabat, Maroc", 14, 31);
  doc.text("Tél : +212 5 00 00 00 00 | Email : contact@tourisme2e.ma", 14, 36);

  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 42, 196, 42);

  // Document Title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("DEVIS ESTIMATIF", 105, 55, { align: 'center' });
  
  doc.setFontSize(11);
  doc.text(`Réf : DEV-${devisInfo.id || Math.floor(Math.random() * 10000)}`, 14, 65);
  doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 14, 72);
  doc.text(`Offre : ${devisInfo.offreTitre || devisInfo.titre || 'Groupe Fermé Sur Mesure'}`, 14, 79);

  // Client Info Box
  doc.setFillColor(245, 248, 250);
  doc.roundedRect(120, 60, 76, 25, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Client :", 125, 68);
  doc.setFont("helvetica", "normal");
  doc.text(devisInfo.typeGroupeFerme || "Groupe Privé", 125, 74);
  doc.text(`Nb Participants : ${devisInfo.nbParticipants || devisInfo.capaciteMax} personnes`, 125, 80);

  // Details Table
  const tableColumn = ["Description", "Quantité", "Prix unitaire HT", "Total HT"];
  const basePrice = 6500; // Simulated base price
  const nb = devisInfo.nbParticipants || devisInfo.capaciteMax || 10;
  
  const tableRows = [
    [
      "Forfait Hébergement & Restauration\n(Base chambre double)", 
      nb.toString(), 
      `${basePrice} MAD`, 
      `${basePrice * nb} MAD`
    ],
    [
      "Transport A/R Minibus Climatisé", 
      "1", 
      "4000 MAD", 
      "4000 MAD"
    ],
    [
      "Activités Touristiques & Guide", 
      "1", 
      "2500 MAD", 
      "2500 MAD"
    ]
  ];

  const totalHT = (basePrice * nb) + 4000 + 2500;
  const tva = totalHT * 0.20;
  const totalTTC = totalHT + tva;
  const acompte = totalTTC * 0.10;

  autoTable(doc, {
    startY: 95,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' }
    }
  });

  const finalY = doc.lastAutoTable.finalY || 130;

  // Totals box
  doc.setFillColor(250, 250, 250);
  doc.rect(130, finalY + 10, 66, 35, 'F');
  
  doc.setFontSize(10);
  doc.text("Total HT :", 135, finalY + 17);
  doc.text(`${totalHT} MAD`, 190, finalY + 17, { align: 'right' });
  
  doc.text("TVA (20%) :", 135, finalY + 24);
  doc.text(`${tva} MAD`, 190, finalY + 24, { align: 'right' });
  
  doc.setFont("helvetica", "bold");
  doc.text("Total TTC :", 135, finalY + 33);
  doc.text(`${totalTTC} MAD`, 190, finalY + 33, { align: 'right' });
  
  doc.setFont("helvetica", "normal");
  doc.text("Acompte requis (10%) :", 135, finalY + 41);
  doc.text(`${acompte} MAD`, 190, finalY + 41, { align: 'right' });

  // Notes
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Conditions et Validité :", 14, finalY + 15);
  doc.text("- Ce devis est valable pour une durée de 30 jours.", 14, finalY + 20);
  doc.text("- La réservation ne sera définitive qu'à la réception de l'acompte de 10%.", 14, finalY + 25);
  doc.text("- Le solde doit être réglé 15 jours avant la date de départ.", 14, finalY + 30);
  
  if (devisInfo.besoinsSpecifiques || devisInfo.message) {
    doc.text("Remarques spécifiques au client :", 14, finalY + 40);
    doc.text(devisInfo.besoinsSpecifiques || devisInfo.message, 14, finalY + 45, { maxWidth: 100 });
  }

  // Footer
  doc.setFontSize(8);
  doc.text("Tourisme 2E - SARL au capital de 100.000 MAD - RC : 123456 - Patente : 98765432", 105, 285, { align: 'center' });

  // Save the PDF
  doc.save(`Devis_Tourisme2E_${devisInfo.id || 'Nouveau'}.pdf`);
};
