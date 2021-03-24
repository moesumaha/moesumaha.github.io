 
let selectedFile;
console.log(window.XLSX);
document.getElementById('input').addEventListener("change", (event) => {
    selectedFile = event.target.files[0];
})

let data=[{
    "name":"jayanth",
    "data":"scd",
    "abc":"sdef"
}]


document.getElementById('button').addEventListener("click", () => {
    XLSX.utils.json_to_sheet(data, 'out.xlsx');
    if(selectedFile){
        let fileReader = new FileReader();
        fileReader.readAsBinaryString(selectedFile);
        fileReader.onload = (event)=>{
         let data = event.target.result;
         let workbook = XLSX.read(data,{type:"binary"});
         console.log(workbook);
         workbook.SheetNames.forEach(sheet => {
              let rowObject = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);
              console.log(rowObject);
              document.getElementById("jsondata").innerHTML = JSON.stringify(rowObject,undefined,4)
         });
        }
    }
});

function download(){
    itemsNotFormatted = [
        {
            model: 'Samsung S7',
            chargers: '55',
            cases: '56',
            earphones: '57',
            scratched: '2'
        },
        {
            model: 'Pixel XL',
            chargers: '77',
            cases: '78',
            earphones: '79',
            scratched: '4'
        },
        {
            model: 'iPhone 7',
            chargers: '88',
            cases: '89',
            earphones: '90',
            scratched: '6'
        }
    ];
  
    var itemsFormatted = [];
  
    // format the data
    itemsNotFormatted.forEach((item) => {
        itemsFormatted.push({
            model: item.model.replace(/,/g, ''), // remove commas to avoid errors,
            chargers: item.chargers,
            cases: item.cases,
            earphones: item.earphones
        });
    });
  
    var fileTitle = 'orders'; // or 'my-unique-title'
  
    exportCSVFile(headers, itemsFormatted, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download
}