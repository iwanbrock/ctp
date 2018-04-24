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
rg.addRule('<1>', 'Draw a <adj> line to this point.');
rg.addRule('<2>', 'Draw a <adj> <shape> here.');
rg.addRule('<3>', 'Write the word <v/n> here.');

rg.addRule('<v/n>', '<v> | <n>');
rg.addRule('<shape>', 'square | circle | rhombus | triangle | star | rectangle');


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
let square = 600;
function setup() {
    //canvas settings
    createCanvas(1000, square);
    
    color(255);
    background(255, 0, 0); 
    drawGrid(square);

    noLoop();
    fill(255);
    stroke(0);
    strokeWeight(10);
    textSize(16);
}

function draw() {
}

let clickCount =0;
let generatedSentence = "";
function mouseClicked() {
    
    //if clickcount is even do number 1
    if (clickCount % 2 == 0 ) { //change dot location
        background(255,0,0);
        drawGrid(square);
        drawSidebar();
        
        //generate sentence 1
        generatedSentence = rg.expandFrom('<1>');
        //death with a or an
        generatedSentence = dealWithA(generatedSentence, 1);
        
        //draw a new dot position
        drawDot(generatedSentence, clickCount);    
        
    } else { //odd just change the text change text don't change the dot position
        changeText();    
    }
    
    //increase the click number every time
    clickCount = clickCount + 1;
}

function drawDot(sentence, clickCount) { 
    //this is done because one the sentence is generated by RiTa, the tfidf values are lost from the words
    //this code gets the values back and draws a point on the screen with those values
    //seperate the generated sentences into the individual words
    let sentenceTokens = RiTa.tokenize(sentence);
    

    
    //word needed defines the sentence structure we are using
    //check what sentence structure and choose the right word
    let word1 = sentenceTokens[2];
    

    //get TFIDF values for the word with a function 
    word1 = getTFIDF(word1);
    console.log(word1);    
    
    //quadrant
    // four quadrants but only changing every two clicks hence 8
    quadrant = clickCount%8; 
    console.log("quadrant = " + quadrant)
    
    
    let mappingX = 0;
    let mappingY = 0;

    //so we have 1 words with tfidf score
    //map to x and y 
    //this is the point where the point will be drawn.
    
    //use the tfidf score //min, max is too big, position on screen between 2 and 350
//    console.log("map("+word1.tfidf+", "+min.tfidf+", "+max.tfidf+", 0, 290)");
    if(word1.tfidf <10){
        mappingX = map(word1.tfidf, min.tfidf, 10, 0, (square/2 - 10));
    } else {
        mappingX = map(word1.tfidf, min.tfidf, 30, 0, (square/2 - 10));
    }
//    console.log("map("+word1.df+", 0"+", 0"+", 0, " + square/2);
    mappingY = map(word1.df, 0, 15, 0, (square/2 - 10));
    
    //first translate to middle
    push();
    translate(square/2, square/2);
    
    let spot=[]; //spot is the positive or negative x and y values.
    //depending on the quadrant you are in 
    
//    top left is negative x negative y
//    bottom left is negative x positive y
//    top right is positive x negative y
//    bottom right is positive x positive y
    switch(quadrant){
        case 0:
        case 1:
            //top right
            spot[0] = 1;
            spot[1] = -1;
            break;
            
        case 2:
        case 3:
            //bottom right
            spot[0] = 1;
            spot[1] = 1;
            break;
            
        case 4:
        case 5:
            //bottom left
            spot[0] = -1;
            spot[1] = 1;
            break;
            
        case 6:
        case 7:
            //top left
            spot[0] = -1;
            spot[1] = -1;
            break;
            
        default:
            console.log("spot error");
    }
    //moving position to a new dot
    push();
        //translate to spot
        console.log(spot);
        console.log(mappingX * spot[0] + " : " + mappingY * spot[1]); 
        translate(mappingX * spot[0], mappingY * spot[1]);
        //draw a dot
        ellipse(0,0, 5, 5);
    pop();
    
    pop();
    //write instruction
    fill(0);
    text(generatedSentence, 605, 20);
}


//function that gets the the already calculated tfidf score for the word supplied
//needed because rita takes the score away when using grammar
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

//simple funciton to draw two lines and the rectangle 
function drawGrid(square) {
    stroke(0);
    strokeWeight(3);
    //draw centre lines
    line(square/2, 0, square/2, square);
    line(0, square/2, square, square/2);
    
    //draw the white rectangle on the side
    drawSidebar();
}

//draws the white rectangle on the side of the page
function drawSidebar() {
    //draw the white rectangle
    noStroke();
    fill(255);
    rect(square, 0, 400, height);
}


// funciton to just update the instruction for when the dot doesnt move
function changeText() {
    //random chance of either sentance 2 or 3 being generated
    if(Math.random() <0.5) {  
        //genereating sentence 3
        
        //'Write the word <v/n> here.'
        generatedSentence = rg.expandFrom('<3>'); 
        
    } else {
        generatedSentence = rg.expandFrom('<2>');  
//        'Draw a <adj> <shape> here.
        generatedSentence = dealWithA(generatedSentence, 1);
        
    }
    drawSidebar();
    fill(0);
    text(generatedSentence, 605, 20);
}

//function to change a to an where appropriate
function dealWithA(text, position){
    console.log("dealing with a :: string=" + text +", position = " + position)
    //split up the sentence
    let subs = RiTa.tokenize(text);
    let subWord = subs[position+1];
    
    console.log(subWord);
    console.log("Vowel? " + subWord.substring(0, 1));
    
    //if position plus one begins with a vowel
    switch(subs[position+1].substring(0, 1)){
        case "a":
        case "e":
        case "i":
        case "o":
        case "u":
        case "A":
        case "E":
        case "I":
        case "O":
        case "U":
            //change a to an
            subs[position] = "an";
            //return the sentence
            return(RiTa.untokenize(subs));
            break;
        default:
            return(text);
    }
}
//////END p5 js