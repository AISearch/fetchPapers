//IEEExplore APi

const axios = require('axios');
const xml2js = require('xml2js');
const parseString = new xml2js.Parser({explicitArray : false}).parseString;
let webRes = "";
let NoArtPerPage = 25; //default
let pageNumber = 0;
let rs = NoArtPerPage * pageNumber;
let totalFound = 0;
let AlgorithmName = "States of Matter Search";
let urlApi = "http://ieeexplore.ieee.org/gateway/ipsSearch.jsp";
let sortParams = "&sortfield=py&sortorder=desc";


axios.get(urlApi + "?ab=" + AlgorithmName + "&hc=1")
  .then(response => {
    parseString(response.data, (err, result)=>{
      totalFound = result.root.totalfound;
      console.log("Number of Articles Found: ", totalFound);
      getNextBatch();
    })
  }).catch(error => {
    console.log(error);
  });

let getNextBatch = function(){
  rs = NoArtPerPage * pageNumber + 1;
  console.log("Loading Page:", pageNumber)
  axios.get(urlApi + "?ab='" + AlgorithmName + "'&rs=" + rs + sortParams)
    .then(response => {
      parseString(response.data, (err, result)=>{
        if (err) console.log(err);
        result.root.document.forEach( a =>{
          console.log(a.title)
          //console.log(a.abstract)
          console.log(a.py)
          console.log(a.pubtype)
        });
        pageNumber += 1
        if (NoArtPerPage * pageNumber + 1< totalFound) getNextBatch();
      })
    }).catch(error => {
      console.log(error);
    });
}
