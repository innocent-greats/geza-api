const fs = require("fs");
const PDFDocument = require("pdfkit");
import { saveAs } from "file-saver";
import { generateQR } from "./generateQRCode";


export async function createInvoice(receipt) {
  let pdfsPath = `src/assets/warehouse/certs/pdfs/${new Date().toLocaleTimeString()}.pdf`
  let generatedQRCode = await generateQR(receipt,receipt.toString())
  console.log('await generateQR generatedQRCode Path')
  console.log(generatedQRCode)
  let doc = new PDFDocument({ size: "A5", margin: 25 });

  await generateHeader(doc);
  await generateCustomerInformation(doc, receipt);
  await generateInvoiceTable(doc, receipt);
  await generateQRCode(doc, generatedQRCode);
  await generateFooter(doc);

  await doc.end();
  await doc.pipe(fs.createWriteStream(pdfsPath));

  return pdfsPath
}



 async function generateHeader(doc) {
  doc
    .image("src/assets/images/Umoja Exchange Logo.png", 170, 10, { width: 100 })
    .fillColor("#444444")
    .fontSize(12)
    .text("Warehouse Reciept Certificate", 150, 100)
    .fontSize(10)
    // .text("ACME Inc.", 200,30, { align: "center" })
    // .text("123 Main Street", 200, 65, { align: "center" })
    // .text("New York, NY, 10025", 200, 80, { align: "center" })
    .moveDown();
}

 async function generateQRCode(doc,generatedQRCode ) {
	console.log('createInvoice generatedQRCode Path')
	console.log(generatedQRCode)
	doc
	  .image(generatedQRCode, 180, 450, { width: 100 })
	  .moveDown();
  }

 async function generateCustomerInformation(doc, reciept) {
	console.log('createInvoice reciept')
	console.log(reciept)

  doc
    .fillColor("#444444")
    .fontSize(15)
    .text("Customer",30, 150);

  generateHr(doc, 170);

  const customerInformationTop = 190;

  doc
    .fontSize(10)
    .text("Reciept ID:",30, customerInformationTop)
    .text(reciept?.recieptID.slice(0,8),150, customerInformationTop)
    .font("Helvetica")
    .text("Reciept Date:",30, customerInformationTop + 15)
    .text(formatDate(new Date()), 150, customerInformationTop + 15)
    .moveDown();

  generateHr(doc, 300);
}

 async function generateInvoiceTable(doc, orderWarehouseRecieptItems) {
	console.log('createInvoice orderWarehouseRecieptItems')
	console.log(orderWarehouseRecieptItems)
  // Reciept {
  //   orderTrackerHash: '4a9a23dbf1ec549cbd630bf776b5259ff936e1ec475bcfd91424ef0fe0e06a54',
  //   commodityID: '7afab425-d31c-4b4c-ba5e-9e16eac9a463',
  //   commodityName: 'commodity',
  //   commodityCategory: 'grains',
  //   orderStatus: 'commodity-graded',
  //   warehouseAccountID: '18c0f3bb-1bfe-4daa-928b-41aaf535664e',
  //   tradingStatus: null,
  //   recieptID: '9e05bdd8-0b27-48ac-a103-2c52e0431040',
  //   createdDate: 2023-05-05T21:49:37.214Z
  // }
  // generateInvoiceTable
  // createInvoice orderWarehouseRecieptItems
  // [
  //   RecieptItem {
  //     recieptItemID: '1c1a3d0d-7601-4f06-8920-f54487f7a3fc',
  //     createdDate: 2023-05-05T21:49:37.218Z,
  //     recieptID: '9e05bdd8-0b27-48ac-a103-2c52e0431040',
  //     commodityName: 'commodity',
  //     commodityCategory: 'grains',
  //     grade: '0',
  //     gradingComments: '0',
  //     recommendation: '0',
  //     commodityWeight: 10
	doc
    .fillColor("#444444")
    .fontSize(15)
    .text("Commodity",30, 250);
    

  generateHr(doc, 350);	
  let i;
  const invoiceTableTop = 280;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Item",
    "Description",
    "Quantity",
    "Grade",
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  for (i = 0; i < orderWarehouseRecieptItems.length; i++) {
    const item = orderWarehouseRecieptItems[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.commodityName,
      item.grade,
      item.gradingComments,
      item.commodityWeight,
    );
    generateHr(doc, position + 20);
  }

  doc.font("Helvetica");
}

 async function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      "Share this QRCode for digital certificate warehouse reciept public data",
      50,
      550,
      { align: "center", width:320 }
    );
}

 async function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
) {
  doc
    .fontSize(10)
    .text(item, 30, y)
    .text(description, 150, y)
    .text(unitCost, 200, y, { width: 90, align: "right" })
    .text(quantity, 280, y, { width: 90, align: "right" })

}

 async function generateHr(doc, y) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(30, y)
    .lineTo(400, y)
    .stroke();
}

function formatCurrency(cents) {
  return "$" + (cents / 100).toFixed(2);
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + "/" + month + "/" + day;
}
