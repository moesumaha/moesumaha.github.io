
var score_card_data = JSON.parse(JSON.stringify(data));  //solves the problem
var config_data = JSON.parse(JSON.stringify(config));
var spinner = $('#loader');

$(document).ready(function(){
    // Score Card Name Append
    string = "";
    for (let index = 0; index < config_data.score_card_name.length; index++) {
        score_val = index+1;
        string+="<option value="+score_val+">"+config_data.score_card_name[index].name+"</option>"
    }
    $("#score_card").html(string);

    //  Score Card Version Append
  
    update_version();
})
var total = 0;
owner = "maha";
var api_url = "https://api.scorecardengine.com";
$(function () {
    
    $.validator.setDefaults({
      submitHandler: function () {
        alert( "Form successful submitted!" );
      }
    });
    $('#validateForm').validate({
      rules: {
            score_card: {
                required: true
            },
            version: {
                required: true
            },
            file:{
                required:true
            }
        },
        messages: {
            score_card: "Please select score card",
            version: "Version number is required"
        },
        errorElement: 'span',
        errorPlacement: function (error, element) {
            error.addClass('invalid-feedback');
            element.closest('.form-group').append(error);
        },
        highlight: function (element, errorClass, validClass) {
            $(element).addClass('is-invalid');
        },
        unhighlight: function (element, errorClass, validClass) {
            $(element).removeClass('is-invalid');
        },
        submitHandler: function(form) {
            $("#loading_wrapper").show();
            XLSX.utils.json_to_sheet(data, 'out.xlsx');
            import_data = [];
            var error = 0;
            var success = 0;
            score_card_num = $("#score_card").val();
            score_card = $('select[name=score_card] option').filter(':selected').text();
            version = $("#version").val();
            api_key = config_data.api_key;
            if(selectedFile){
                let fileReader = new FileReader();
                fileReader.readAsBinaryString(selectedFile);
                fileReader.onload = (event)=>{
                    let data = event.target.result;
                    let workbook = XLSX.read(data,{type:"binary"});
                    workbook.SheetNames.forEach(sheet => {
                        let rowObject = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);
                        json_obj = JSON.stringify(rowObject,undefined,4);
                        xls_data = JSON.parse(json_obj);
                        for (var count = 0; count < xls_data.length; count++) {
                            $.ajax({
                                type: "POST",
                                url: api_url+'/'+owner+'/scorecard/'+score_card+'/'+version,
                                data: xls_data[count],
                                dataType: 'json',
                                async: false,
                                headers: {
                                    "Api-Token": api_key
                                },
                                success: function (data){
                                    if(data.error){
                                        
                                    }else{
                                        loan_applied_amount = data["input arguments"]["Loan Applied Amount"];
                                        credit_percent = data.classifications["Customer Risk Rating"].split('%');
                                        final_score = loan_applied_amount * credit_percent[0]/100;
                                        xls_data[count]["Percentage"] = data.classifications["Customer Risk Rating"];
                                        xls_data[count]["Final Amount"] = final_score;
                                    }
                                    
                                },
                                error: function(data){
                                
                                }
                            });
                                        
                                            
                        }
                        
                        JSONToCSVConvertor(xls_data)
                    });
                    
                }
            }
          
            
        }
    });
});

$("#score_card").change(function(){
    update_version();
})



$("#version").change(function(){
    $("#accordion").text('');
    $("#success_count").text(0);
    $("#error_count").text(0);
})

document.getElementById('file').addEventListener("change", (event) => {
    selectedFile = event.target.files[0];
})

function update_version(){
    score_card_name = $("#score_card").val() -1;
    version = config_data.score_card_name[score_card_name].version;
    console.log(version);   
    option="";
    for (let index = 0; index < version.length; index++) {
        option+="<option value="+version[index]+">"+version[index]+"</option>"
    }
    $("#version").html(option)
}

function JSONToCSVConvertor(data) {
    
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof data != 'object' ? JSON.parse(data) : data;
    // ReportTitle = "Final Score";
    
    var CSV = '';    
    //Set Report title in first row or line
    
    // CSV += ReportTitle + '\r\n\n';

    //This condition will generate the Label/Header
    if (ShowLabel=true) {
        var row = "";
        
        //This loop will extract the label from 1st index of on array
        for (var index in arrData[0]) {
            
            //Now convert each value to string and comma-seprated
            row += index + ',';
        }

        row = row.slice(0, -1);
        
        //append Label row with line break
        CSV += row + '\r\n';
    }
    
    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
        var row = "";
        
        //2nd loop will extract each column and convert it in string comma-seprated
        for (var index in arrData[i]) {
            row += '"' + arrData[i][index] + '",';
        }

        row.slice(0, row.length - 1);
        
        //add a line break after each row
        CSV += row + '\r\n';
    }

    if (CSV == '') {        
        alert("Invalid data");
        return;
    }   
    
    //Generate a file name
    var fileName = "final_score";
  
    
    //Initialize file format you want csv or xls
    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
    
    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension    
    
    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");    
    link.href = uri;
    
    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".csv";
    
    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    $("#loading_wrapper").hide();
}


