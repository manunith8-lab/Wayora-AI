import { jsPDF } from 'jspdf';
import { CustomTripPlan, TravelPackage } from '../types/travel';
import { formatCurrency } from './currencyService';
import { authService } from './authService';

export function exportCustomItineraryPDF(plan: CustomTripPlan, currencyCode: string): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header Banner
  doc.setFillColor(18, 60, 54); // Primary Deep Forest Green
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('WAYORA', 20, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(217, 168, 108); // Warm Sand Gold
  doc.text('Your Journey, Your Way. • AI Concierge Plan', 20, 26);

  doc.setFontSize(9);
  doc.setTextColor(240, 240, 240);
  const travelerName = authService.getCurrentUser()?.name || 'Explorer';
  doc.text(`Generated for ${travelerName} • ${new Date().toLocaleDateString()}`, 20, 33);

  y = 52;

  // Trip Summary Card
  doc.setFillColor(247, 245, 239); // Soft Ivory
  doc.roundedRect(15, y, pageWidth - 30, 38, 3, 3, 'F');

  doc.setTextColor(38, 58, 67); // Slate Charcoal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`${plan.destination.toUpperCase()} ITINERARY`, 22, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Dates: ${plan.departureDate || 'Upcoming'} to ${plan.returnDate || 'Flexible'}`, 22, y + 18);
  doc.text(`Travelers: ${plan.travelers.adults} Adults, ${plan.travelers.children} Children • Style: ${plan.travelStyle}`, 22, y + 25);
  
  const formattedBudget = formatCurrency(plan.totalBudgetUSD, currencyCode);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(18, 60, 54);
  doc.text(`Estimated Total Budget: ${formattedBudget} (${plan.accommodationPreference})`, 22, y + 32);

  y += 50;

  // Day-by-Day schedule
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(18, 60, 54);
  doc.text('DAILY SCHEDULE & ACTIVITIES', 15, y);
  y += 8;

  plan.days.forEach((dayPlan) => {
    // Check if new page needed
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    // Day Header Pill
    doc.setFillColor(18, 60, 54);
    doc.roundedRect(15, y, 24, 7, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`DAY ${dayPlan.day}`, 18, y + 5);

    doc.setTextColor(38, 58, 67);
    doc.setFontSize(11);
    doc.text(dayPlan.title, 44, y + 5);

    y += 12;

    dayPlan.items.forEach((item) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFillColor(217, 168, 108);
      doc.circle(20, y - 1, 1.2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(18, 60, 54);
      doc.text(item.time, 24, y);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(38, 58, 67);
      doc.text(item.title, 42, y);

      if (item.costUSD > 0) {
        const costStr = formatCurrency(item.costUSD, currencyCode);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`(~${costStr})`, pageWidth - 40, y);
      }

      y += 5;

      if (item.notes) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(110, 110, 110);
        doc.text(item.notes, 42, y);
        y += 6;
      }
    });

    y += 4;
  });

  // Footer notes
  if (y > 260) {
    doc.addPage();
    y = 20;
  }
  y += 6;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text('Note: All costs are estimated. Verified pricing and bookings are handled by licensed partner providers.', 15, y);

  doc.save(`Wayora_${plan.destination.replace(/\s+/g, '_')}_Itinerary.pdf`);
}

export function exportPackagePDF(pkg: TravelPackage, currencyCode: string): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header Banner
  doc.setFillColor(18, 60, 54);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('WAYORA', 20, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(217, 168, 108);
  doc.text('Your Journey, Your Way. • Travel Package Document', 20, 26);

  y = 50;

  // Title
  doc.setTextColor(18, 60, 54);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(pkg.name, 15, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`${pkg.destinationName} • ${pkg.durationDays} Days / ${pkg.durationNights} Nights • ${pkg.category.toUpperCase()} TIER`, 15, y);

  y += 10;

  // Pricing Box
  doc.setFillColor(247, 245, 239);
  doc.roundedRect(15, y, pageWidth - 30, 26, 3, 3, 'F');

  const priceTotal = formatCurrency(pkg.priceTotalUSD, currencyCode);
  const pricePerson = formatCurrency(pkg.pricePerPersonUSD, currencyCode);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(18, 60, 54);
  doc.text(`Total Package Price: ${priceTotal}`, 22, y + 11);
  doc.setFontSize(10);
  doc.setTextColor(217, 168, 108);
  doc.text(`(${pricePerson} per person for ${pkg.travelersCount} travelers)`, 22, y + 19);

  y += 36;

  // Inclusions & Exclusions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(18, 60, 54);
  doc.text('INCLUDED IN THIS PACKAGE:', 15, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  pkg.includedFacilities.forEach((item) => {
    doc.text(`• ${item}`, 20, y);
    y += 5;
  });

  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(18, 60, 54);
  doc.text('EXCLUDED:', 15, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  pkg.excludedFacilities.forEach((item) => {
    doc.text(`- ${item}`, 20, y);
    y += 5;
  });

  doc.save(`Wayora_${pkg.destinationName}_Package.pdf`);
}
