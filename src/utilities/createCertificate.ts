const fs = require("fs");
const PDFDocument = require("pdfkit");
import { saveAs } from "file-saver";
import { generateQR } from "./generateQRCode";


export async function createCertificate(commodityCertificate, receipt, orderWarehouseRecieptItems) {
  console.log('createCertificate  receipt ')
	console.log(receipt)
  const fileName = receipt.recieptID.slice(0,8)
	let pdfsPath = `src/assets/warehouse/certs/pdfs/${fileName}.pdf`
	let generatedQRCode = await generateQR(fileName,receipt.toString())

	let doc = new PDFDocument({ size: "A5", margin: 25 });
	console.log('generateHeader')
	await generatLeftHeader(doc);
	await generateRightHeader(doc);
	await generateHeaderText(doc, commodityCertificate.certificateTag);
	console.log('generateCustomerInformation')
	await generateCustomerInformation(doc, receipt);
	console.log('generateInvoiceTable')

	await generateInvoiceTable(doc,receipt,orderWarehouseRecieptItems);
	console.log('generateQRCode')
	await generateQRCode(doc, generatedQRCode);
	console.log('generateFooter')
	await generateFooter(doc);
  
	await doc.end();
	await doc.pipe(fs.createWriteStream(pdfsPath));
  
	return pdfsPath
  }

 async function generatLeftHeader(doc) {
  doc
    .image("src/assets/images/mog-zimbabwe.png", 20, 15, { width: 350 })
    .moveDown();
}
async function generateRightHeader(doc) {
  doc
    .image("src/assets/images/Umoja Exchange Logo.png", 160, 70, { width: 80 })
    .moveDown();
}

async function generateHeaderText(doc,certificateTag) {
  doc
    .fillColor("#444444")
    .fontSize(12)
    // .text("certificateTag", 150, 140)
    .text(`${certificateTag}`, 175, 160)
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
    .fontSize(12)
    .text("CertificateTag",30, 160);

  generateHr(doc, 175);

  const customerInformationTop = 190;

  doc
    .fontSize(10)
    .text("On-Chain Ledger Tracking ID:",30, customerInformationTop)
    .text(reciept?.orderTrackerHash,200, customerInformationTop)
    .text("Full Customer Name:",30, customerInformationTop + 30)
    .text(reciept?.recieptID.slice(0,8),200, customerInformationTop + 30)
    .text("Warehouse Reciept ID:",30, customerInformationTop + 45)
    .text(reciept?.recieptID.slice(0,8),200, customerInformationTop +45)
    .font("Helvetica")
    .text("Warehouse Reciept Date:",30, customerInformationTop + 60)
    .text(formatDate(new Date()), 200, customerInformationTop + 60)
    .moveDown();

  // generateHr(doc, 300);
}

 async function generateInvoiceTable(doc,reciept, orderWarehouseRecieptItems) {
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


  const customerInformationTop = 280;
  generateHr(doc, customerInformationTop+15);	

	doc
    .fillColor("#444444")
    .fontSize(12)
    .text("Commodity",30, customerInformationTop)
    .fontSize(10)
    .text("Common Name: ",30, customerInformationTop + 25)
    .text(reciept?.commodityName,200, customerInformationTop + 25)
    .text("Trading Category: ",30, customerInformationTop + 40)
    .text(reciept?.commodityCategory,200, customerInformationTop + 40)
    .text("Trading Status: ",30, customerInformationTop + 55)
    .text(reciept?.tradingStatus,200, customerInformationTop + 55)
  let i;
  const invoiceTableTop = customerInformationTop + 100;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Item",
    "Grade",
    "Weight (kg)",
    "Grading Comments",
    "Recommendations",
  );
  generateHr(doc, invoiceTableTop + 25);
  doc.font("Helvetica");

  for (i = 0; i < orderWarehouseRecieptItems.length; i++) {
    const item = orderWarehouseRecieptItems[i];
    const position = invoiceTableTop + (i + 1) * 35;
    generateTableRow(
      doc,
      position,
      item?.recieptItemID.slice(0,8),
      item.grade,
      item.commodityWeight,
      item.gradingComments,
      item.recommendation,
    );
    generateHr(doc, position + 25);
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
  grade,
  quantity,
  gradingComments,
  recommendation,
) {
  doc
    .fontSize(10)
    .text(item, 30, y)
    .text(grade, 70, y, { width: 50, align: "center" })
    .text(quantity, 120, y, { width: 50, align: "center" })
    .text(gradingComments, 170, y, { width: 100, align: "left" })
    .text(recommendation, 280, y, { width: 100, align: "left" })


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
