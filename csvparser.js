const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const folderPath = './last-week';
var fileArr=[];
const results = {};
let grandTotal = 0;

function processFile(file) {
  return new Promise((resolve) => {
    const filePath = path.join(folderPath, file);
    let fileRowCount = 0;
    

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        //---------------------Change the conditin to macth sanjay -------------------------------
        if (row.chenosis_status_code && row.chenosis_status_code === '200' && row['meta.app'] === 'ecobank_ghana_simswap_date' && row['meta.product']==='Ecobank_Ghana_Simswap_Date_Prod') {
          fileRowCount++;
          grandTotal++;
        }
      })
      .on('end', () => {
        results[file] = fileRowCount;
        fileArr.push({FileName : file , count : fileRowCount});
        //console.log(`Processed ${file}. Matching Rows Count: ${fileRowCount}`);
        resolve();
      });
  });
}

fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }
 
  const promises = files.map(processFile);

  Promise.all(promises)
    .then(() => {
      //console.log(fileArr);
                //-----------------uncommet below if you wan to save a json
       fs.writeFileSync('output.json', JSON.stringify(fileArr, null, 2));
       console.log('Final results saved to output.json');
       var data = require('./output.json');
       const sortedData = data.map(item => {
       const match = item.FileName.match(/chenosis_logs-(\d{4}-\d{2}-\d{2})/);
       const date = match ? match[1] : null;
       return { ...item, date: date ? new Date(date) : null };

      })
      .filter(item => item.date)
      .sort((a, b) => a.date - b.date);  
      //console.log(sortedData);
      sortedData.map((e)=>{

    console.log(e.FileName +"  :  "+e.count);
  })

     
      console.log('Grand Total Matching Rows:', grandTotal);
    })
    .catch((error) => {
      console.error('Error processing files:', error);
    });
});
