//Elsevier APi

const axios = require('axios');
let webRes = "";
let NoArtPerPage = 200; //default
let pageNumber = 1;
let rs = 0;
let totalFound = 0;
let AlgorithmName = "Particle Swarm Optimization";
let apiKey = process.env.elsevierKey;
let urlApi = "http://api.elsevier.com/content/search/scidir?apiKey="+apiKey+"&httpAccept=application/json&content=journals";
let sortParams = "&sort=+coverDate";
let DateObj = new Date;
let thisYear = parseInt(DateObj.getFullYear().toString());
let startYear = 0;
let nextUrl = "";

axios.get(urlApi + '&query=%22' + AlgorithmName + '%22&count=1' + sortParams)
  .then(response => {
    //console.log(response.data)
    totalFound = parseInt(response.data["search-results"]["opensearch:totalResults"]);
    var date =response.data["search-results"]["entry"][0]["prism:coverDisplayDate"];
    startYear = parseInt(date.substring(date.length-4));
    console.log(totalFound + " Articles Found, staring at year " + startYear);
    nextUrl = urlApi + '&query=%22' + AlgorithmName + '%22&count=' + NoArtPerPage + sortParams + "&date=" + startYear;
    if(totalFound) getNextBatch();
  }).catch(error => {
    console.log(error);
  });

let getNextBatch = function(){
  console.log("Loading Page:" + pageNumber + " of year:" + startYear)
  //console.log(nextUrl);
  axios.get(nextUrl)
    .then(response => {
      var papers = [];
      response.data["search-results"]["entry"].forEach( a =>{
        try{
          var data = {};
          data.title = a["dc:title"].trim();
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
          data.doi = a["prism:doi"];
          data.link = a.link[1]["@href"];
          papers.push(data);
        }catch(e){
          console.log("Fail parse:", a);
        }
      });
      //console.log(papers);
      rs += papers.length;
      console.log(papers.length + " papers added.");
      if(response.data["search-results"].link.length == 2){
        startYear++
        nextUrl = urlApi + '&query=%22' + AlgorithmName + '%22&count=' + NoArtPerPage + sortParams + "&date=" + startYear;
        pageNumber = 1;
      }else{
        if(response.data["search-results"].link[2]["@ref"] !== "prev"){
          console.log(response.data["search-results"].link[2]["@ref"]);
          nextUrl = response.data["search-results"].link[2]["@href"];
          pageNumber += 1;
        }else{
          startYear++
          nextUrl = urlApi + '&query=%22' + AlgorithmName + '%22&count=' + NoArtPerPage + sortParams + "&date=" + startYear;
          pageNumber = 1;
        }
      }
      if (startYear <= thisYear) getNextBatch();
    }).catch(error => {
      console.log(error);
    });
}
