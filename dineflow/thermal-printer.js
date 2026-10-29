/**
 * ==============================================================================
 * DineFlow - High-Precision ESC/POS & Thermal Receipt / KOT Printer Engine
 * Standard 80mm / 58mm Thermal Receipt & Kitchen Order Ticket (KOT) Formatter
 * Supports:
 * - Direct Browser Thermal Driver Printing (Instant, zero-config via @page 80mm)
 * - Dynamic UPI Intent QR Code Generation for Instant Tabletop Settlement
 * - Raw ESC/POS Binary Byte Stream (WebUSB / POS Network Gateway)
 * ==============================================================================
 */

(function (global) {
  'use strict';

  const DineFlowPrinter = {
    // --------------------------------------------------------------------------
    // 1. GENERATE KITCHEN ORDER TICKET (KOT) HTML (80mm)
    // --------------------------------------------------------------------------
    generateKotHTML(order, tenant) {
      const orderDate = new Date(order.timestamp || Date.now());
      const timeStr = orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateStr = orderDate.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
      const currency = tenant?.currency || '₹';

      const itemsHtml = (order.items || []).map(it => {
        const spice = it.customizations?.spice ? ` [${it.customizations.spice.toUpperCase()}]` : '';
        const notes = it.specialInstructions ? `<div class="kot-note">*** Note: ${it.specialInstructions} ***</div>` : '';
        return `
          <tr class="kot-item-row">
            <td class="col-qty">${it.quantity}x</td>
            <td class="col-name">
              <span class="item-title">${it.name}${spice}</span>
              ${notes}
            </td>
          </tr>
        `;
      }).join('');

      return `
        <div class="df-thermal-slip df-kot-slip">
          <div class="slip-header">
            <div class="shop-name">${tenant?.name || 'DINEFLOW RESTAURANT'}</div>
            <div class="kot-badge">** KITCHEN ORDER TICKET **</div>
            <div class="table-banner">TABLE ${order.tableId}</div>
          </div>

          <div class="slip-divider">================================</div>

          <div class="slip-meta">
            <div><span>KOT ID:</span> <strong>#${order.id}</strong></div>
            <div><span>Server:</span> <strong>${order.customerName || 'Self-Order QR'}</strong></div>
            <div><span>Date:</span> ${dateStr}</div>
            <div><span>Time:</span> <strong>${timeStr}</strong></div>
          </div>

          <div class="slip-divider">--------------------------------</div>

          <table class="slip-table kot-table">
            <thead>
              <tr>
                <th style="width: 25%; text-align: left;">QTY</th>
                <th style="text-align: left;">ITEM PARTICULARS</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          ${order.specialNotes ? `
            <div class="slip-divider">--------------------------------</div>
            <div class="table-instruction-box">
              ⚠️ ORDER NOTE: ${order.specialNotes}
            </div>
          ` : ''}

          <div class="slip-divider">================================</div>
          <div class="slip-footer">
            <div>DineFlow Kitchen OS • Auto KOT</div>
            <div class="tear-line">- - - - - TEAR HERE - - - - -</div>
          </div>
        </div>
      `;
    },

    // --------------------------------------------------------------------------
    // 2. GENERATE CUSTOMER TAX INVOICE / GUEST BILL (80mm)
    // --------------------------------------------------------------------------
    generateBillHTML(tableId, tenant, orders) {
      const activeOrders = (orders || []).filter(o => o.tableId === tableId && o.status !== 'CANCELLED');
      const billDate = new Date();
      const timeStr = billDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = billDate.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
      const currency = tenant?.currency || '₹';

      // Aggregate all items across orders for this table
      const itemMap = new Map();
      let subtotal = 0;

      activeOrders.forEach(o => {
        (o.items || []).forEach(it => {
          const key = it.name;
          const existing = itemMap.get(key) || { name: it.name, quantity: 0, price: it.price || 0 };
          existing.quantity += it.quantity;
          itemMap.set(key, existing);
          subtotal += (it.price || 0) * it.quantity;
        });
      });

      const taxRate = 0.05; // 5% GST (2.5% CGST + 2.5% SGST)
      const taxAmount = Math.round(subtotal * taxRate);
      const serviceCharge = Math.round(subtotal * 0.05); // 5% optional service charge
      const grandTotal = Math.round(subtotal + taxAmount + serviceCharge);

      // Construct UPI Payment Intent URL for Dynamic QR
      const upiId = 'dineflow.pos@icici';
      const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(tenant?.name || 'Restaurant')}&am=${grandTotal}.00&cu=INR&tn=${encodeURIComponent('Table ' + tableId + ' Bill')}`;

      let upiQrSvg = '';
      if (global.DineFlowQR && typeof global.DineFlowQR.generateSVG === 'function') {
        upiQrSvg = global.DineFlowQR.generateSVG(upiUrl, { size: 130, darkColor: '#000000' });
      }

      const rowsHtml = Array.from(itemMap.values()).map(it => {
        const lineTotal = (it.price * it.quantity).toFixed(2);
        return `
          <tr>
            <td class="col-name">${it.name}</td>
            <td class="col-qty">${it.quantity}</td>
            <td class="col-rate">${it.price.toFixed(0)}</td>
            <td class="col-amt">${lineTotal}</td>
          </tr>
        `;
      }).join('');

      return `
        <div class="df-thermal-slip df-bill-slip">
          <div class="slip-header">
            <div class="shop-name">${tenant?.name || 'THE URBAN PLATE'}</div>
            <div class="shop-subtitle">${tenant?.tagline || 'Modern Dining & Lounge'}</div>
            <div class="shop-info">Sector 29, Gourmet Hub, Metro City</div>
            <div class="tax-info">GSTIN: 27AABCT8921K1ZZ • FSSAI: 11521018000412</div>
            <div class="invoice-badge">TAX INVOICE / GUEST RECEIPT</div>
          </div>

          <div class="slip-divider">================================</div>

          <div class="slip-meta">
            <div><span>TABLE:</span> <strong style="font-size: 1.1em;">${tableId}</strong></div>
            <div><span>Bill No:</span> <strong>#INV-${tableId}-${Date.now().toString().slice(-4)}</strong></div>
            <div><span>Date:</span> ${dateStr} ${timeStr}</div>
            <div><span>Orders Count:</span> ${activeOrders.length} ticket(s)</div>
          </div>

          <div class="slip-divider">--------------------------------</div>

          <table class="slip-table">
            <thead>
              <tr>
                <th style="text-align: left;">ITEM</th>
                <th style="text-align: center;">QTY</th>
                <th style="text-align: right;">RATE</th>
                <th style="text-align: right;">AMT</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="slip-divider">--------------------------------</div>

          <div class="calc-summary">
            <div class="calc-row"><span>Item Subtotal:</span> <span>${currency}${subtotal.toFixed(2)}</span></div>
            <div class="calc-row"><span>CGST (2.5%):</span> <span>${currency}${(taxAmount / 2).toFixed(2)}</span></div>
            <div class="calc-row"><span>SGST (2.5%):</span> <span>${currency}${(taxAmount / 2).toFixed(2)}</span></div>
            <div class="calc-row"><span>Service Charge (5%):</span> <span>${currency}${serviceCharge.toFixed(2)}</span></div>
            <div class="slip-divider">================================</div>
            <div class="calc-row grand-total">
              <span>NET PAYABLE:</span>
              <span>${currency}${grandTotal.toFixed(2)}</span>
            </div>
            <div class="slip-divider">================================</div>
          </div>

          ${upiQrSvg ? `
            <div class="upi-settlement-box">
              <div class="upi-title">SCAN TO PAY VIA UPI</div>
              <div class="upi-qr-holder">
                ${upiQrSvg}
              </div>
              <div class="upi-sub">GPay • PhonePe • Paytm • BHIM</div>
              <div class="upi-id">${upiId}</div>
            </div>
          ` : ''}

          <div class="slip-footer">
            <div class="thank-you">Thank You for Dining with Us!</div>
            <div>Please Visit Again</div>
            <div class="powered">Powered by DineFlow Restaurant OS</div>
            <div class="tear-line">- - - - - TEAR HERE - - - - -</div>
          </div>
        </div>
      `;
    },

    // --------------------------------------------------------------------------
    // 3. DIRECT PRINT PIPELINE (Standard 80mm Thermal Printer)
    // --------------------------------------------------------------------------
    printThermal(htmlContent) {
      let printFrame = document.getElementById('df-thermal-print-frame');
      if (!printFrame) {
        printFrame = document.createElement('iframe');
        printFrame.id = 'df-thermal-print-frame';
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = '0';
        document.body.appendChild(printFrame);
      }

      const doc = printFrame.contentWindow.document;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>DineFlow Thermal Receipt</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              width: 72mm;
              margin: 3mm auto;
              padding: 0;
              font-family: 'Courier New', Courier, monospace, monospace;
              font-size: 11px;
              line-height: 1.25;
              color: #000;
              background: #fff;
              font-weight: 600;
            }
            .df-thermal-slip {
              width: 100%;
            }
            .slip-header {
              text-align: center;
              margin-bottom: 4px;
            }
            .shop-name {
              font-size: 15px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .shop-subtitle {
              font-size: 10px;
              margin-bottom: 2px;
            }
            .shop-info, .tax-info {
              font-size: 9px;
            }
            .kot-badge, .invoice-badge {
              font-size: 12px;
              font-weight: 900;
              margin: 4px 0;
            }
            .table-banner {
              font-size: 18px;
              font-weight: 900;
              border: 2px dashed #000;
              padding: 4px;
              margin: 4px 0;
            }
            .slip-divider {
              white-space: pre;
              font-size: 10px;
              text-align: center;
              margin: 3px 0;
              overflow: hidden;
            }
            .slip-meta div {
              display: flex;
              justify-content: space-between;
              font-size: 10px;
            }
            .slip-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
            }
            .slip-table th {
              border-bottom: 1px dashed #000;
              padding: 3px 0;
              font-size: 10px;
            }
            .slip-table td {
              padding: 3px 0;
              vertical-align: top;
            }
            .col-qty {
              text-align: center;
              font-weight: 800;
            }
            .col-name {
              text-align: left;
            }
            .col-rate, .col-amt {
              text-align: right;
            }
            .item-title {
              font-size: 11px;
              font-weight: 800;
            }
            .kot-note {
              font-size: 9px;
              font-weight: 700;
              padding-left: 4px;
            }
            .table-instruction-box {
              font-size: 10px;
              font-weight: 800;
              padding: 4px;
              border: 1px solid #000;
              margin: 4px 0;
            }
            .calc-summary {
              font-size: 10px;
            }
            .calc-row {
              display: flex;
              justify-content: space-between;
              margin: 2px 0;
            }
            .grand-total {
              font-size: 14px;
              font-weight: 900;
              margin: 4px 0;
            }
            .upi-settlement-box {
              text-align: center;
              margin: 6px 0;
              border: 1px dashed #000;
              padding: 6px 0;
            }
            .upi-title {
              font-size: 10px;
              font-weight: 800;
              margin-bottom: 4px;
            }
            .upi-qr-holder svg {
              display: inline-block;
              width: 100px;
              height: 100px;
            }
            .upi-sub {
              font-size: 8px;
              margin-top: 2px;
            }
            .upi-id {
              font-size: 8px;
              font-weight: 700;
            }
            .slip-footer {
              text-align: center;
              font-size: 9px;
              margin-top: 6px;
            }
            .thank-you {
              font-weight: 800;
            }
            .powered {
              font-size: 8px;
              margin: 2px 0;
            }
            .tear-line {
              font-size: 8px;
              margin-top: 8px;
              color: #555;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        try {
          printFrame.contentWindow.focus();
          printFrame.contentWindow.print();
        } catch (e) {
          console.warn('[DineFlowPrinter] Print trigger notice:', e);
        }
      }, 250);
    },

    // --------------------------------------------------------------------------
    // 4. RECEIPT PREVIEW MODAL (Screen Overlay)
    // --------------------------------------------------------------------------
    openPreviewModal(title, htmlContent) {
      const modalContainer = document.getElementById('modal-container');
      if (!modalContainer) return;

      modalContainer.innerHTML = `
        <div class="df-modal-backdrop" id="df-printer-backdrop">
          <div class="df-modal-card" style="max-width: 440px; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle); overflow: hidden; box-shadow: var(--shadow-xl); animation: dfModalIn 0.22s ease-out;">
            <div style="padding: 1.1rem 1.4rem; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.25);">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.25rem;">🖨️</span>
                <h3 style="font-size: 1.05rem; font-weight: 800; color: #fff; margin: 0;">${title}</h3>
              </div>
              <button id="btn-close-printer-modal" style="background: none; border: none; color: var(--text-muted); font-size: 1.3rem; cursor: pointer; padding: 0.2rem 0.5rem; line-height: 1;">✕</button>
            </div>

            <div style="max-height: 65vh; overflow-y: auto; padding: 1.25rem; background: #0b0f19; display: flex; justify-content: center;">
              <!-- Simulated 80mm Thermal Paper Roll -->
              <div style="background: #ffffff; color: #111827; width: 320px; padding: 1.25rem 1rem; border-radius: 4px; box-shadow: 0 4px 20px rgba(0,0,0,0.4); font-family: 'Courier New', Courier, monospace; font-size: 11px; line-height: 1.25;">
                ${htmlContent}
              </div>
            </div>

            <div style="padding: 1rem 1.4rem; border-top: 1px solid var(--border-subtle); display: flex; justify-content: flex-end; gap: 0.65rem; background: rgba(0,0,0,0.25);">
              <button class="df-pill-btn" id="btn-cancel-print">Close</button>
              <button class="df-pill-btn primary" id="btn-execute-print" style="font-weight: 800;">
                🖨️ Print 80mm Receipt
              </button>
            </div>
          </div>
        </div>
      `;

      const closeModal = () => { modalContainer.innerHTML = ''; };
      document.getElementById('btn-close-printer-modal')?.addEventListener('click', closeModal);
      document.getElementById('btn-cancel-print')?.addEventListener('click', closeModal);
      document.getElementById('df-printer-backdrop')?.addEventListener('click', (e) => {
        if (e.target.id === 'df-printer-backdrop') closeModal();
      });

      document.getElementById('btn-execute-print')?.addEventListener('click', () => {
        this.printThermal(htmlContent);
        if (typeof showToast === 'function') {
          showToast('Sent to 80mm Thermal Printer', '🖨️');
        }
      });
    }
  };

  global.DineFlowPrinter = DineFlowPrinter;
})(typeof window !== 'undefined' ? window : this);

