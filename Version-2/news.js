//code by Iwan Brock
///////NEWS API///////

//variable for today's date
let today = new Date();
let dd = today.getDate();
let mm = today.getMonth()+1; //January is 0!
let yyyy = today.getFullYear();

//important variable that stores the number of documents returned
let pageNo = 50;

//date variable to store when articles are from | Today's date 
let date = yyyy + "-" + mm + "-" + dd;
console.log(date);
//API key
const guardianKey = "c74d21a6-2077-43bd-a78e-7256ae1a1127";

//url for guardian news
let url = "http://content.guardianapis.com/search?"+
"from-date=" + date +
"&to-date="+ date +
"&order-by=newest&show-fields=all"+
"&page-size=" + pageNo +
"&api-key=" + guardianKey;

//making the request
let xhr = new XMLHttpRequest();
xhr.open("GET", url, false);
xhr.send();
//response in JSON
let responseJSON = JSON.parse(xhr.response);

//array to hold the text
let corpus = [];

//drilling into JSON to get text
let response = responseJSON['response'];
let articles = response.results;

//corpus array to hold the documents
for (article of articles) {
    corpus.push(article.fields.bodyText);
}


//////////TFIDF/////////
//array to hold the words
let valueArray = [];

//final array

//do a concordance for the four documents
let confourdanceArray = [];
confourdanceArray = confourdance();

//calculate the TFIDF for the array of concordances
computeTFIDF(confourdanceArray);

//do a concordance for each document in the corpus
function confourdance() {
    let confourdanceArray = [];
    
    //put this before concordance
    let concordanceArgs = {
     ignoreCase: true,
     ignoreStopWords: true,
     ignorePunctuation: true,
     wordsToIgnore: ["says", "a", "b", "c", "d", "e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z" ,"1" ,"2", "3", "4", "5", "6", "7", "8", "9", "0"]
    };
    
    //loop through the documents
    for (corp of corpus) {
        //do a rita concoordance for each documents
        let concordance = RiTa.concordance(corp, concordanceArgs);
        confourdanceArray.push(concordance);
    }
    return confourdanceArray;
}

function computeTFIDF(confourdance) {  
    //pass through just 1 article at a time to the TF
    for (let i = 0; i < pageNo; i++) {
        //calculate Term Frequencies
        computeTF(confourdance[i]);
    }
    
    //loop through the value array and work out TFIDF
    for (let i = 0; i<pageNo; i++) {
        let article = valueArray[i];
        let len = article.length;
        
        //each word in the article
        for(let j=0; j<len; j++) {
            let thisWord = article[j];
            
            //formaula for TFIDF
            thisWord.tfidf = thisWord.tf * Math.log(pageNo / thisWord.df);
        }
    }

}

//compute the term frequencies
//pass the concordance for each article
function computeTF(articleConfourdance) {
    var words = [];
    //loop through the words in each article.
    Object.keys(articleConfourdance).forEach(function(key) {
        //name
        let term = key;
        //value
        let tf = articleConfourdance[key];
        
        //calculate df for the word with a function
        let df = computeDF(term);
        
        //adding those to the value object
        if (10===10) {
            let values = {
                //the word itself
                wordString : term,
                //the term freq
                tf : tf,
                //the document freq
                df : df,
                //the tfidf, which hasn't been calculated yet
                tfidf : 0
            };
            //add these words to the words array
            words.push(values);
        }
    });
    //add the whole article of words to the value array
    valueArray.push(words); 
}

//function to compute document frequencies
//this is called from within the compute TF function.
function computeDF(word) {
    //console.log(word);
    let hasWord = false;

    //variable the holds the df for this word
    let df = 0;
    
    //loop through the other documents
    for (i=0; i<pageNo; i++){
        //then loop through each word
        Object.keys(confourdanceArray[i]).forEach(function(key2) {
            //initialy say that the word is not in the document
            hasWord = false;
            //if the word appears in the document
            if (word === key2){
                //set flag to true
                hasWord = true;
            }
            //check that word appeared in the document somewhere.
            if (hasWord === true) {
                df++;    
            }
        });
        
    }
    return df;
   
}
/////////END tfidf

////BUBBLE SORT
var sortedValues = [];
//sort
for (i=0; i<pageNo; i++){
    let article = valueArray[i];
    function bubbleSort(article){
        var swapped;
        do {
            swapped = false;
            for (var i=0; i < article.length-1; i++) {
                if (article[i].tfidf < article[i+1].tfidf) {
                    var temp = article[i];
                    article[i] = article[i+1];
                    article[i+1] = temp;
                    swapped = true;
                }
            }
        } while (swapped);
        return(article);
    }
    sortedValues.push(bubbleSort(article));
}

console.log(sortedValues);
//////END sort

////grammar and sentence generation
//grammar
let rg = new RiGrammar();
//add basic structure
//two words            word1     word2
rg.addRule('<start>', '<word1> <word2>');
//rg.addRule('<word1>', 'a | the | of');

//word 1 is adjective
rg.addRule('<word1>', '<adj>');
//word 2 is noun or verb
rg.addRule('<word2>', '<n> | <v>');


//take the top number from each article
let topNumber = 25;
//array to store only the most popular words
let topWords = [];

//taking just the top couple of words
for (i=0; i<pageNo; i++){
    //select one article
    let article = sortedValues[i];
    
    //loop through the words in the article
    for (j=0; j<topNumber; j++){

        //make sure there is something there
        if(article[j]){
            //add this word to the topwords
            topWords.push(article[j]);
            
            //if the word is a verb
            if(RiTa.isVerb(article[j].wordString)) {
                //add the word to the grammar as a verb
                //console.log("pos: " + RiTa.getPosTags(word.wordString);
                rg.addRule('<v>', article[j].wordString)       
            }
            //if the word is a noun
            if(RiTa.isNoun(article[j].wordString)) {
                //add the word to the grammar as a noun
                rg.addRule('<n>', article[j].wordString)       
            }
            //if the word is an adjective
            if(RiTa.isAdjective(article[j].wordString)) {
                //add the word to the grammar as an adjective
                rg.addRule('<adj>', article[j].wordString)       
            }
        }
    }
}

//generated text array to hold sentences generated by code
let generatedText = [];

//number of sentences to generate
let numberOfSentences = 300;

//loop
console.log(rg);
for (i=0; i<numberOfSentences; i++) {
    //expand the grammar and add it to the generated text array
    generatedText.push(rg.expand());
//    console.log(rg.expand());
}

//calculating the max and min values
//initialise min and max
let max = topWords[0];
let min = topWords[0];
//loop through the top words array
for (i = 0; i<topWords.length - 1; i++) {
    // if there is a bigger value
    if (max.tfidf < topWords[i+1].tfidf) {
        //make that the max
        max = topWords[i+1];
    }
    //if there is a smaller value
    if (min.tfidf > topWords[i+1].tfidf) {
        //make that the in
        min = topWords[i+1];  
    }
}
console.log(max);
console.log(min);
/////////END max and min

////p5 JS
function setup() {
    createCanvas(500, 500);
    color(255);
    background(255, 0, 0);  
    noLoop();
    fill(255);
    stroke(0);
    strokeWeight(10);
}

function draw() {
//mouseClicked();
}

let clickCount = 0;
let gap = 1;
function mouseClicked() {
    background(255,0,0);

    //what to do
    //get first sentence
    let generatedSentence = generatedText[clickCount];
    let generatedSentence2 = generatedText[clickCount+gap];
    
    //get tfidf score for word one and two
    //draw two sentences on the canvas at a time
    //returns the positions of the sentences drawn.
    let pos1 = drawSentence(generatedSentence);
    let pos2 = drawSentence(generatedSentence2);
        
    console.log(Math.abs(pos1[0] - pos2[0]));
    console.log(Math.abs(pos1[0] - pos2[0]) < 50);
    
    console.log(Math.abs(pos1[1] - pos2[1]));
    console.log(Math.abs(pos1[1] - pos2[1]) < 50);
    
    //if the sentencs are close together
    if ( (Math.abs(pos1[0] - pos2[0]) < 50) && (Math.abs(pos1[1] - pos2[1]) < 50) ) {
        console.log("close");
        //clear the screen
        background(255,0,0);
        //increase gap to try the next sentence
        gap++;
        //try again
        mouseClicked();
    } else {
        console.log("not close");
        
        clickCount = clickCount + gap;

        gap = 1;
    }
}

function drawSentence(sentence, addition) { 

    //this is done because one the sentence is generated by RiTa, the tfidf values are lost from the words
    //this code gets the values back and draws the sentence to the screen using those values.
    //seperate the generated sentences into the individual words
    sentence = RiTa.tokenize(sentence);
    
    let word1 = sentence[0];
    let word2 = sentence[1];
    
    //these are the x and y coords.
    //get TFIDF values for the words with a function 
    word1 = getTFIDF(word1);
    word2 = getTFIDF(word2);
    
    //values for x, y, and text size, which are mapped and used to draw the text
    let mappingX = 0;
    let mappingY = 0;
    let sizeOfText = 0;

    //so we have two words with tfidf scores
    //map one to x and two to y 
    //this is the point where the words will be drawn.
    
    //use the tfidf score //min, max is too big, position on screen between 2 and 350
    mappingX = map(word1.tfidf, min.tfidf, 50, 2, width-150);
    mappingY = map(word2.tfidf, min.tfidf, 50, 5, height);
    sizeOfText = map(word1.tfidf, min.tfidf, max.tfidf, 20, 60);
    
    
    //debug information for me
    console.log("words: " + word1.wordString + "(" + word1.tfidf + ")" + ": " + word2.wordString + "(" + word2.tfidf + ")");
    console.log("x: " + mappingX);
    console.log("y: " + mappingY);
    console.log("size: " + sizeOfText);
    console.log("//////////////////");
    
    //set the text size
    textSize(sizeOfText);
    
    //console.log(mapping);
    text(word1.wordString + " " + word2.wordString, mappingX, mappingY);
    
    return([mappingX, mappingY]);
}

function getTFIDF(word) {
    //take generated word
    //loop through the top words array
    for (i=0; i<topWords.length; i++){
        //find the word
        if (word == topWords[i].wordString){
            //return the tfidf score for that word
            //or could return the full object for that word 
            return(topWords[i]);
        }
        
    }
}
//////END p5 js