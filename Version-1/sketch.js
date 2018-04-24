//////////////////////////////////////////////////////////
//This code block gets headlines from google news API
//they are added to the headline[] array
let headlines = [];
var urlNews = 'https://newsapi.org/v2/top-headlines?' +
          //change this for news website. List of sites ->https://newsapi.org/sources
          'sources=bbc-news&' +
          'apiKey=1c3c88d3e692448b83f87be2973dd61f';

//make the request
var xhr = new XMLHttpRequest();
xhr.open("GET", urlNews, false);
xhr.send();

//response
var news = JSON.parse(xhr.response);

//get the articles as JSON
articles = news.articles;
//console.log(articles);
//get the articles
for (let x = 0; x<4; x++){
    headlines.push(articles[x]['description']);
}
console.log(headlines);


//////////////////////////////////////////////////////////
//this code block splits the headlines into pairs as point objects in the points array
let headline = "";
let splitHeadlines = [];
//array to hold the points split into 4 quadrants (headlines)
let quadrants = [];

//function that creates a point object that should be pushed into the points array
function createPoint (x, y, wordX, wordY) {
    this.x = x;
    this.y = y;
    this.wordX = wordX;
    this.wordY = wordY;
} //to create a new point points.push( new point(values));

//loop through the headlines
//each loop creates an array of words
for (headline of headlines) {
    //words is an array with each word.
    let words = headline.split(' ');
    let quadrant = [];
    //loop through the words in pairs
    for (let pos = 0; pos < (words.length-1); pos = pos + 2){
        //words[pos] and words[pos+1] are the pair of words
        //create a new point object for these words
        //if length < 11 make it 11
        let x = words[pos].length;
        let y = words[pos+1].length;
        
        //check the word lenght isnt too long to fit on the graph (11)
        if (x > 11) {
            x = 11;
        }
        else if (y > 11) {
            y = 11;
        }
        
        //deal with duplicate points
        //boolean for a duplicate point
        let duplicate = false;
        //search through the quadrant
        for (let i = 0; i<quadrant.length; i++){
            //if the point is already in the array set duplicate to true
            if (x == quadrant[i].x && y == quadrant[i].y) {
                duplicate = true;  
                //console.log(quadrant[i].x + " : " + quadrant[i].y);
            }
        }
        //console.log(duplicate);
        //if the point is not a duplicate add it to the points array
        if (duplicate == false){
            let point = new createPoint(x, y, words[pos], words[pos+1]);
            quadrant.push(point); 
        }
    }
    console.log(quadrant);
    quadrants.push(quadrant);
}
//quadrants is an array with 4 arrays inside
//each array inside has the point objects for a headline.
//console.log(quadrants);
var colorArray;
let textY = 10;

function setup() {
    
    //array of colour that the dots are drawn in order
    colorArray = [color(69,255,21),//lime green 1
                color(274,255,52),//yellow 2
                color(150,115,255),//purple 3
                color(115,221,255),//light blue 4
                color(255,43,17),//red 5
                color(255,58,231),//pink 6
                color(26,139,40),//dark green 7
                color(0),//black 8
                color(255,90,0),//orange 9
                color(99, 35,0),//brown10
                color(26,23,139)//dark blue 11
                ];
    
    createCanvas(1000, 600);
    background(255);
    colorMode(RGB);
    stroke(0);
    strokeWeight(1);
    textSize(22);
    let square = 600;
    //scale for 12 rows and columns
    //hardcode this in next version for non-square canvas
    const scale = 25;
    
    //draw a grid
    drawGrid(square, scale);
    
    //draw the dots
    drawQuadrants(quadrants, colorArray);   
}

function draw() {
   
}

function drawGrid(square, scale) {
    //draw centre lines
    stroke(0);
    strokeWeight(3);
    
    line(square/2, 0, square/2, square);
    line(0, square/2, square, square/2);
    
    //draw twelve lines for each quad
    strokeWeight(1)
    for (x=0; x<square; x = x + scale){
        line(x, 0, x, square);    
        line(0, x, square, x);
    }
}

function drawQuadrants(quadrantsToDraw, colorArray) {
    let square = 600;
    translate(square/2, square/2);
    //console.log(quadrantsToDraw);
    //function for each quadrant of the grid
    drawQ1(quadrantsToDraw[0],colorArray);
    drawQ2(quadrantsToDraw[1],colorArray);
    drawQ3(quadrantsToDraw[2],colorArray);
    drawQ4(quadrantsToDraw[3],colorArray);
}

function drawQ1(quadrantToDraw, colorArray){
    let scale = 25;
    
    //loop through this quadrant array
    for (let i = 0; i < quadrantToDraw.length; i++){
        //choose the colour based on i
        fill(colorArray[i]);
        
        //get x and y position
        let x = quadrantToDraw[i].x;
        let y = quadrantToDraw[i].y;
       
        //push and pop resets the translation for each point
        push();
            //translate to correct place based on x and y and scale
            translate(scale * x, scale * -y);
            //draw an ellipse here
            ellipse(0, 0, 10, 10);  
        pop();
        
        }
}

function drawQ2(quadrantToDraw, colorArray){
    let scale = 25;

    for (let i = 0; i < quadrantToDraw.length; i++){
        fill(colorArray[i]);
        let x = quadrantToDraw[i].x;
        let y = quadrantToDraw[i].y;
        
        push();
            translate(scale * x, scale * y);
            ellipse(0, 0, 10, 10);  
        pop();
        

    }
}

function drawQ3(quadrantToDraw, colorArray){
    let scale = 25;

    
    for (let i = 0; i < quadrantToDraw.length; i++){
        fill(colorArray[i]);
        let x = quadrantToDraw[i].x;
        let y = quadrantToDraw[i].y;
        
        push();
            translate(scale * -x, scale * y);
            ellipse(0, 0, 10, 10);  
        pop();
        

    }
}

function drawQ4(quadrantToDraw, colorArray){
    let scale = 25;

    
    for (let i = 0; i < quadrantToDraw.length; i++){
        fill(colorArray[i]);
        let x = quadrantToDraw[i].x;
        let y = quadrantToDraw[i].y;

        push();
            translate(scale * -x, scale * -y);
            ellipse(0, 0, 10, 10);  
        pop();        
        
    }
}

function keyPressed() {
    //press 0 to instruct
    if (keyCode === 48) {
        //clear the text
        textY = 50;
        fill(150)
        noStroke();
        rect(625, 0, width, height);
        //loop through the quadrants
        for (i=0; i<quadrants.length; i++){
            //choose beginning point
            //beginning point is a random point in the quadrant
            quadrant = quadrants[i];
            //console.log(quadrant);
            
            //colour or position in the quadrant array
            let startPos = Math.floor(random(0, quadrant.length));
            //object of point to begin
            let startPoint = quadrant[startPos];
            
            //loop from 1 to 3 for the end points
            for (j=1; j<4; j++){
                let endQuadrant = quadrants[(i+j)%4]; 
                //colour or position in the quadrant array
                let endPos = Math.floor(random(0, endQuadrant.length));
                //object of point to begin
                let endPoint = endQuadrant[endPos];
                
                console.log(textY);
                //send the end position for color 2
                instruct(i, startPoint, endPoint , startPos, endPos, colorArray);
            }
        }
    }
    else {return false;} 
}

function instruct(quad, start, end, color1, color2, colorArray){
        
    
    //create the text to be displayed
    //         Quadrant             Draw from x:y to x:y
    let word1 = "Q" + (quad + 1) + ": Draw from (" + start.x + ", " + start.y + ") to";

    fill(colorArray[color1]);
    text(word1, 650, textY);
    
    let word2 = "(" + end.x + ", " + end.y+")";
    
    //change the color to second point
    fill(colorArray[color2]);
    //write the second point
    text(word2, 900, textY);
    
    //console.log(textY);
    textY = textY + 30;
}

