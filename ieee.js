//IEEExplore APi
const axios = require('axios');
const xml2js = require('xml2js');
const parseString = new xml2js.Parser({explicitArray : false}).parseString;
let webRes = "";
let NoArtPerPage = 1000; //default
let pageNumber = 0;
let rs = NoArtPerPage * pageNumber;
let totalFound = 0;
let AlgorithmName = "Cuckoo Search";
let urlApi = "http://ieeexplore.ieee.org/gateway/ipsSearch.jsp";
let sortParams = "&sortfield=py&sortorder=desc";


axios.get(urlApi + '?ab="' + AlgorithmName + '"&hc=1')
  .then(response => {
    parseString(response.data, (err, result)=>{
      if(!result.Error){
        totalFound = result.root.totalfound;
        console.log("Number of Articles Found: ", totalFound);
        getNextBatch();
      }
    })
  }).catch(error => {
    console.log(error);
  });

let getNextBatch = function(){
  rs = NoArtPerPage * pageNumber + 1;
  console.log("Loading Page:", pageNumber)
  axios.get(urlApi + '?ab="' + AlgorithmName + '"&rs=' + rs + sortParams + "&hc=" + NoArtPerPage)
    .then(response => {
      var papers = [];
      parseString(response.data, (err, result)=>{
        if (err) console.log(err);
        result.root.document.forEach( a =>{
          var data = {};
          data.title = a.title;
          data.authors = a.authors.split(";");
          data.year = a.py;
          data.pubtitle = a.pubtitle;
          data.link = a.mdurl;
          papers.push(data);
        });
        console.log(papers);
        pageNumber += 1
        if (NoArtPerPage * pageNumber + 1< totalFound) getNextBatch();
      })
    }).catch(error => {
      console.log(error);
    });
}
