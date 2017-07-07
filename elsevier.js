//Elsevier APi

const axios = require('axios');
let webRes = "";
let NoArtPerPage = 200; //default
let pageNumber = 0;
let rs = NoArtPerPage * pageNumber;
let totalFound = 0;
let AlgorithmName = "Whale Optimization Algorithm";
let apiKey = process.env.elsevierKey;
let urlApi = "http://api.elsevier.com/content/search/scidir?apiKey="+apiKey+"&httpAccept=application/json&content=journals";
let sortParams = "&sort=-coverDate";


axios.get(urlApi + '&query=%22' + AlgorithmName + '%22&count=1')
  .then(response => {
    console.log(response.data)
    totalFound = parseInt(response.data["search-results"]["opensearch:totalResults"]);
    console.log("Number of Articles Found: ", totalFound);
    if(totalFound) getNextBatch();
  }).catch(error => {
    console.log(error);
  });

let getNextBatch = function(){
  rs = NoArtPerPage * pageNumber;
  console.log("Loading Page:", pageNumber)
  axios.get(urlApi + '&query=%22' + AlgorithmName + '%22&count=' + NoArtPerPage+ '&start=' + rs + sortParams)
    .then(response => {
      var papers = [];
      response.data["search-results"]["entry"].forEach( a =>{
        var data = {};
        data.title = a["dc:title"];
        var authors = [];
        if(a.authors){
          a.authors.author.forEach(au => {
            authors.push(au["given-name"] + " " + au["surname"]);
          })
        }
        data.authors = authors;
        var date = a["prism:coverDisplayDate"];
        data.year = date.substring(date.length-4);
        data.pubtitle = a["prism:publicationName"];
        data.link = a.link[1]["@href"];
        papers.push(data);
      });
      console.log(papers);
      pageNumber += 1
      if (NoArtPerPage * pageNumber < totalFound) getNextBatch();
    }).catch(error => {
      console.log(error);
    });
}
