module.exports.handler = async (event) => {
    const { createHmac } = require("node:crypto");
  
    let requestBody = event.body;
  
    if (event.isBase64Encoded) {
        requestBody = Buffer.from(requestBody, 'base64').toString('utf-8');
    }
  
    const bills = JSON.parse(requestBody);
    // Every name is encrypted
      const bills_namesEncrypted = bills.map((b) => {
          let encName = createHmac("sha256", b.name).digest('hex');
          return {
              name: encName,
              price: b.price
          };
      });
  
      // Bills are sorted
      let n = bills_namesEncrypted.length;
      let swapped;
      
      do {
          swapped = false;
          for (let i = 0; i < n - 1; i++) {
              if (bills_namesEncrypted[i].price > bills_namesEncrypted[i + 1].price) {
                  [bills_namesEncrypted[i], bills_namesEncrypted[i + 1]] = [bills_namesEncrypted[i + 1], bills_namesEncrypted[i]];
                  swapped = true;
              }
          }
          n--;
      } while (swapped);
  
      // Every object is encrypted
      const bills_hashArray = bills_namesEncrypted.map((b) => (createHmac("sha256", JSON.stringify(b)).digest('hex')));
  
      // Array object is hashed
      const bills_hash = createHmac("sha256", JSON.stringify(bills_hashArray)).digest('hex');
    
    const response = {
      statusCode: 200,
      body: bills_hash
    };
    return response;
  };
  