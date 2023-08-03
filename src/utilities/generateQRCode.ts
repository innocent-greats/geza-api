var QRCode = require('qrcode')

// With async/await
export const generateQR = async (name, text) => {
	let qrCodeSVGPath = `src/assets/warehouse/certs/qrcodes/${name}.svg`
	let qrCodePNGPath = `src/assets/warehouse/certs/qrcodes/${name}.png`

  console.log('generateQR text')
  console.log(text)
    try {
      await QRCode.toFile(qrCodeSVGPath,text)
      await QRCode.toFile(qrCodePNGPath,text)
      return qrCodePNGPath
    } catch (err) {
      console.error(err)
    }
  }