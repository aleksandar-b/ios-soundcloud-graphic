$('article').draggable({
    handle: ".title"
});
$('button').on('click', function () {
    $('body').css('background', `url(http://upload.wikimedia.org/wikipedia/commons/d/d6/Half_Dome_from_Glacier_Point%2C_Yosemite_NP_-_Diliff.jpg) 50% no-repeat fixed`);
});


var NUMBER_OF_RECTS = 190;

SC.initialize({
    client_id: '516b790a82b7c6d89856376fa4ced361',
    redirect_uri: 'https://storymore.com/soundcloud/'
});

var audioContext = new AudioContext();
var audio = document.getElementsByTagName('audio')[0];
audio.crossOrigin = "anonymous";

var source = audioContext.createMediaElementSource(audio);
var analyser = audioContext.createAnalyser();

source.connect(analyser);
analyser.connect(audioContext.destination);

var bufferLength = analyser.frequencyBinCount;
var frequencyData = new Uint8Array(bufferLength);

var svg = document.getElementsByClassName('rects')[0];
var movingLine = document.getElementById('moving-line');
var movingLineTwo = document.getElementById('moving-line-two');
var movingLineThree = document.getElementById('moving-line-three');

let counter = 0;
for (var i = 0; i < NUMBER_OF_RECTS; i++) {

    var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", counter);
    rect.setAttribute("y", "400");
    rect.style.transform = "scale(0)";

    counter = counter + 9.16;
    svg.appendChild(rect);
}

var ml = document.createElementNS("http://www.w3.org/2000/svg", "path");
ml.setAttribute("d", "M0 400");
ml.setAttribute("stroke", "white");
ml.setAttribute("fill", "none");
ml.setAttribute("id", "moving-line");
var ml2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
ml2.setAttribute("d", "M0 200");
ml2.setAttribute("stroke", "white");
ml2.setAttribute("fill", "none");
ml2.setAttribute("id", "moving-line-two");
var ml3 = document.createElementNS("http://www.w3.org/2000/svg", "path");
ml3.setAttribute("d", "M0 400");
ml3.setAttribute("stroke", "white");
ml3.setAttribute("fill", "none");
ml3.setAttribute("id", "moving-line-three");

var rects = document.getElementsByTagName('rect');
var len = rects.length;

var counterRects = 0;
var movingLineX = 0;
var movingLineStart = 'M0 400';
var pointArrays = [];
var pointArrays2 = [];
var pointArrays3 = [];


function Render() {
    analyser.getByteFrequencyData(frequencyData);

    if (counterRects < NUMBER_OF_RECTS) {
        var num = 0;
        var num2 = 0;
        var num3 = 0;

        for (var i = 0; i < 1024; i++) {
            num += frequencyData[i];
        }
        movingLineX += 8.91;
        pointArrays.push(' L ' + movingLineX + ' ' + (300 - (num / 1024 * 2)));

        movingLine.setAttribute('d', movingLineStart + pointArrays.slice(-500).join());

        var player = rects[counterRects].animate([
            {
                transform: 'scaleY(0)'
           },
            {
                transform: `scaleY(${(num/1024)*2})`
           }], {
            duration: 800,
            iterations: 1,
            easing: 'ease-out',
            delay: 0,
            fill: 'forwards'
        });

        counter = counter + 8.16;
        counterRects++;

    } else if (counterRects === NUMBER_OF_RECTS) {

        svg.classList.remove('move');
        counterRects++;

    } else {

        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }

        svg.appendChild(ml);
        pointArrays.splice(0, pointArrays.length);

        movingLineX = 0;
        var secCounter = 0;

        for (var k = 0; k < NUMBER_OF_RECTS; k++) {
            var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");

            rect.setAttribute("x", secCounter);
            rect.setAttribute("y", "400");
            rect.style.transform = "scale(0)";
            secCounter = secCounter + 9.16;
            svg.appendChild(rect);
        }

        svg.classList.add('move');
        counterRects = 0;
        movingLine = document.getElementById('moving-line');
    }

    requestAnimationFrame(Render);
}

var isPlaying = false;
var request = new XMLHttpRequest();

request.open('GET', 'https://api.soundcloud.com/tracks/289272149/stream?client_id=237d195ad90846f5e6294ade2e8cf87b', true);
request.responseType = 'blob';

request.onload = function () {
    audio.src = window.URL.createObjectURL(request.response);
    setTimeout(function () {
        audio.play();
        Render();
    }, 1000);
}

request.send();

function getTracks(event, query) {
    if (!query) {
        return;
    }
    if (event.keyCode === 13) {
        loadingState()
        SC.get('/tracks', {
            q: query,
            limit: 6
        }).then(function (tracks) {
            loadedState()
            clearList();
            tracks.forEach(function (track) {
                addToList(track.title, track.stream_url);
            });
        });
    }
}

function loadingState() {
    document.querySelector('.list').style.display = 'none';
    document.querySelector('.loader').style.display = 'block';
}

function loadedState() {
    document.querySelector('.list').style.display = 'block';
    document.querySelector('.loader').style.display = 'none';
}

function clearList() {
    document.querySelector('.list').innerHTML = "";
}

function addToList(content, url) {
    document.querySelector('.list').appendChild(new Item(content, url).create());
}

function Item(content, url) {
    this.listItem = document.createElement('div');
    this.listItem.classList.add('item');
    this.listItem.setAttribute('data-url', url);
    this.contentSpan = document.createElement('span');
    this.contentSpan.textContent = content;
    this.contentSpan.classList.add('truncate');
    this.listItem.appendChild(this.contentSpan);

    this.create = function () {
        return this.listItem;
    }
}

$('body').on('click', '.item', function () {
    audio.pause();
    audio.setAttribute('src', $(this).data('url') + '?client_id=' + '237d195ad90846f5e6294ade2e8cf87b');
    console.log($(this).data('url'));
    audio.play();
});
SC.get('/tracks', {
    q: "All or nothing frequencies",
    limit: 6
}).then(function (tracks) {
    clearList();
    tracks.forEach(function (track) {
        addToList(track.title, track.stream_url);
    });
});
